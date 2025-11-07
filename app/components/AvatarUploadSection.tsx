"use client";
import { useState } from "react";
import { Upload, User, Loader2 } from "lucide-react";
import Image from "next/image";

type AvatarUploadSectionProps = {
  currentAvatar?: string | null;
  userName: string;
  onAvatarChange?: (url: string) => void;
};

export default function AvatarUploadSection({ 
  currentAvatar, 
  userName,
  onAvatarChange 
}: AvatarUploadSectionProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte nur Bilddateien hochladen');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Datei zu groß. Maximal 5MB erlaubt.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      const data = await response.json();
      setPreview(data.avatarUrl);
      if (onAvatarChange) {
        onAvatarChange(data.avatarUrl);
      }
      
      // Reload page to show new avatar
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError('Fehler beim Hochladen des Bildes');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex-shrink-0 shadow-xl">
        {preview ? (
          <Image
            src={preview}
            alt={userName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 128px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 dark:text-slate-400" />
          </div>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <label
          htmlFor="avatar-upload"
          className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all duration-200 shadow-lg ${
            uploading 
              ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
              : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 cursor-pointer text-white'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              Wird hochgeladen...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              Profilbild ändern
            </>
          )}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          JPG, PNG oder GIF. Max 5MB.
        </p>
        {error && (
          <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
