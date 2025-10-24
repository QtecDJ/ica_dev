import { requireRole } from "@/lib/auth-utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateEventForm from "@/app/components/CreateEventForm";
import { neon } from "@neondatabase/serverless";

export default async function NewEventPage() {
  await requireRole(["admin", "coach"]);

  const sql = neon(process.env.DATABASE_URL!);
  
  // Hole alle Teams für Teilnehmer-Auswahl
  const teams = await sql`
    SELECT id, name, level 
    FROM teams 
    ORDER BY name
  `;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/events"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zu Events</span>
        </Link>
      </div>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">
          Neues Event erstellen
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Erstelle ein neues Event für dein Team
        </p>
      </div>

      <div className="max-w-3xl">
        <CreateEventForm teams={teams} />
      </div>
    </div>
  );
}
