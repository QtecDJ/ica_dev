"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader, Trash2, Edit2, Music as MusicIcon } from "lucide-react";

interface Song {
  id: number;
  title: string;
  artist?: string;
  gdrive_link: string;
  gdrive_file_id?: string;
  duration?: number;
  tags?: string;
  notes?: string;
}

interface MusicPlayerProps {
  onBack: () => void;
}

export default function MusicPlayer({ onBack }: MusicPlayerProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong]);

  const fetchSongs = async () => {
    try {
      const response = await fetch("/api/coach/music");
      if (response.ok) {
        const data = await response.json();
        setSongs(data.songs);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractGDriveFileId = (link: string): string | null => {
    // Extrahiere File ID aus verschiedenen GDrive Link-Formaten
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/open\?id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getDirectPlaybackUrl = (gdriveLink: string): string => {
    const fileId = extractGDriveFileId(gdriveLink);
    if (fileId) {
      // Mehrere Playback-URLs versuchen (Google Drive kann verschiedene Formate haben)
      // Format 1: Direkter Download
      // Format 2: Embedded Player
      // Format 3: Docs Viewer
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return gdriveLink;
  };

  // Fallback: Wenn primäre URL nicht funktioniert
  const handleAudioError = () => {
    if (currentSong && audioRef.current) {
      const fileId = extractGDriveFileId(currentSong.gdrive_link);
      if (fileId) {
        // Versuche alternative URL
        const alternativeUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
        console.log("Trying alternative URL:", alternativeUrl);
        audioRef.current.src = alternativeUrl;
        audioRef.current.load();
      }
    }
  };

  const playSong = (song: Song) => {
    if (currentSong?.id === song.id && isPlaying) {
      // Pause current song
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      
      // Update play count
      fetch(`/api/coach/music/${song.id}/play`, { method: "POST" });
    }
  };

  const playNext = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex]);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (currentSong && audioRef.current && isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Playback error:", err);
        setIsPlaying(false);
      });
    }
  }, [currentSong, isPlaying]);

  return (
    <div className="space-y-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-slate-50 dark:bg-slate-900 py-4 z-10">
        <button onClick={onBack} className="btn-ghost !p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Musik Player
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Google Drive Musik
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Song</span>
        </button>
      </div>

      {/* Add Song Form */}
      {showAddForm && (
        <AddSongForm
          onClose={() => setShowAddForm(false)}
          onSongAdded={() => {
            setShowAddForm(false);
            fetchSongs();
          }}
        />
      )}

      {/* Playlist */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : songs.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <MusicIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Keine Songs vorhanden
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Füge deinen ersten Song aus Google Drive hinzu
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary mx-auto"
            >
              <Plus className="w-5 h-5" />
              Song hinzufügen
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song) => (
            <div
              key={song.id}
              className={`card cursor-pointer transition-all ${
                currentSong?.id === song.id
                  ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              onClick={() => playSong(song)}
            >
              <div className="card-body !py-3 flex flex-row items-center gap-3">
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    currentSong?.id === song.id && isPlaying
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {currentSong?.id === song.id && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-slate-50 truncate">
                    {song.title}
                  </div>
                  {song.artist && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {song.artist}
                    </div>
                  )}
                </div>

                {song.tags && (
                  <div className="hidden sm:flex gap-1 flex-wrap">
                    {song.tags.split(',').slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Controls - Sticky Bottom */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 xl:left-72 2xl:left-80 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 z-50">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Song Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <MusicIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 dark:text-slate-50 truncate">
                  {currentSong.title}
                </div>
                {currentSong.artist && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {currentSong.artist}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={seek}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={playPrevious}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <button
                onClick={toggleMute}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={getDirectPlaybackUrl(currentSong.gdrive_link)}
          preload="metadata"
          onError={handleAudioError}
          crossOrigin="anonymous"
        />
      )}
    </div>
  );
}

function AddSongForm({ onClose, onSongAdded }: { onClose: () => void; onSongAdded: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    gdrive_link: "",
    tags: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/coach/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Hinzufügen");
      }

      onSongAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Song hinzufügen</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          {error && (
            <div className="alert-error">{error}</div>
          )}

          <div>
            <label className="label">Titel *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Song-Titel"
              required
            />
          </div>

          <div>
            <label className="label">Künstler</label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="input"
              placeholder="Künstler-Name"
            />
          </div>

          <div>
            <label className="label">Google Drive Link *</label>
            <input
              type="url"
              value={formData.gdrive_link}
              onChange={(e) => setFormData({ ...formData, gdrive_link: e.target.value })}
              className="input"
              placeholder="https://drive.google.com/file/d/..."
              required
            />
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                📝 So erstellst du einen Google Drive Link:
              </p>
              <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Lade die Musik-Datei in Google Drive hoch</li>
                <li>Rechtsklick auf die Datei → "Freigeben"</li>
                <li>Wähle "Jeder mit dem Link" → "Betrachter"</li>
                <li>Klicke auf "Link kopieren"</li>
                <li>Füge den Link hier ein</li>
              </ol>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                ✅ Unterstützte Formate: MP3, WAV, OGG, M4A
              </p>
            </div>
          </div>

          <div>
            <label className="label">Tags (komma-getrennt)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input"
              placeholder="warm-up, cool-down, choreografie"
            />
          </div>

          <div>
            <label className="label">Notizen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Zusätzliche Informationen..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Wird hinzugefügt...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Hinzufügen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
