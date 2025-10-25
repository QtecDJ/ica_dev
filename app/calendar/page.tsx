import { neon } from "@neondatabase/serverless";
import { Plus, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import Calendar from "@/app/components/Calendar";
import { requireAuth } from "@/lib/auth-utils";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await requireAuth();
  const userRole = session.user.role;
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not configured");
  }
  
  const sql = neon(process.env.DATABASE_URL);
  
  // Hole alle Events
  const events = await sql`
    SELECT 
      id,
      title,
      event_date,
      event_type,
      location,
      start_time,
      end_time,
      is_mandatory,
      description
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
      start_time,
      end_time,
      description
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
    end_time: e.end_time || undefined,
    is_mandatory: e.is_mandatory || undefined,
    description: e.description || undefined,
    source: 'event' as const
  }));
  
  const formattedCalendarEvents = calendarEvents.map(e => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date.toISOString().split('T')[0],
    event_type: e.event_type,
    location: e.location || undefined,
    start_time: e.start_time || undefined,
    end_time: e.end_time || undefined,
    description: e.description || undefined,
    source: 'calendar' as const
  }));
  
  // Determine permissions
  const canCreateEvents = userRole === "admin" || userRole === "coach";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {userRole === "parent" ? "Kalender & Termine" : "Kalender"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {userRole === "parent" 
              ? `${formattedEvents.length + formattedCalendarEvents.length} Termine für dein Kind`
              : `${formattedEvents.length + formattedCalendarEvents.length} Termine`
            }
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
      
      {/* Special Info for Parents */}
      {userRole === "parent" && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="card-body">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3">
              📅 Wichtige Termine für dein Kind
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upcoming Events */}
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Kommende Events</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formattedEvents
                    .filter(event => new Date(event.event_date) >= new Date())
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-slate-900 dark:text-slate-50 text-sm">
                              {event.title}
                              {event.is_mandatory && <span className="text-red-500 ml-1">*</span>}
                            </h5>
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.event_date).toLocaleDateString("de-DE", {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              })}
                              {event.start_time && ` • ${event.start_time}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              {/* Calendar Events */}
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Weitere Termine</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formattedCalendarEvents
                    .filter(event => new Date(event.event_date) >= new Date())
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                        <h5 className="font-medium text-slate-900 dark:text-slate-50 text-sm">
                          {event.title}
                        </h5>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.event_date).toLocaleDateString("de-DE", {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                          {event.start_time && ` • ${event.start_time}`}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-red-700 dark:text-red-300">
              <p>* Pflicht-Events erfordern eine Anwesenheit deines Kindes</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Admin/Coach Info Box */}
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
