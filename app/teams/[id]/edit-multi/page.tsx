import { neon } from "@neondatabase/serverless";
import { requireRole } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Settings } from "lucide-react";
import MultiCoachTeamManager from "@/app/components/MultiCoachTeamManager";
import { revalidatePath } from "next/cache";

const sql = neon(process.env.DATABASE_URL!);

// Updated to fix transaction issue
interface TeamCoach {
  coach_id: number;
  coach_name: string;
  coach_email: string;
  coach_role: string;
  is_primary: boolean;
}

export default async function EditTeamPage({ params }: { params: { id: string } }) {
  // Only admin can edit teams
  const session = await requireRole(["admin"]);
  const teamId = parseInt(params.id);

  if (isNaN(teamId)) {
    redirect("/teams");
  }

  // Get team with coaches
  const teamData = await sql`
    SELECT 
      t.id as team_id,
      t.name as team_name,
      t.level as team_level,
      tc.coach_id,
      tc.role as coach_role,
      tc.is_primary,
      u.name as coach_name,
      u.email as coach_email
    FROM teams t
    LEFT JOIN team_coaches tc ON t.id = tc.team_id
    LEFT JOIN users u ON tc.coach_id = u.id AND u.role IN ('coach', 'admin')
    WHERE t.id = ${teamId}
    ORDER BY tc.is_primary DESC, u.name
  `;

  if (teamData.length === 0) {
    redirect("/teams");
  }

  // Get all available coaches
  const availableCoaches = await sql`
    SELECT id, name, email, role
    FROM users 
    WHERE role IN ('coach', 'admin') 
    ORDER BY name
  `;

  // Structure team data
  const team = {
    id: teamData[0].team_id,
    name: teamData[0].team_name,
    level: teamData[0].team_level,
    coaches: teamData
      .filter(td => td.coach_id !== null)
      .map(td => ({
        coach_id: td.coach_id,
        coach_name: td.coach_name,
        coach_email: td.coach_email,
        coach_role: td.coach_role,
        is_primary: td.is_primary,
      })),
  };

  // Server action to update team basic info
  async function updateTeamInfo(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const level = formData.get("level") as string;

    if (!name || !level) {
      throw new Error("Name und Level sind erforderlich");
    }

    try {
      await sql`
        UPDATE teams 
        SET name = ${name}, level = ${level}
        WHERE id = ${teamId}
      `;
      
      revalidatePath("/teams");
      revalidatePath(`/teams/${teamId}/edit`);
    } catch (error) {
      throw new Error("Fehler beim Aktualisieren des Teams");
    }
  }

  // Server action to update coaches
  async function updateTeamCoaches(teamIdParam: number, coaches: TeamCoach[]) {
    "use server";

    // Validate that at most one coach is primary
    const primaryCoaches = coaches.filter(c => c.is_primary);
    if (primaryCoaches.length > 1) {
      throw new Error("Nur ein Haupt-Coach ist erlaubt");
    }

    // Validate that all coach IDs exist
    const coachIds = coaches.map(c => c.coach_id);
    if (coachIds.length > 0) {
      const validCoaches = await sql`
        SELECT id FROM users 
        WHERE id = ANY(${coachIds}) 
        AND role IN ('coach', 'admin')
      `;

      if (validCoaches.length !== coachIds.length) {
        throw new Error("Ein oder mehrere ungültige Coach-IDs");
      }
    }

    try {
      // Start transaction by using begin/commit manually or simple sequential operations
      // Remove all existing coach assignments for this team
      await sql`DELETE FROM team_coaches WHERE team_id = ${teamIdParam}`;

      // Add new coach assignments
      if (coaches.length > 0) {
        for (const coach of coaches) {
          await sql`
            INSERT INTO team_coaches (team_id, coach_id, role, is_primary)
            VALUES (${teamIdParam}, ${coach.coach_id}, ${coach.coach_role}, ${coach.is_primary})
          `;
        }
      }

      // Update teams.coach for backwards compatibility (set to primary coach as string)
      const primaryCoach = coaches.find(c => c.is_primary);
      if (primaryCoach) {
        await sql`
          UPDATE teams 
          SET coach = ${primaryCoach.coach_id.toString()}
          WHERE id = ${teamIdParam}
        `;
      } else {
        await sql`
          UPDATE teams 
          SET coach = NULL
          WHERE id = ${teamIdParam}
        `;
      }

      revalidatePath("/teams");
      revalidatePath(`/teams/${teamIdParam}/edit`);
    } catch (error) {
      console.error("Detailed error:", error);
      throw new Error(`Fehler beim Aktualisieren der Coach-Zuweisungen: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link 
          href="/teams" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Teams
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Team bearbeiten
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {team.name} - Multi-Coach-Verwaltung
        </p>
      </div>
      
      {/* Team Basic Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Team-Grunddaten
          </h2>
        </div>
        <div className="card-body">
          <form action={updateTeamInfo} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="label">
                  Team Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={team.name}
                  required
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="level" className="label">
                  Level *
                </label>
                <input
                  type="text"
                  id="level"
                  name="level"
                  defaultValue={team.level}
                  required
                  className="input"
                  placeholder="z.B. Level 2, Beginner, Advanced"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Grunddaten speichern
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Multi-Coach Manager */}
      <MultiCoachTeamManager
        team={team}
        availableCoaches={availableCoaches.map(coach => ({
          id: coach.id,
          name: coach.name,
          email: coach.email,
          role: coach.role
        }))}
        onUpdate={updateTeamCoaches}
      />

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {team.coaches.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Zugewiesene Coaches
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {team.coaches.filter(c => c.is_primary).length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Haupt-Coach
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              Aktiv
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Team-Status
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}