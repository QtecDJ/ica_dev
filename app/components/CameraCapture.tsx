"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, ArrowLeft, Check, X, Loader, Image as ImageIcon, ScanText, FileText } from "lucide-react";
import { createWorker } from 'tesseract.js';

interface CameraCaptureProps {
  onBack: () => void;
}

export default function CameraCapture({ onBack }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Rückkamera bei Smartphones
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Kamera-Fehler:", err);
      setError("Kamera-Zugriff fehlgeschlagen. Bitte Berechtigungen prüfen.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);
      stopCamera();
      performOCR(imageData);
    }
  };

  const preprocessImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageData);
          return;
        }

        // Höhere Auflösung für bessere OCR
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Bild mit höherer Qualität zeichnen
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Kontrast und Helligkeit verbessern + Graustufen
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // In Graustufen konvertieren für bessere OCR
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;     // Red
          data[i + 1] = gray; // Green
          data[i + 2] = gray; // Blue
        }

        // Kontrast verstärken
        const factor = 1.8; // Höherer Kontrast-Faktor
        const intercept = 128 * (1 - factor);

        for (let i = 0; i < data.length; i += 4) {
          // Kontrast auf jeden Kanal anwenden
          let r = data[i] * factor + intercept;
          let g = data[i + 1] * factor + intercept;
          let b = data[i + 2] * factor + intercept;
          
          // Clipping auf 0-255
          data[i] = Math.max(0, Math.min(255, r));
          data[i + 1] = Math.max(0, Math.min(255, g));
          data[i + 2] = Math.max(0, Math.min(255, b));
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = imageData;
    });
  };

  const performOCR = async (imageData: string) => {
    setIsProcessing(true);
    setOcrProgress(0);
    setError("");

    try {
      // Bild vorverarbeiten für bessere OCR
      setOcrProgress(10);
      const processedImage = await preprocessImage(imageData);
      
      setOcrProgress(20);
      
      // Worker mit optimierten Einstellungen erstellen
      const worker = await createWorker('deu', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(20 + Math.round(m.progress * 70));
          }
        }
      });

      // Tesseract konfigurieren für bessere Erkennung
      await worker.setParameters({
        tessedit_pageseg_mode: '3', // Automatische Seitensegmentierung ohne OSD (stabiler)
        preserve_interword_spaces: '1', // Leerzeichen zwischen Wörtern erhalten
      });

      setOcrProgress(90);
      const { data } = await worker.recognize(processedImage);
      
      // Text nachbearbeiten
      let cleanedText = data.text
        .replace(/\n\n+/g, '\n\n') // Mehrfache Leerzeilen entfernen
        .trim();
      
      setOcrText(cleanedText);
      setOcrProgress(100);
      
      await worker.terminate();
    } catch (err) {
      console.error("OCR-Fehler:", err);
      setError("Text-Erkennung fehlgeschlagen. Bitte versuche es mit einem schärferen Foto.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB Limit
      setError("Datei zu groß. Maximum 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCapturedImage(imageData);
      stopCamera();
      performOCR(imageData);
    };
    reader.readAsDataURL(file);
  };

  const savePhoto = async () => {
    if (!capturedImage) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/coach/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_data: capturedImage,
          ocr_text: ocrText,
          notes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern");
      }

      // Zurück zur Übersicht
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setIsSaving(false);
    }
  };

  const saveAsNote = async () => {
    if (!ocrText) {
      setError("Kein Text erkannt, der gespeichert werden kann");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/coach/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notes || "Foto-Notiz vom " + new Date().toLocaleDateString('de-DE'),
          content: ocrText,
          category: "allgemein",
          color: "blue",
          tags: "foto, ocr",
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen der Notiz");
      }

      alert("✅ Text als Notiz gespeichert!");
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Notiz speichern fehlgeschlagen");
    } finally {
      setIsSaving(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setOcrText("");
    setOcrProgress(0);
    setNotes("");
    startCamera();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-slate-50 dark:bg-slate-900 py-4 z-10">
        <button onClick={onBack} className="btn-ghost !p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Foto aufnehmen
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Mit automatischer Text-Erkennung
          </p>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Camera View */}
      {!capturedImage && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] lg:aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tipps für bessere OCR */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              📸 Tipps für bessere Texterkennung:
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
              <li>Gutes, gleichmäßiges Licht nutzen</li>
              <li>Text gerade und frontal fotografieren</li>
              <li>Ausreichend nah herangehen (scharf!)</li>
              <li>Verwackeln vermeiden</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={capturePhoto}
              disabled={!stream}
              className="btn-primary flex-1 text-lg py-4"
            >
              <Camera className="w-6 h-6" />
              Foto aufnehmen
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary px-6"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Preview & OCR */}
      {capturedImage && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-auto"
            />
          </div>

          {/* OCR Progress */}
          {isProcessing && (
            <div className="card">
              <div className="card-body space-y-3">
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm font-medium">Text wird erkannt...</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
                  {ocrProgress}%
                </div>
              </div>
            </div>
          )}

          {/* OCR Result */}
          {ocrText && !isProcessing && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScanText className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Erkannter Text</h3>
                  </div>
                  <button
                    onClick={saveAsNote}
                    disabled={isSaving}
                    className="btn-secondary text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Als Notiz speichern
                  </button>
                </div>
              </div>
              <div className="card-body">
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  className="input min-h-[150px] font-mono text-sm"
                  placeholder="Erkannter Text erscheint hier..."
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card">
            <div className="card-body">
              <label className="label">Notizen (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Zusätzliche Notizen zum Foto..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={retakePhoto}
              disabled={isSaving}
              className="btn-secondary flex-1"
            >
              <X className="w-5 h-5" />
              Neu aufnehmen
            </button>
            <button
              onClick={savePhoto}
              disabled={isSaving || isProcessing}
              className="btn-primary flex-1"
            >
              {isSaving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Speichern
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
