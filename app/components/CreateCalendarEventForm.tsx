"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, FileText, Clock } from "lucide-react";

export default function CreateCalendarEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "",
    location: "",
    event_date: "",
    start_time: "",
    end_time: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Titel ist erforderlich";
    if (!formData.event_date) return "Datum ist erforderlich";
    if (!formData.event_type) return "Termin-Typ ist erforderlich";

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
      const response = await fetch("/api/calendar-events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Erstellen des Termins");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/calendar");
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
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
          Termin erfolgreich erstellt! Weiterleitung...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basis-Informationen */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Termin-Details
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
              placeholder="z.B. Feiertag, Meeting, Deadline"
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
              placeholder="Optionale Zusatzinformationen"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event_type" className="label">
                Termin-Typ *
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
                <option value="meeting">Meeting</option>
                <option value="holiday">Feiertag</option>
                <option value="deadline">Deadline</option>
                <option value="reminder">Erinnerung</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="label">
                Ort
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input"
                placeholder="Optional"
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

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "Wird erstellt..." : "Termin erstellen"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
            disabled={loading}
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
