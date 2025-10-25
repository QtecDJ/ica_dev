import { getEvents, deleteEvent } from "../actions";
import { Plus, Pencil, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import { requireAuth } from "@/lib/auth-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";

export default async function EventsPage() {
  // Allow all authenticated users to view events
  const session = await requireAuth();
  const userRole = session.user.role;
  
  const events = await getEvents();

  const getEventTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      competition: "badge-red",
      showcase: "badge-purple",
      training: "badge-blue",
      workshop: "badge-green",
      other: "badge-gray",
    };
    return badges[type] || "badge-gray";
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      competition: "Wettkampf",
      showcase: "Aufführung", 
      training: "Training",
      workshop: "Workshop",
      other: "Sonstiges",
    };
    return labels[type] || type;
  };

  // Determine if user can manage events
  const canManageEvents = userRole === "admin" || userRole === "coach";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {userRole === "parent" ? "Events & Termine" : "Events"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {userRole === "parent" 
              ? `${events.length} kommende Events und Termine für dein Kind`
              : `${events.length} ${events.length === 1 ? 'Event' : 'Events'} insgesamt`
            }
          </p>
        </div>
        {canManageEvents && (
          <Link href="/events/new" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            Neues Event
          </Link>
        )}
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
                    {canManageEvents && <th className="text-right">Aktionen</th>}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <Link 
                          href={`/events/${event.id}`}
                          className="flex items-center gap-2 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-medium">{event.title}</span>
                            {userRole === "parent" && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {event.description && event.description.length > 50 
                                  ? `${event.description.substring(0, 50)}...`
                                  : event.description
                                }
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        <div className="font-medium">
                          {new Date(event.event_date).toLocaleDateString("de-DE", {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">
                        {event.location}
                      </td>
                      <td>
                        <span className={getEventTypeBadge(event.event_type)}>
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </td>
                      {canManageEvents && (
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
                      )}
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
                      <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                          {event.title}
                        </h3>
                        <span className={`${getEventTypeBadge(event.event_type)} text-xs inline-block`}>
                          {getEventTypeLabel(event.event_type)}
                        </span>
                        {userRole === "parent" && event.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {userRole === "parent" && (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400 flex-shrink-0">
                        <Eye className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Datum:</span>
                      <span className="text-slate-900 dark:text-slate-50 font-medium">
                        {new Date(event.event_date).toLocaleDateString("de-DE", {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
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
              {userRole === "parent" ? "Noch keine Events" : "Noch keine Events"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {userRole === "parent" 
                ? "Sobald Events für dein Kind verfügbar sind, werden sie hier angezeigt."
                : "Erstelle dein erstes Event, um loszulegen!"
              }
            </p>
            {canManageEvents && (
              <Link href="/events/new" className="btn btn-primary inline-flex">
                <Plus className="w-5 h-5" />
                Neues Event erstellen
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
