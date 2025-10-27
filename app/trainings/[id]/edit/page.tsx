import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { updateTraining } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function EditTrainingPage({ params }: { params: { id: string } }) {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Authentifizierung prüfen
  const session = await requireAuth();
  const userRole = session.user.role;
  const userId = session.user.id;
  
  // Nur Admins und Coaches können Trainings bearbeiten
  if (userRole !== "admin" && userRole !== "coach") {
    redirect("/trainings");
  }
  
  // Validiere und parse ID
  const trainingId = parseInt(params.id);
  if (isNaN(trainingId)) {
    redirect("/trainings");
  }
  
  // Hole Training-Daten
  const trainings = await sql`
    SELECT 
      t.*,
      teams.name as team_name
    FROM trainings t
    LEFT JOIN teams ON t.team_id = teams.id
    WHERE t.id = ${trainingId}
  `;

  if (trainings.length === 0) {
    redirect("/trainings");
  }

  const training = trainings[0];

  // Zugriffskontrolle für Coaches - nur eigenes Team
  if (userRole === "coach") {
    const coachTeams = await sql`
      SELECT DISTINCT t.id 
      FROM teams t
      JOIN team_coaches tc ON t.id = tc.team_id
      WHERE tc.coach_id = ${userId}
    `;
    
    const hasAccess = coachTeams.some(team => team.id === training.team_id);
    if (!hasAccess) {
      redirect("/trainings");
    }
  }

  // Hole verfügbare Teams (für Admins alle, für Coaches nur eigene)
  let teams: any[] = [];
  if (userRole === "admin") {
    teams = await sql`
      SELECT id, name, level 
      FROM teams 
      ORDER BY name
    `;
  } else if (userRole === "coach") {
    teams = await sql`
      SELECT DISTINCT t.id, t.name, t.level 
      FROM teams t
      JOIN team_coaches tc ON t.id = tc.team_id
      WHERE tc.coach_id = ${userId}
      ORDER BY t.name
    `;
  }

  async function handleUpdateTraining(formData: FormData) {
    'use server';
    
    const result = await updateTraining(trainingId, formData);
    
    if (result.success) {
      redirect(`/trainings/${trainingId}`);
    } else {
      // Handle error - in a real app you'd want proper error handling
      redirect(`/trainings/${trainingId}/edit?error=1`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href={`/trainings/${trainingId}`}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zum Training</span>
        </Link>
      </div>

      {/* Edit Form */}
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Training bearbeiten
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Bearbeite die Details für dieses Training
          </p>
        </div>

        <div className="card-body">
          <form action={handleUpdateTraining} className="space-y-6">
            {/* Team Auswahl */}
            <div>
              <label htmlFor="team_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Team
              </label>
              <select
                id="team_id"
                name="team_id"
                defaultValue={training.team_id || ""}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="">Allgemeines Training (kein Team)</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Datum */}
            <div>
              <label htmlFor="training_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Datum *
              </label>
              <input
                type="date"
                id="training_date"
                name="training_date"
                defaultValue={training.training_date}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Zeit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Startzeit *
                </label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  defaultValue={training.start_time}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Endzeit *
                </label>
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  defaultValue={training.end_time}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Ort */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Trainingsort *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                defaultValue={training.location}
                required
                placeholder="z.B. Sporthalle XYZ"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Notizen */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notizen/Hinweise
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                defaultValue={training.notes || ""}
                placeholder="Zusätzliche Informationen zum Training..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Link
                href={`/trainings/${trainingId}`}
                className="btn btn-secondary"
              >
                Abbrechen
              </Link>
              <button type="submit" className="btn btn-primary">
                <Save className="w-4 h-4" />
                Training speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}