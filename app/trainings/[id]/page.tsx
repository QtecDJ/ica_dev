import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, Dumbbell, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { getTrainingAttendance, updateAttendanceStatus } from "@/app/actions";
import TrainingAttendanceButtons from "@/app/components/TrainingAttendanceButtons";

export const dynamic = 'force-dynamic';

export default async function TrainingDetailPage({ params }: { params: { id: string } }) {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Authentifizierung prüfen
  const session = await requireAuth();
  const userRole = session.user.role;
  const userId = session.user.id;
  
  // Validiere und parse ID
  const trainingId = parseInt(params.id);
  if (isNaN(trainingId)) {
    redirect("/trainings");
  }
  
  // Hole Training-Daten
  const trainings = await sql`
    SELECT 
      t.*,
      teams.name as team_name,
      teams.level as team_level
    FROM trainings t
    LEFT JOIN teams ON t.team_id = teams.id
    WHERE t.id = ${trainingId}
  `;

  if (trainings.length === 0) {
    redirect("/trainings");
  }

  const training = trainings[0];

  // Zugriffskontrolle für Coaches - nur eigenes Team
  if (userRole === "coach") {
    const coachTeams = await sql`
      SELECT DISTINCT t.id 
      FROM teams t
      JOIN team_coaches tc ON t.id = tc.team_id
      WHERE tc.coach_id = ${userId}
    `;
    
    const hasAccess = coachTeams.some(team => team.id === training.team_id);
    if (!hasAccess) {
      redirect("/trainings");
    }
  }

  // Hole Teilnehmer-Status
  const attendance = await getTrainingAttendance(trainingId);

  // Zähle Teilnehmer-Status
  const acceptedCount = attendance.filter((a: any) => a.status === 'accepted').length;
  const declinedCount = attendance.filter((a: any) => a.status === 'declined').length;
  const pendingCount = attendance.filter((a: any) => a.status === 'pending').length;

  // Prüfe ob Benutzer bearbeiten darf
  const canEdit = userRole === "admin" || userRole === "coach";

  // Finde die member_id des aktuellen Benutzers
  let currentUserMemberId: number | null = null;
  let currentUserAttendance = null;
  
  if (userRole === "parent") {
    // Hole die Kinder des Parents
    const children = await sql`
      SELECT child_member_id 
      FROM parent_children 
      WHERE parent_user_id = ${userId}
    `;
    
    if (children.length > 0) {
      currentUserMemberId = children[0].child_member_id;
      currentUserAttendance = attendance.find((a: any) => a.member_id === currentUserMemberId);
    }
  } else if (userRole === "member") {
    // Member verwaltet eigene Teilnahme
    const userMember = await sql`
      SELECT member_id 
      FROM users 
      WHERE id = ${userId}
    `;
    
    if (userMember.length > 0 && userMember[0].member_id) {
      currentUserMemberId = userMember[0].member_id;
      currentUserAttendance = attendance.find((a: any) => a.member_id === currentUserMemberId);
    }
  }

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
          href="/trainings"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zu Trainings</span>
        </Link>
        {canEdit && (
          <Link
            href={`/trainings/${params.id}/edit`}
            className="btn-primary"
          >
            <Edit className="w-4 h-4" />
            Bearbeiten
          </Link>
        )}
      </div>

      {/* Training Info Card */}
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {training.team_name ? `Training ${training.team_name}` : "Allgemeines Training"}
                </h1>
                {training.team_name && (
                  <span className="badge badge-red text-sm mt-1 inline-block">
                    {training.team_level}
                  </span>
                )}
              </div>
            </div>
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
                      {formatDate(training.training_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Uhrzeit</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {formatTime(training.start_time)} - {formatTime(training.end_time)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ort & Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Trainingsort
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Ort</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {training.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notizen */}
          {training.notes && (
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-3">
                <Dumbbell className="w-5 h-5 text-green-600 dark:text-green-400" />
                Trainingshinweise
              </h2>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {training.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Teilnahme-Buttons für Parents/Members */}
      {(userRole === "parent" || userRole === "member") && currentUserMemberId && (
        <TrainingAttendanceButtons
          trainingId={trainingId}
          memberId={currentUserMemberId}
          currentStatus={currentUserAttendance?.status || "pending"}
        />
      )}

      {/* Teilnehmer-Statistik */}
      {attendance.length > 0 && canEdit && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <div className="card-body text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {acceptedCount}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Zugesagt</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <Clock3 className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {pendingCount}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ausstehend</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {declinedCount}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Abgesagt</p>
            </div>
          </div>
        </div>
      )}

      {/* Teilnehmerliste für Coaches/Admins */}
      {attendance.length > 0 && canEdit && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Teilnehmerliste ({attendance.length})
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              {attendance.map((attendee: any) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {attendee.first_name[0]}{attendee.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {attendee.first_name} {attendee.last_name}
                      </p>
                      {attendee.comment && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {attendee.comment}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {attendee.status === "accepted" && (
                      <span className="badge badge-green flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Zugesagt
                      </span>
                    )}
                    {attendee.status === "declined" && (
                      <span className="badge badge-red flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Abgesagt
                      </span>
                    )}
                    {attendee.status === "pending" && (
                      <span className="badge badge-gray flex items-center gap-1">
                        <Clock3 className="w-3 h-3" />
                        Ausstehend
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info für Parents wenn keine Anmeldung */}
      {userRole === "parent" && !currentUserMemberId && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="card-body">
            <p className="text-yellow-900 dark:text-yellow-100">
              ⚠️ Du hast noch kein Kind verknüpft. Bitte wende dich an einen Administrator.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
