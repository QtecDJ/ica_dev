"use client";
import { useState } from "react";
import { Upload, User } from "lucide-react";
import Image from "next/image";

type AvatarUploadProps = {
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
};

export default function AvatarUpload({ currentAvatar, onAvatarChange }: AvatarUploadProps) {
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
      onAvatarChange(data.avatarUrl);
    } catch (err) {
      setError('Fehler beim Hochladen des Bildes');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Profilbild
      </label>
      
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
          {preview ? (
            <Image
              src={preview}
              alt="Avatar preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <label
            htmlFor="avatar-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Wird hochgeladen...' : 'Bild auswählen'}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG oder GIF. Max 5MB.
          </p>
          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
