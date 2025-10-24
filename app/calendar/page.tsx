import { neon } from "@neondatabase/serverless";
import { Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import Calendar from "@/app/components/Calendar";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await auth();
  
  if (!session) {
    return <div>Bitte anmelden</div>;
  }

  const sql = neon(process.env.DATABASE_URL!);
  
  // Hole alle Events
  const events = await sql`
    SELECT 
      id,
      title,
      event_date,
      event_type,
      location,
      start_time,
      is_mandatory
    FROM events
    ORDER BY event_date
  `;
  
  // Hole Calendar Events
  const calendarEvents = await sql`
    SELECT 
      id,
      title,
      event_date,
      event_type,
      location,
      start_time
    FROM calendar_events
    ORDER BY event_date
  `;
  
  // Konvertiere zu gemeinsamen Format
  const formattedEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date.toISOString().split('T')[0],
    event_type: e.event_type,
    location: e.location || undefined,
    start_time: e.start_time || undefined,
    is_mandatory: e.is_mandatory || undefined,
    source: 'event' as const
  }));
  
  const formattedCalendarEvents = calendarEvents.map(e => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date.toISOString().split('T')[0],
    event_type: e.event_type,
    location: e.location || undefined,
    start_time: e.start_time || undefined,
    source: 'calendar' as const
  }));
  
  const canCreateEvents = ["admin", "coach"].includes(session.user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Kalender
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {formattedEvents.length + formattedCalendarEvents.length} Termine
          </p>
        </div>
        {canCreateEvents && (
          <div className="flex gap-2">
            <Link href="/events/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Event erstellen
            </Link>
            <Link href="/calendar/new" className="btn-secondary">
              <Plus className="w-4 h-4" />
              Termin hinzufügen
            </Link>
          </div>
        )}
      </div>

      {/* Calendar Component */}
      <Calendar 
        events={formattedEvents} 
        calendarEvents={formattedCalendarEvents}
      />
      
      {/* Info Box */}
      {canCreateEvents && (
        <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="card-body">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              📅 Kalender-Tipps
            </h3>
            <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
              <li>• <strong>Events</strong> sind Trainings, Wettkämpfe und Showcases mit Teilnehmern</li>
              <li>• <strong>Termine</strong> sind allgemeine Kalenderereignisse (Feiertage, Meetings, etc.)</li>
              <li>• Klicke auf einen Tag um alle Events zu sehen</li>
              <li>• Pflicht-Events sind mit * markiert</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
