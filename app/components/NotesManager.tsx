"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Pin, PinOff, Search, FileText, Loader, Check, X, Tag as TagIcon } from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  category?: string;
  color: string;
  is_pinned: boolean;
  tags?: string;
  created_at: string;
  updated_at: string;
}

interface NotesManagerProps {
  onBack: () => void;
}

const CATEGORIES = ["training", "choreografie", "organisation", "allgemein"];
const COLORS = ["gray", "red", "orange", "yellow", "green", "blue", "purple", "pink"];

export default function NotesManager({ onBack }: NotesManagerProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/coach/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Notizen:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (noteId: number, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/coach/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: !isPinned }),
      });

      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error("Fehler beim Pinnen:", error);
    }
  };

  const deleteNote = async (noteId: number) => {
    if (!confirm("Notiz wirklich löschen?")) return;

    try {
      const response = await fetch(`/api/coach/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.tags?.toLowerCase().includes(searchLower)
    );
  });

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.is_pinned);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-slate-50 dark:bg-slate-900 py-4 z-10">
        <button onClick={onBack} className="btn-ghost !p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Notizen
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {notes.length} Notizen
          </p>
        </div>
        <button
          onClick={() => {
            setEditingNote(null);
            setShowAddForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Neu</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Notizen durchsuchen..."
          className="input pl-10"
        />
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <NoteForm
          note={editingNote}
          onClose={() => {
            setShowAddForm(false);
            setEditingNote(null);
          }}
          onSaved={() => {
            setShowAddForm(false);
            setEditingNote(null);
            fetchNotes();
          }}
        />
      )}

      {/* Notes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : notes.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Keine Notizen vorhanden
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Erstelle deine erste Notiz oder importiere Text aus einem Foto
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary mx-auto"
            >
              <Plus className="w-5 h-5" />
              Notiz erstellen
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">
                Angeheftet
              </h3>
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => {
                    setEditingNote(note);
                    setShowAddForm(true);
                  }}
                  onDelete={() => deleteNote(note.id)}
                  onTogglePin={() => togglePin(note.id, note.is_pinned)}
                />
              ))}
            </div>
          )}

          {/* Regular Notes */}
          {unpinnedNotes.length > 0 && (
            <div className="space-y-2">
              {pinnedNotes.length > 0 && (
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1 mt-6">
                  Weitere Notizen
                </h3>
              )}
              {unpinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => {
                    setEditingNote(note);
                    setShowAddForm(true);
                  }}
                  onDelete={() => deleteNote(note.id)}
                  onTogglePin={() => togglePin(note.id, note.is_pinned)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const colorClasses: Record<string, string> = {
    gray: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    pink: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[note.color] || colorClasses.gray}`}>
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
            {note.title}
          </h3>
          {note.category && (
            <span className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {note.category}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onTogglePin}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            {note.is_pinned ? (
              <PinOff className="w-4 h-4 text-orange-600" />
            ) : (
              <Pin className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-3">
        {note.content}
      </p>

      {note.tags && (
        <div className="flex gap-1 flex-wrap mt-2">
          {note.tags.split(',').map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        {new Date(note.updated_at).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}

function NoteForm({
  note,
  onClose,
  onSaved,
}: {
  note: Note | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    title: note?.title || "",
    content: note?.content || "",
    category: note?.category || "",
    color: note?.color || "gray",
    tags: note?.tags || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = note ? `/api/coach/notes/${note.id}` : "/api/coach/notes";
      const method = note ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="card-header">
          <h3 className="text-lg font-semibold">
            {note ? "Notiz bearbeiten" : "Neue Notiz"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4">
          {error && <div className="alert-error">{error}</div>}

          <div>
            <label className="label">Titel *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Titel der Notiz"
              required
            />
          </div>

          <div>
            <label className="label">Inhalt *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input min-h-[200px]"
              placeholder="Notizinhalt..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Kategorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="">Keine Kategorie</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Farbe</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? "border-slate-900 dark:border-slate-50 scale-110"
                        : "border-slate-300 dark:border-slate-600"
                    } bg-${color}-200 dark:bg-${color}-800`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Tags (komma-getrennt)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input"
              placeholder="training, choreo, wichtig"
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
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
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
        </form>
      </div>
    </div>
  );
}
