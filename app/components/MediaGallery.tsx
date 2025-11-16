"use client";

import { ArrowLeft } from "lucide-react";

interface MediaGalleryProps {
  onBack: () => void;
}

export default function MediaGallery({ onBack }: MediaGalleryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="btn-ghost !p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">Foto-Galerie</h2>
      </div>
      <div className="card">
        <div className="card-body text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            Galerie wird geladen...
          </p>
        </div>
      </div>
    </div>
  );
}
