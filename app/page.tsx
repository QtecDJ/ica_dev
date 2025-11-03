import { getStats, getMember, getTeam } from "./actions";
import { Users, Calendar, Trophy, Dumbbell, TrendingUp, UserPlus, CheckCircle, XCircle, Bell, ArrowRight, User, Clock, MapPin } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import MemberDashboard from "./components/MemberDashboard";
import DynamicDashboardContent from "./components/DynamicDashboardContent";
import { neon } from "@neondatabase/serverless";
import type { Session } from "next-auth";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

export default async function Home() {
  const session = (await getServerSession(authOptions)) as Session | null;
  const userRole = session?.user?.role;
  const memberId = session?.user?.memberId;

  // If user is a parent, show parent dashboard
  if (userRole === "parent" && session?.user?.id) {
    return <ParentDashboard userId={session.user.id} userName={session.user.name} />;
  }

  // If user is a member, show member dashboard
  if (userRole === "member" && memberId) {
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
            SELECT DISTINCT u.id, u.name, m.email
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
    red: "text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
    black: "text-white bg-black hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800",
    white: "text-black bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-100 dark:hover:bg-gray-200",
    gray: "text-black bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
  };

  return (
    <Link href={href} className="group transform transition-all duration-200 hover:scale-105">
      <div className="card-body text-center h-full">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${colorClasses[color]} transition-all duration-200 group-hover:scale-110 shadow-lg`}>
          {icon}
        </div>
        <h4 className="font-semibold text-black dark:text-white mb-1">
          {title}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
}

  // Admin/Coach Dashboard
  const stats = await getStats();
  
  // Extended Stats für Admin/Coach mit Training-Statistiken
  const extendedStats = await sql`
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
    ),
    comment_stats AS (
      SELECT COUNT(*) as unread_comments
      FROM comments
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    )
    SELECT 
      (SELECT upcoming_trainings FROM training_stats) as upcoming_trainings,
      (SELECT total_accepted FROM training_stats) as training_accepted,
      (SELECT total_declined FROM training_stats) as training_declined,
      (SELECT total_pending FROM training_stats) as training_pending,
      (SELECT upcoming_events_count FROM upcoming_events) as upcoming_events,
      (SELECT new_members_30d FROM recent_members) as new_members,
      (SELECT unread_comments FROM comment_stats) as unread_comments
  `;

  const adminStats = extendedStats[0];

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

      {/* Extended Stats for Admin */}
      {userRole === "admin" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MiniStatCard
            icon={<UserPlus className="w-5 h-5" />}
            title="Neue (30 Tage)"
            value={adminStats.new_members || 0}
            color="gray"
          />
          <MiniStatCard
            icon={<CheckCircle className="w-5 h-5" />}
            title="Zusagen"
            value={adminStats.training_accepted || 0}
            color="black"
          />
          <MiniStatCard
            icon={<XCircle className="w-5 h-5" />}
            title="Absagen"
            value={adminStats.training_declined || 0}
            color="red"
          />
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
        {/* Schnellzugriff - nur für Admins */}
        {userRole === "admin" && (
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
            </div>
          </div>
        )}

        {/* System-Übersicht mit Training-Statistiken */}
        <div className={`card ${userRole === "coach" ? "lg:col-span-2" : ""}`}>
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

            {/* Nachrichten-Statistik */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Neue Kommentare
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Letzte 7 Tage
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {adminStats.unread_comments || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    red: "text-white bg-red-600 dark:bg-red-700",
    black: "text-white bg-black dark:bg-gray-900",
    white: "text-black bg-white border border-gray-200 dark:bg-gray-100",
    gray: "text-black bg-gray-100 dark:bg-gray-800 dark:text-white",
  };

  return (
    <Link href={href} className="group transform transition-all duration-200 hover:scale-105">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{title}</p>
            <p className="text-3xl font-bold text-black dark:text-white">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]} shadow-lg group-hover:scale-110 transition-all duration-200`}>
            {icon}
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
    red: "text-red-600 dark:text-red-400",
    black: "text-black dark:text-white",
    white: "text-gray-600 dark:text-gray-300",
    gray: "text-gray-600 dark:text-gray-400",
  };

  return (
    <div className="card transform transition-all duration-200 hover:scale-105">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-2">
          <div className={colorClasses[color]}>
            {icon}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
            {title}
          </p>
        </div>
        <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
    >
      <span className="text-slate-900 dark:text-slate-50 font-medium">{title}</span>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
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
