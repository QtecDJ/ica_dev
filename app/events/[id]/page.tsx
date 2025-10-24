import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, FileText, Tag, AlertCircle } from "lucide-react";
import EventParticipants from "@/app/components/EventParticipants";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Hole Event-Daten
  const events = await sql`
    SELECT * FROM events WHERE id = ${parseInt(params.id)}
  `;

  if (events.length === 0) {
    redirect("/events");
  }

  const event = events[0];

  // Hole Teilnehmer-Status
  const participants = await sql`
    SELECT 
      ep.*,
      m.first_name,
      m.last_name,
      m.avatar_url,
      t.name as team_name
    FROM event_participants ep
    JOIN members m ON ep.member_id = m.id
    LEFT JOIN teams t ON m.team_id = t.id
    WHERE ep.event_id = ${parseInt(params.id)}
    ORDER BY 
      CASE ep.status
        WHEN 'accepted' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'declined' THEN 3
      END,
      m.first_name
  `;

  // Zähle Teilnehmer-Status
  const acceptedCount = participants.filter((p: any) => p.status === 'accepted').length;
  const declinedCount = participants.filter((p: any) => p.status === 'declined').length;
  const pendingCount = participants.filter((p: any) => p.status === 'pending').length;

  // Prüfe ob Benutzer bearbeiten darf - TODO: Fix auth in production
  const canEdit = true; // Temporary for production

  // Event-Typ Badge
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "competition":
        return <span className="badge badge-red">Wettkampf</span>;
      case "showcase":
        return <span className="badge badge-purple">Showcase</span>;
      case "training":
        return <span className="badge badge-blue">Training</span>;
      case "workshop":
        return <span className="badge badge-green">Workshop</span>;
      case "meeting":
        return <span className="badge badge-gray">Meeting</span>;
      default:
        return <span className="badge badge-gray">Sonstiges</span>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return null;
    return time.slice(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/events"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zu Events</span>
        </Link>
        {canEdit && (
          <Link
            href={`/events/${params.id}/edit`}
            className="btn-primary"
          >
            <Edit className="w-4 h-4" />
            Bearbeiten
          </Link>
        )}
      </div>

      {/* Event Info Card */}
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {event.title}
              </h1>
              {getEventTypeBadge(event.event_type)}
              {event.is_mandatory && (
                <span className="badge badge-red flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Pflicht
                </span>
              )}
            </div>
            {event.description && (
              <p className="text-slate-600 dark:text-slate-400">
                {event.description}
              </p>
            )}
          </div>
        </div>

        <div className="card-body">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Datum & Zeit */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Datum & Zeit
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Datum</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                </div>
                {(event.start_time || event.end_time) && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Uhrzeit</p>
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {formatTime(event.start_time)}
                        {event.end_time && ` - ${formatTime(event.end_time)}`}
                        {!event.start_time && event.end_time && `bis ${formatTime(event.end_time)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ort & Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Ort & Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Veranstaltungsort</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {event.location}
                    </p>
                  </div>
                </div>
                {event.max_participants && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Max. Teilnehmer</p>
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {acceptedCount} / {event.max_participants}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notizen */}
          {event.notes && (
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                Zusätzliche Informationen
              </h2>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {event.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Teilnehmer-Statistik */}
      {participants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <div className="card-body text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {acceptedCount}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Zugesagt</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {pendingCount}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ausstehend</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {declinedCount}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Abgesagt</p>
            </div>
          </div>
        </div>
      )}

      {/* Teilnehmerliste */}
      {participants.length > 0 && (
        <EventParticipants 
          eventId={parseInt(params.id)}
          participants={participants as any}
          userRole={undefined}
          userId={undefined}
        />
      )}
    </div>
  );
}
