import { requireRole } from "@/lib/auth-utils";
import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { neon } from "@neondatabase/serverless";
import CreateTrainingForm from "@/app/components/CreateTrainingForm";

export default async function NewTrainingPage() {
  const session = await requireRole(["admin", "coach"]);
  const userRole = session.user.role;
  const userId = session.user.id;

  const sql = neon(process.env.DATABASE_URL!);
  
  // Hole Teams basierend auf Benutzerrolle
  let teams: any[] = [];
  
  if (userRole === "admin") {
    // Admins sehen alle Teams
    teams = await sql`
      SELECT id, name, level 
      FROM teams 
      ORDER BY name
    `;
  } else if (userRole === "coach") {
    // Coaches sehen Teams, die sie coachen
    teams = await sql`
      SELECT DISTINCT t.id, t.name, t.level 
      FROM teams t
      JOIN team_coaches tc ON t.id = tc.team_id
      WHERE tc.coach_id = ${userId}
      ORDER BY t.name
    `;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/trainings"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zu Trainings</span>
        </Link>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Neues Training erstellen
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-[60px]">
          Erstelle ein neues Training und weise es einem Team zu
        </p>
      </div>

      <div className="max-w-3xl">
        <CreateTrainingForm teams={teams as any} />
      </div>
    </div>
  );
}
