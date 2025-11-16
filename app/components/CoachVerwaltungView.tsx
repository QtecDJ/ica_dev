"use client";

import { useState } from "react";
import { Camera, Music, FileText, Image, Search, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CameraCapture from "./CameraCapture";
import MusicPlayer from "./MusicPlayer";
import NotesManager from "./NotesManager";
import MediaGallery from "./MediaGallery";

type View = "overview" | "camera" | "music" | "notes" | "gallery";

export default function CoachVerwaltungView() {
  const [currentView, setCurrentView] = useState<View>("overview");

  const renderView = () => {
    switch (currentView) {
      case "camera":
        return <CameraCapture onBack={() => setCurrentView("overview")} />;
      case "music":
        return <MusicPlayer onBack={() => setCurrentView("overview")} />;
      case "notes":
        return <NotesManager onBack={() => setCurrentView("overview")} />;
      case "gallery":
        return <MediaGallery onBack={() => setCurrentView("overview")} />;
      default:
        return <OverviewGrid onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="container-page mobile-container min-h-screen pb-24 lg:pb-8">
      {renderView()}
    </div>
  );
}

function OverviewGrid({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 pb-4 pt-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/" className="btn-ghost !p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-50">
              Coach Verwaltung
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Fotos, Musik, Notizen und mehr
            </p>
          </div>
        </div>
      </div>

      {/* Mobile-First Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Kamera & Fotos */}
        <button
          onClick={() => onNavigate("camera")}
          className="card hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <div className="card-body text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Kamera & Fotos
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Fotos aufnehmen mit Text-Erkennung
              </p>
            </div>
          </div>
        </button>

        {/* Foto-Galerie */}
        <button
          onClick={() => onNavigate("gallery")}
          className="card hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <div className="card-body text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
              <Image className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Galerie & OCR
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Gespeicherte Fotos durchsuchen
              </p>
            </div>
          </div>
        </button>

        {/* Musik Player */}
        <button
          onClick={() => onNavigate("music")}
          className="card hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <div className="card-body text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
              <Music className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Musik Player
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Google Drive Musik abspielen
              </p>
            </div>
          </div>
        </button>

        {/* Notizen */}
        <button
          onClick={() => onNavigate("notes")}
          className="card hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <div className="card-body text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Notizen
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Trainings-Notizen verwalten
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body py-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Fotos</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Songs</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Notizen</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">OCR Texte</div>
          </div>
        </div>
      </div>
    </>
  );
}
