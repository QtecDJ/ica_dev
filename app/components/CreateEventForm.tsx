"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, FileText, Users, AlertCircle, CheckCircle, Tag } from "lucide-react";

interface Team {
  id: number;
  name: string;
  level: string;
}

interface Props {
  teams: Team[];
}

export default function CreateEventForm({ teams }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    event_type: "training" as "competition" | "showcase" | "training" | "workshop" | "meeting" | "other",
    notes: "",
    max_participants: "",
    is_mandatory: false,
    selected_teams: [] as number[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validierung
    if (!formData.title || !formData.event_date || !formData.location) {
      setError("Bitte fülle alle Pflichtfelder aus");
      setIsLoading(false);
      return;
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      setError("Die Endzeit muss nach der Startzeit liegen");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Erstellen des Events");
      }

      setSuccess("Event erfolgreich erstellt!");
      setTimeout(() => {
        router.push(`/events/${data.event.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTeam = (teamId: number) => {
    setFormData(prev => ({
      ...prev,
      selected_teams: prev.selected_teams.includes(teamId)
        ? prev.selected_teams.filter(id => id !== teamId)
        : [...prev.selected_teams, teamId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="card-body space-y-6">
        {error && (
          <div className="alert-error flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="alert-success flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {/* Basis-Informationen */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
            Basis-Informationen
          </h2>

          <div>
            <label className="label">
              Event-Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="z.B. Regionale Meisterschaft 2025"
              required
            />
          </div>

          <div>
            <label className="label">
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Detaillierte Beschreibung des Events..."
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <Tag className="w-4 h-4" />
                Event-Typ *
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value as any })}
                className="input"
                required
              >
                <option value="training">Training</option>
                <option value="competition">Wettkampf</option>
                <option value="showcase">Showcase</option>
                <option value="workshop">Workshop</option>
                <option value="meeting">Meeting</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>

            <div>
              <label className="label">
                <MapPin className="w-4 h-4" />
                Ort *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="z.B. Sporthalle München"
                required
              />
            </div>
          </div>
        </div>

        {/* Datum & Zeit */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Datum & Zeit
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">
                Datum *
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">
                <Clock className="w-4 h-4" />
                Startzeit
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label">
                <Clock className="w-4 h-4" />
                Endzeit
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Teilnehmer */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Teilnehmer
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Maximale Teilnehmer (optional)
              </label>
              <input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                className="input"
                placeholder="Unbegrenzt"
                min="1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Leer lassen für unbegrenzte Teilnehmerzahl
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_mandatory}
                  onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                  className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    Pflichtveranstaltung
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Alle Mitglieder müssen Zu- oder Absagen
                  </p>
                </div>
              </label>
            </div>
          </div>

          {teams.length > 0 && (
            <div>
              <label className="label mb-3">
                Teams auswählen (optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {teams.map((team) => (
                  <label
                    key={team.id}
                    className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selected_teams.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                      className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                        {team.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {team.level}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Wenn keine Teams ausgewählt sind, sind alle Mitglieder eingeladen
              </p>
            </div>
          )}
        </div>

        {/* Notizen */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <label className="label">
            Zusätzliche Notizen
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input min-h-[80px]"
            placeholder="Besondere Hinweise, Ausrüstung, Treffpunkt, etc."
            rows={3}
          />
        </div>
      </div>

      {/* Footer mit Buttons */}
      <div className="card-footer flex flex-col-reverse sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="btn-secondary"
        >
          Abbrechen
        </button>
        <div className="flex-1" />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? "Wird erstellt..." : "Event erstellen"}
        </button>
      </div>
    </form>
  );
}
