"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, FileText, Users, Clock, Tag, Trash2 } from "lucide-react";

interface Team {
  id: number;
  name: string;
  level: string;
}

interface Event {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  event_type: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  max_participants: number | null;
  is_mandatory: boolean;
}

export default function EditEventForm({ 
  event, 
  teams,
  selectedTeamIds 
}: { 
  event: Event;
  teams: Team[];
  selectedTeamIds: number[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    event_type: event.event_type,
    location: event.location,
    event_date: event.event_date.split('T')[0], // Format: YYYY-MM-DD
    start_time: event.start_time || "",
    end_time: event.end_time || "",
    max_participants: event.max_participants?.toString() || "",
    is_mandatory: event.is_mandatory,
    notes: event.notes || "",
    selectedTeams: selectedTeamIds,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleTeamToggle = (teamId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamId)
        ? prev.selectedTeams.filter((id) => id !== teamId)
        : [...prev.selectedTeams, teamId],
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Titel ist erforderlich";
    if (!formData.event_date) return "Datum ist erforderlich";
    if (!formData.location.trim()) return "Ort ist erforderlich";
    if (!formData.event_type) return "Event-Typ ist erforderlich";

    // Zeit-Validierung
    if (formData.start_time && formData.end_time) {
      if (formData.end_time <= formData.start_time) {
        return "Endzeit muss nach der Startzeit liegen";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Aktualisieren des Events");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/events/${event.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Löschen des Events");
      }

      router.push("/events");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          Event erfolgreich aktualisiert! Weiterleitung...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basis-Informationen */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Basis-Informationen
          </h2>

          <div>
            <label htmlFor="title" className="label">
              Titel *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Beschreibung
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event_type" className="label">
                Event-Typ *
              </label>
              <select
                id="event_type"
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Bitte wählen...</option>
                <option value="training">Training</option>
                <option value="competition">Wettkampf</option>
                <option value="showcase">Showcase</option>
                <option value="workshop">Workshop</option>
                <option value="meeting">Meeting</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="label">
                Ort *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Datum & Zeit */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Datum & Zeit
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="event_date" className="label">
                Datum *
              </label>
              <input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="start_time" className="label">
                Startzeit
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="end_time" className="label">
                Endzeit
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Teilnehmer */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            Teilnehmer
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="max_participants" className="label">
                Max. Teilnehmer
              </label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                min="1"
                className="input"
                placeholder="Unbegrenzt"
              />
            </div>

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="is_mandatory"
                name="is_mandatory"
                checked={formData.is_mandatory}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_mandatory" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                Pflichtveranstaltung
              </label>
            </div>
          </div>

          <div>
            <label className="label">Teams auswählen (optional)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => handleTeamToggle(team.id)}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedTeams.includes(team.id)}
                    onChange={() => handleTeamToggle(team.id)}
                    className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {team.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {team.level}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Änderungen an Teams fügen neue Teilnehmer hinzu oder entfernen sie.
            </p>
          </div>
        </div>

        {/* Notizen */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Zusätzliche Informationen
          </h2>

          <div>
            <label htmlFor="notes" className="label">
              Notizen
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="input resize-none"
              placeholder="Zusätzliche Informationen, Hinweise, etc."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "Wird gespeichert..." : "Änderungen speichern"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
            Event löschen
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Event löschen?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Bist du sicher, dass du dieses Event löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Wird gelöscht..." : "Ja, löschen"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
