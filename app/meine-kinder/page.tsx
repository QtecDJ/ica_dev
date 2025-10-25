import { Metadata } from "next"
import { requireAuth } from "@/lib/auth-utils"
import { getSafeDb } from "@/lib/db"
import { User, Plus, Mail, Phone, Calendar, Trophy, TrendingUp, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Meine Kinder | ICA",
  description: "Übersicht über deine Kinder und deren Fortschritte",
}

async function getChildrenData(parentId: string) {
  try {
    const sql = getSafeDb();
    
    // Vereinfachte Abfrage - schaue nach members die zur parent email gehören könnten
    // Statt parent_id verwenden wir parent_email Vergleich
    const user = await sql`
      SELECT email FROM users WHERE id = ${parentId}
    `;
    
    if (!user || user.length === 0) {
      return {
        children: [],
        upcomingEvents: [],
        upcomingTrainings: []
      };
    }

    const parentEmail = user[0].email;
    
    // Get children based on parent_email match
    const children = await sql`
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        m.email,
        m.phone,
        m.created_at,
        m.parent_email,
        t.name as team_name
      FROM members m
      LEFT JOIN teams t ON m.team_id = t.id
      WHERE m.parent_email = ${parentEmail}
      ORDER BY m.first_name ASC
    `;

    // Get upcoming events (all events for now)
    const upcomingEvents = await sql`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date as date,
        e.location,
        e.event_type
      FROM events e
      WHERE e.event_date >= CURRENT_DATE
      ORDER BY e.event_date ASC
      LIMIT 5
    `;

    // Get upcoming trainings (all trainings for now)
    const upcomingTrainings = await sql`
      SELECT 
        tr.id,
        tr.training_date as date,
        tr.start_time,
        tr.end_time,
        tr.location,
        tr.notes,
        t.name as team_name
      FROM trainings tr
      LEFT JOIN teams t ON tr.team_id = t.id
      WHERE tr.training_date >= CURRENT_DATE
      ORDER BY tr.training_date ASC
      LIMIT 5
    `;

    return {
      children,
      upcomingEvents,
      upcomingTrainings
    }
  } catch (error) {
    console.error("Error fetching children data:", error)
    return {
      children: [],
      upcomingEvents: [],
      upcomingTrainings: []
    }
  }
}

export default async function MeineKinderPage() {
  const session = await requireAuth()
  
  if (!session?.user?.id) {
    throw new Error("Keine Berechtigung")
  }

  const { children, upcomingEvents, upcomingTrainings } = await getChildrenData(session.user.id)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Meine Kinder
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Übersicht über deine Kinder und deren Aktivitäten
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Users className="w-4 h-4" />
          {children.length} {children.length === 1 ? 'Kind' : 'Kinder'}
        </div>
      </div>

      {/* Children Overview */}
      {children.length > 0 ? (
        <div className="grid gap-6">
          {children.map((child: any) => (
            <div key={child.id} className="card">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Child Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                          {child.first_name} {child.last_name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {child.team_name ? `Team: ${child.team_name}` : 'Kein Team zugewiesen'}
                        </p>
                        <p className="text-xs text-slate-400">
                          Mitglied seit {new Date(child.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {child.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Mail className="w-4 h-4" />
                          {child.email}
                        </div>
                      )}
                      {child.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="w-4 h-4" />
                          {child.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="lg:w-80">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {upcomingEvents.length}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Events
                        </div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {upcomingTrainings.length}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Trainings
                        </div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {child.team_name ? 1 : 0}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Team
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Noch keine Kinder registriert
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Wende dich an die Vereinsleitung, um deine Kinder zu registrieren.
            </p>
          </div>
        </div>
      )}

      {/* Quick Access Sections */}
      {children.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Kommende Events
                </h3>
              </div>
              
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event: any) => (
                    <div key={event.id} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-50">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.date).toLocaleDateString('de-DE')}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href="/events" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Alle Events anzeigen →
                  </Link>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Keine kommenden Events
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Trainings */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Kommende Trainings
                </h3>
              </div>
              
              {upcomingTrainings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTrainings.map((training: any) => (
                    <div key={training.id} className="border-l-4 border-yellow-200 dark:border-yellow-800 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-50">
                            {training.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(training.date).toLocaleDateString('de-DE')}
                            </div>
                            {training.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {training.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href="/trainings" className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline">
                    Alle Trainings anzeigen →
                  </Link>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Keine kommenden Trainings
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Important Info for Parents */}
      {children.length > 0 && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="card-body">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-4">
              📋 Wichtige Informationen für Eltern
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Kommunikation</h4>
                <ul className="space-y-1 text-red-700 dark:text-red-300">
                  <li>• Über diese App kannst du alle Termine deines Kindes einsehen</li>
                  <li>• Bei Fragen wende dich direkt an den jeweiligen Coach</li>
                  <li>• Wichtige Mitteilungen erhältst du per E-Mail</li>
                  <li>• Änderungen werden zeitnah in der App aktualisiert</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Teilnahme</h4>
                <ul className="space-y-1 text-red-700 dark:text-red-300">
                  <li>• Regelmäßige Teilnahme ist wichtig für den Fortschritt</li>
                  <li>• Bei Abwesenheit bitte rechtzeitig beim Coach melden</li>
                  <li>• Trainingszeiten können sich gelegentlich ändern</li>
                  <li>• Events sind zusätzliche Aktivitäten zur normalen Trainingszeit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}