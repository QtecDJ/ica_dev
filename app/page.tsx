import { getStats, getMember, getTeam } from "./actions";
import { Users, Calendar, Trophy, Dumbbell, TrendingUp, UserPlus, CheckCircle, XCircle, Bell, ArrowRight, User, Clock, MapPin, BookMarked } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions, hasRole, hasAnyRole } from "@/lib/auth-utils";
import MemberDashboard from "./components/MemberDashboard";
import DynamicDashboardContent from "./components/DynamicDashboardContent";
import ClickableMiniStatCard from "./components/ClickableMiniStatCard";
import ClickableMiniStatCardAdmin from "./components/ClickableMiniStatCardAdmin";
import { neon } from "@neondatabase/serverless";
import type { Session } from "next-auth";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

export default async function Home() {
  const session = (await getServerSession(authOptions)) as Session | null;
  const userRole = session?.user?.role;
  const memberId = session?.user?.memberId;

  // Check if user has specific roles (multi-role support)
  const isAdmin = hasAnyRole(session, ["admin"]);
  const isManager = hasAnyRole(session, ["manager"]);
  const isCoach = hasAnyRole(session, ["coach"]);
  const isParent = hasRole(session, "parent");
  const isMember = hasRole(session, "member");
  
  // If user ONLY has parent role (and no other admin/manager/coach roles), show parent dashboard
  if (isParent && !isAdmin && !isManager && !isCoach && session?.user?.id) {
    return <ParentDashboard userId={session.user.id} userName={session.user.name} />;
  }

  // If user ONLY has member role (and no other admin/manager/coach roles), show member dashboard
  if (isMember && !isAdmin && !isManager && !isCoach && memberId) {
    const member = await getMember(memberId);
    
    if (member) {
      const team = member.team_id ? await getTeam(member.team_id) : null;
    
      // Get upcoming trainings for this member
      const upcomingTrainings = await sql`
        SELECT t.*, ta.status, tm.name as team_name
        FROM trainings t
        LEFT JOIN training_attendance ta ON t.id = ta.training_id AND ta.member_id = ${memberId}
        LEFT JOIN teams tm ON t.team_id = tm.id
        WHERE t.training_date >= CURRENT_DATE
        AND (t.team_id = ${member.team_id} OR t.team_id IS NULL)
        ORDER BY t.training_date ASC, t.start_time ASC
        LIMIT 10
      `;

      // Get upcoming events
      const upcomingEvents = await sql`
        SELECT * FROM events
        WHERE event_date >= CURRENT_DATE
        ORDER BY event_date ASC
        LIMIT 10
      `;

      // Get team members
      const teamMembers = member.team_id
        ? await sql`
            SELECT id, first_name, last_name, avatar_url
            FROM members
            WHERE team_id = ${member.team_id}
            AND id != ${memberId}
            ORDER BY first_name ASC
          `
        : [];

      // Get coaches from own team only
      const coaches = member.team_id
        ? await sql`
            SELECT DISTINCT u.id, u.name, m.email, tc.is_primary
            FROM team_coaches tc
            JOIN users u ON tc.coach_id = u.id
            LEFT JOIN members m ON u.member_id = m.id
            WHERE tc.team_id = ${member.team_id}
            AND u.role = 'coach'
            ORDER BY tc.is_primary DESC, u.name ASC
          `
        : [];

      return (
        <MemberDashboard
          member={member}
          team={team}
          upcomingTrainings={upcomingTrainings}
          upcomingEvents={upcomingEvents}
          teamMembers={teamMembers}
          coaches={coaches}
        />
      );
    }
}

async function ParentDashboard({ userId, userName }: { userId: string; userName?: string | null }) {
  try {
    // Vereinfachtes Dashboard ohne Kind-Verknüpfungen
    // Zeige nur allgemeine Events und Trainings an
    
    // Get all upcoming events (not child-specific)
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
      LIMIT 6
    `;

    // Get all upcoming trainings (not child-specific)
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
      LIMIT 6
    `;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              Willkommen zurück
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {userName}, hier ist eine Übersicht über aktuelle Events und Trainings
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            Eltern-Ansicht
          </div>
        </div>

        {/* Info-Banner für Eltern - Dynamisch aus CMS */}
        <DynamicDashboardContent />

        {/* Quick Access Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            href="/events"
            icon={<Calendar className="w-6 h-6" />}
            title="Events"
            description="Alle Veranstaltungen"
            color="red"
          />
          <QuickActionCard
            href="/calendar"
            icon={<Calendar className="w-6 h-6" />}
            title="Kalender"
            description="Terminübersicht"
            color="black"
          />
          <QuickActionCard
            href="/trainings"
            icon={<Dumbbell className="w-6 h-6" />}
            title="Trainings"
            description="Trainingszeiten"
            color="gray"
          />
          <QuickActionCard
            href="/meine-kinder"
            icon={<Users className="w-6 h-6" />}
            title="Meine Kinder"
            description="Informationen"
            color="white"
          />
        </div>

        {/* Upcoming Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h2 className="text-lg font-semibold">Kommende Events</h2>
                </div>
                <Link href="/events" className="text-sm text-red-600 dark:text-red-400 hover:underline">
                  Alle anzeigen
                </Link>
              </div>
            </div>
            <div className="card-body">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 4).map((event: any) => (
                    <div key={event.id} className="border-l-4 border-red-200 dark:border-red-800 pl-3 py-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                            {event.event_type && (
                              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                                {event.event_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Keine kommenden Events
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Trainings */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold">Kommende Trainings</h2>
                </div>
                <Link href="/trainings" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                  Alle anzeigen
                </Link>
              </div>
            </div>
            <div className="card-body">
              {upcomingTrainings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTrainings.slice(0, 4).map((training: any) => (
                    <div key={training.id} className="border-l-4 border-gray-200 dark:border-gray-800 pl-3 py-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                            {training.team_name || 'Training'}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(training.date).toLocaleDateString('de-DE')}
                            </div>
                            {training.start_time && (
                              <span className="text-xs">
                                {training.start_time} - {training.end_time}
                              </span>
                            )}
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
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Keine kommenden Trainings
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ParentDashboard:", error);
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Willkommen zurück, {userName}
          </p>
        </div>
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="card-body text-center py-12">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              👋 Willkommen im Elternbereich!
            </h3>
            <p className="text-red-700 dark:text-red-300">
              Nutzen Sie die Navigation, um Events, Kalender und Trainings anzuzeigen.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

function QuickActionCard({ href, icon, title, description, color }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "red" | "black" | "white" | "gray";
}) {
  const colorClasses = {
    red: "text-white bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-glow-red",
    black: "text-white bg-gradient-to-br from-gray-900 to-black hover:from-black hover:to-gray-900",
    white: "text-black bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-gray-300 dark:bg-gradient-to-br dark:from-gray-100 dark:to-gray-200",
    gray: "text-gray-900 dark:text-white bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800",
  };

  return (
    <Link href={href} className="group">
      <div className="card-hover text-center h-full relative overflow-hidden">
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
        
        <div className="card-body relative z-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colorClasses[color]} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-elegant`}>
            {icon}
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

  // Admin/Coach Dashboard
  const stats = await getStats();
  
  // Get coach's team IDs if user has coach role
  const coachTeamIds = isCoach
    ? await sql`
        SELECT team_id 
        FROM team_coaches 
        WHERE coach_id = ${session?.user?.id}
      `
    : [];
  
  const coachTeamIdList = coachTeamIds.map((t: any) => t.team_id);
  
  // Extended Stats für Admin/Manager/Coach mit Training-Statistiken
  const extendedStats = (isAdmin || isManager)
    ? await sql`
        WITH training_stats AS (
          SELECT 
            COUNT(DISTINCT t.id) as upcoming_trainings,
            COUNT(CASE WHEN ta.status = 'accepted' THEN 1 END) as total_accepted,
            COUNT(CASE WHEN ta.status = 'declined' THEN 1 END) as total_declined,
            COUNT(CASE WHEN ta.status = 'pending' THEN 1 END) as total_pending
          FROM trainings t
          LEFT JOIN training_attendance ta ON t.id = ta.training_id
          WHERE t.training_date >= CURRENT_DATE
        ),
        upcoming_events AS (
          SELECT COUNT(*) as upcoming_events_count
          FROM events
          WHERE event_date >= CURRENT_DATE
        ),
        recent_members AS (
          SELECT COUNT(*) as new_members_30d
          FROM members
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        )
        SELECT 
          (SELECT upcoming_trainings FROM training_stats) as upcoming_trainings,
          (SELECT total_accepted FROM training_stats) as training_accepted,
          (SELECT total_declined FROM training_stats) as training_declined,
          (SELECT total_pending FROM training_stats) as training_pending,
          (SELECT upcoming_events_count FROM upcoming_events) as upcoming_events,
          (SELECT new_members_30d FROM recent_members) as new_members
      `
    : await sql`
        WITH training_stats AS (
          SELECT 
            COUNT(DISTINCT t.id) as upcoming_trainings,
            COUNT(CASE WHEN ta.status = 'accepted' THEN 1 END) as total_accepted,
            COUNT(CASE WHEN ta.status = 'declined' THEN 1 END) as total_declined,
            COUNT(CASE WHEN ta.status = 'pending' THEN 1 END) as total_pending
          FROM trainings t
          LEFT JOIN training_attendance ta ON t.id = ta.training_id
          WHERE t.training_date >= CURRENT_DATE
            AND t.team_id = ANY(${coachTeamIdList})
        ),
        upcoming_events AS (
          SELECT COUNT(*) as upcoming_events_count
          FROM events
          WHERE event_date >= CURRENT_DATE
        ),
        recent_members AS (
          SELECT COUNT(*) as new_members_30d
          FROM members
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            AND team_id = ANY(${coachTeamIdList})
        )
        SELECT 
          (SELECT upcoming_trainings FROM training_stats) as upcoming_trainings,
          (SELECT total_accepted FROM training_stats) as training_accepted,
          (SELECT total_declined FROM training_stats) as training_declined,
          (SELECT total_pending FROM training_stats) as training_pending,
          (SELECT upcoming_events_count FROM upcoming_events) as upcoming_events,
          (SELECT new_members_30d FROM recent_members) as new_members
      `;

  const adminStats = extendedStats[0];

  // Get decline reasons for THE NEXT upcoming training only (Admin/Manager/Coach)
  const nextTrainingDeclines = (isAdmin || isManager || isCoach)
    ? (isAdmin || isManager)
      ? await sql`
          WITH next_training AS (
            SELECT id, training_date, start_time
            FROM trainings
            WHERE training_date >= CURRENT_DATE
            ORDER BY training_date ASC, start_time ASC
            LIMIT 1
          )
          SELECT 
            ta.decline_reason,
            ta.updated_at,
            m.first_name || ' ' || m.last_name as member_name,
            t.training_date,
            t.start_time,
            teams.name as team_name
          FROM training_attendance ta
          JOIN members m ON ta.member_id = m.id
          JOIN trainings t ON ta.training_id = t.id
          LEFT JOIN teams ON t.team_id = teams.id
          WHERE ta.status = 'declined' 
            AND ta.decline_reason IS NOT NULL
            AND t.id = (SELECT id FROM next_training)
          ORDER BY m.last_name ASC, m.first_name ASC
        `
      : await sql`
          WITH next_training AS (
            SELECT id, training_date, start_time
            FROM trainings
            WHERE training_date >= CURRENT_DATE
              AND team_id = ANY(${coachTeamIdList})
            ORDER BY training_date ASC, start_time ASC
            LIMIT 1
          )
          SELECT 
            ta.decline_reason,
            ta.updated_at,
            m.first_name || ' ' || m.last_name as member_name,
            t.training_date,
            t.start_time,
            teams.name as team_name
          FROM training_attendance ta
          JOIN members m ON ta.member_id = m.id
          JOIN trainings t ON ta.training_id = t.id
          LEFT JOIN teams ON t.team_id = teams.id
          WHERE ta.status = 'declined' 
            AND ta.decline_reason IS NOT NULL
            AND t.id = (SELECT id FROM next_training)
          ORDER BY m.last_name ASC, m.first_name ASC
        `
    : [];

  // Auto-delete old trainings (older than 30 days)
  if (isAdmin || isManager) {
    try {
      await sql`
        DELETE FROM trainings
        WHERE training_date < CURRENT_DATE - INTERVAL '30 days'
      `;
    } catch (error) {
      console.error("Error deleting old trainings:", error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Willkommen zurück, {session?.user?.name || "Admin"}
        </p>
      </div>

      {/* Dashboard Content - Dynamische Nachrichten für Coaches/Admins */}
      <DynamicDashboardContent />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          title="Teams"
          value={stats.teams}
          color="red"
          href="/teams"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Mitglieder"
          value={stats.members}
          color="black"
          href="/members"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="Events"
          value={stats.events}
          color="gray"
          href="/events"
        />
        <StatCard
          icon={<Dumbbell className="w-6 h-6" />}
          title="Trainings"
          value={stats.trainings}
          color="white"
          href="/trainings"
        />
      </div>

      {/* Extended Stats for Admin, Manager & Coach */}
      {(isAdmin || isManager || isCoach) && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show coach-specific stats if user is ONLY coach OR if coach with teams */}
          {isCoach && !isAdmin && !isManager ? (
            <ClickableMiniStatCard
              icon={<CheckCircle className="w-5 h-5" />}
              title="Zusagen (Meine Teams)"
              value={adminStats.training_accepted || 0}
              color="black"
              status="accepted"
              coachTeamIds={coachTeamIdList}
            />
          ) : (
            <ClickableMiniStatCardAdmin
              icon={<CheckCircle className="w-5 h-5" />}
              title="Zusagen"
              value={adminStats.training_accepted || 0}
              color="black"
              status="accepted"
            />
          )}
          {isCoach && !isAdmin && !isManager ? (
            <ClickableMiniStatCard
              icon={<XCircle className="w-5 h-5" />}
              title="Absagen (Meine Teams)"
              value={adminStats.training_declined || 0}
              color="red"
              status="declined"
              coachTeamIds={coachTeamIdList}
            />
          ) : (
            <ClickableMiniStatCardAdmin
              icon={<XCircle className="w-5 h-5" />}
              title="Absagen"
              value={adminStats.training_declined || 0}
              color="red"
              status="declined"
            />
          )}
          <MiniStatCard
            icon={<Bell className="w-5 h-5" />}
            title="Anstehende Events"
            value={adminStats.upcoming_events || 0}
            color="white"
          />
        </div>
      )}

      {/* Quick Actions & System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schnellzugriff - für Admins und Manager */}
        {(isAdmin || isManager) && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Schnellzugriff</h2>
              </div>
            </div>
            <div className="card-body space-y-2">
              <QuickLink href="/teams" title="Teams verwalten" />
              <QuickLink href="/members" title="Mitglieder verwalten" />
              <QuickLink href="/events" title="Events planen" />
              <QuickLink href="/trainings" title="Trainings planen" />
              <QuickLink href="/users" title="Benutzerverwaltung" />
              <QuickLink href="/administration/regelwerke" title="Regelwerke verwalten" />
            </div>
          </div>
        )}

        {/* Regelwerk Schnellzugriff - für Coaches und Manager */}
        {(isCoach || isManager) && !isAdmin && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <BookMarked className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold">Regelwerke</h2>
              </div>
            </div>
            <div className="card-body">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {isManager 
                  ? "Hier findest du alle wichtigen Regelwerke und Richtlinien"
                  : "Hier findest du alle wichtigen Regelwerke für dein Team"}
              </p>
              <Link 
                href="/regelwerke"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <BookMarked className="w-5 h-5" />
                Regelwerke ansehen
              </Link>
            </div>
          </div>
        )}

        {/* System-Übersicht mit Training-Statistiken - für Admins und Manager */}
        {(isAdmin || isManager) && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5" />
                <h2 className="text-lg font-semibold">System-Übersicht</h2>
              </div>
            </div>
            <div className="card-body">
              {/* Basis-Statistiken */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <InfoRow label="Teams" value={stats.teams} />
                  <InfoRow label="Mitglieder" value={stats.members} />
                </div>
                <div className="space-y-3">
                  <InfoRow label="Events" value={stats.events} />
                  <InfoRow label="Trainings" value={stats.trainings} />
                </div>
              </div>

              {/* Training-Statistiken */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Training-Teilnahme (kommende Trainings)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-black/5 dark:bg-black/20 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-black dark:text-white" />
                    </div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {adminStats.training_accepted || 0}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">Zusagen</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {adminStats.training_declined || 0}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium">Absagen</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {adminStats.training_pending || 0}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Ausstehend</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Next Training Declines - Only the next one */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Training Declines - Only the next one */}
        {(isAdmin || isManager || isCoach) && nextTrainingDeclines.length > 0 && (
          <div className="card lg:col-span-2">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold">Absagen für nächstes Training</h2>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  {nextTrainingDeclines[0] && new Date(nextTrainingDeclines[0].training_date).toLocaleDateString('de-DE', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {nextTrainingDeclines.map((decline: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {decline.member_name}
                      </span>
                      {decline.team_name && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({decline.team_name})
                        </span>
                      )}
                    </div>
                    <div className="pl-6 text-sm text-red-800 dark:text-red-300 italic">
                      "{decline.decline_reason}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, href }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number; 
  color: "red" | "black" | "white" | "gray";
  href: string;
}) {
  const colorClasses = {
    red: "text-white bg-gradient-to-br from-red-600 to-red-700 shadow-glow-red",
    black: "text-white bg-gradient-to-br from-gray-900 to-black",
    white: "text-black bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 dark:border-gray-700",
    gray: "text-gray-900 dark:text-white bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
  };

  return (
    <Link href={href} className="group">
      <div className="card-hover overflow-hidden relative">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="card-body relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{title}</p>
              <p className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent animate-fade-in">{value}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClasses[color]} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              {icon}
            </div>
          </div>
          
          {/* Hover indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
            <span>Details anzeigen</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function MiniStatCard({ icon, title, value, color }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "red" | "black" | "white" | "gray";
}) {
  const colorClasses = {
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    black: "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800",
    white: "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900",
    gray: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
  };

  const iconBgClasses = {
    red: "bg-red-100 dark:bg-red-900/30",
    black: "bg-gray-200 dark:bg-gray-700",
    white: "bg-gray-100 dark:bg-gray-800",
    gray: "bg-gray-200 dark:bg-gray-700",
  };

  return (
    <div className="card-hover group">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClasses[color]} ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
            {title}
          </p>
        </div>
        <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent dark:hover:from-red-900/20 dark:hover:to-transparent border-2 border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-300 group"
    >
      <span className="text-gray-900 dark:text-gray-50 font-semibold group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">{title}</span>
      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-2 transition-all duration-300" />
    </Link>
  );
}

function InfoRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">{value}</span>
    </div>
  );
}
