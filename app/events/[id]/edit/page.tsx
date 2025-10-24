import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth-utils";
import EditEventForm from "@/app/components/EditEventForm";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  await requireRole(["admin", "coach"]);

  const sql = neon(process.env.DATABASE_URL!);
  
  // Hole Event-Daten
  const events = await sql`
    SELECT * FROM events WHERE id = ${parseInt(params.id)}
  `;

  if (events.length === 0) {
    redirect("/events");
  }

  const event = events[0];

  // Konvertiere event_date zu string
  const formattedEvent = {
    ...event,
    event_date: event.event_date.toISOString().split('T')[0]
  };

  // Hole alle Teams
  const teams = await sql`
    SELECT id, name, level FROM teams ORDER BY name
  `;

  // Hole aktuell zugeordnete Teams
  const selectedTeams = await sql`
    SELECT DISTINCT m.team_id
    FROM event_participants ep
    JOIN members m ON ep.member_id = m.id
    WHERE ep.event_id = ${parseInt(params.id)} AND m.team_id IS NOT NULL
  `;

  const selectedTeamIds = selectedTeams.map((t: any) => t.team_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/events/${params.id}`}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zum Event</span>
        </Link>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <div className="card">
          <div className="card-header">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Event bearbeiten
            </h1>
          </div>
          <div className="card-body">
            <EditEventForm 
              event={formattedEvent as any}
              teams={teams as any}
              selectedTeamIds={selectedTeamIds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
