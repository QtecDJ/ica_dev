import { getEvents, deleteEvent } from "../actions";
import { Plus, Pencil, Calendar } from "lucide-react";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import { requireRole } from "@/lib/auth-utils";

export default async function EventsPage() {
  // Only admin and coach can access this page
  await requireRole(["admin", "coach"]);
  
  const events = await getEvents();

  const getEventTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      competition: "badge-red",
      showcase: "badge-purple",
      training: "badge-blue",
      other: "badge-gray",
    };
    return badges[type] || "badge-gray";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Events</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {events.length} {events.length === 1 ? 'Event' : 'Events'} insgesamt
          </p>
        </div>
        <Link href="/events/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Neues Event
        </Link>
      </div>

      {/* Events List */}
      {events.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block card overflow-hidden">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Titel</th>
                    <th>Datum</th>
                    <th>Ort</th>
                    <th>Typ</th>
                    <th className="text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <Link 
                          href={`/events/${event.id}`}
                          className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{event.title}</span>
                        </Link>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        {new Date(event.event_date).toLocaleDateString("de-DE")}
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        {event.location}
                      </td>
                      <td>
                        <span className={getEventTypeBadge(event.event_type)}>
                          {event.event_type}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/events/${event.id}/edit`}
                            className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeleteButton id={event.id} action={deleteEvent} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="card-hover block">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                          {event.title}
                        </h3>
                        <span className={`${getEventTypeBadge(event.event_type)} text-xs mt-1 inline-block`}>
                          {event.event_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Datum:</span>
                      <span className="text-slate-900 dark:text-slate-50 font-medium">
                        {new Date(event.event_date).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Ort:</span>
                      <span className="text-slate-900 dark:text-slate-50">
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Noch keine Events
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Erstelle dein erstes Event, um loszulegen!
            </p>
            <Link href="/events/new" className="btn btn-primary inline-flex">
              <Plus className="w-5 h-5" />
              Neues Event erstellen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
