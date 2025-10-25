"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, FileText, Dumbbell, AlertCircle, CheckCircle } from "lucide-react";
import { createTraining } from "@/app/actions";

interface Team {
  id: number;
  name: string;
  level: string;
}

interface Props {
  teams: Team[];
}

export default function CreateTrainingForm({ teams }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    // Validierung
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;

    if (startTime && endTime && startTime >= endTime) {
      setError("Die Endzeit muss nach der Startzeit liegen");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createTraining(formData);

      if (!result.success) {
        throw new Error(result.error || "Fehler beim Erstellen des Trainings");
      }

      setSuccess("Training erfolgreich erstellt!");
      setTimeout(() => {
        router.push("/trainings");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
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

        {/* Team-Auswahl */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-red-600 dark:text-red-400" />
            Team & Trainingsinformationen
          </h2>

          <div>
            <label className="label">
              Team *
            </label>
            <select
              name="team_id"
              className="input"
              required
            >
              <option value="">Team auswählen...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.level})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Alle Mitglieder dieses Teams werden automatisch zum Training hinzugefügt
            </p>
          </div>

          <div>
            <label className="label">
              <MapPin className="w-4 h-4" />
              Trainingsort *
            </label>
            <input
              type="text"
              name="location"
              className="input"
              placeholder="z.B. Sporthalle A, Gym München"
              required
            />
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
                Trainingsdatum *
              </label>
              <input
                type="date"
                name="training_date"
                className="input"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="label">
                <Clock className="w-4 h-4" />
                Startzeit *
              </label>
              <input
                type="time"
                name="start_time"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">
                <Clock className="w-4 h-4" />
                Endzeit *
              </label>
              <input
                type="time"
                name="end_time"
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Notizen */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <label className="label">
            <FileText className="w-4 h-4" />
            Trainingshinweise
          </label>
          <textarea
            name="notes"
            className="input min-h-[100px]"
            placeholder="Trainingsschwerpunkt, mitzubringende Ausrüstung, besondere Hinweise..."
            rows={4}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Diese Hinweise werden allen Teilnehmern und deren Eltern angezeigt
          </p>
        </div>

        {/* Info-Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              ℹ️
            </div>
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Automatische Teilnehmer-Verwaltung</p>
              <p className="text-blue-800 dark:text-blue-200">
                Alle Mitglieder des ausgewählten Teams werden automatisch zum Training hinzugefügt. 
                Sie können dann individuell zusagen oder absagen. Eltern werden benachrichtigt und 
                können die Teilnahme ihrer Kinder verwalten.
              </p>
            </div>
          </div>
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
          {isLoading ? "Wird erstellt..." : "Training erstellen"}
        </button>
      </div>
    </form>
  );
}
