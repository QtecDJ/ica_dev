import { getStats, getMember, getTeam } from "./actions";
import { Users, Calendar, Trophy, Dumbbell, TrendingUp, UserPlus, CheckCircle, XCircle, Bell, ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import MemberDashboard from "./components/MemberDashboard";
import { neon } from "@neondatabase/serverless";
import type { Session } from "next-auth";
import Link from "next/link";

const sql = neon(process.env.DATABASE_URL!);

export default async function Home() {
  const session = (await getServerSession(authOptions)) as Session | null;
  const userRole = session?.user?.role;
  const memberId = session?.user?.memberId;

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

      // Get coaches (users with coach role)
      const coaches = await sql`
        SELECT u.id, u.name, m.email
        FROM users u
        LEFT JOIN members m ON u.member_id = m.id
        WHERE u.role = 'coach'
        ORDER BY u.name ASC
      `;

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

  // Admin/Coach Dashboard
  const stats = await getStats();
  
  // Extended Admin Stats
  const extendedStats = await sql`
    WITH attendance_stats AS (
      SELECT 
        COUNT(DISTINCT ta.member_id) as total_attendees,
        COUNT(CASE WHEN ta.status = 'accepted' THEN 1 END) as accepted_count,
        COUNT(CASE WHEN ta.status = 'declined' THEN 1 END) as declined_count
      FROM training_attendance ta
      JOIN trainings t ON ta.training_id = t.id
      WHERE t.training_date >= CURRENT_DATE - INTERVAL '30 days'
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
    team_distribution AS (
      SELECT 
        t.name,
        t.level,
        COUNT(m.id) as member_count
      FROM teams t
      LEFT JOIN members m ON t.id = m.team_id
      GROUP BY t.id, t.name, t.level
      ORDER BY member_count DESC
      LIMIT 5
    )
    SELECT 
      (SELECT total_attendees FROM attendance_stats) as total_attendees,
      (SELECT accepted_count FROM attendance_stats) as accepted_count,
      (SELECT declined_count FROM attendance_stats) as declined_count,
      (SELECT upcoming_events_count FROM upcoming_events) as upcoming_events,
      (SELECT new_members_30d FROM recent_members) as new_members,
      (SELECT json_agg(team_distribution.*) FROM team_distribution) as team_stats
  `;

  const adminStats = extendedStats[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Willkommen zurück, {session?.user?.name || "Admin"}
        </p>
      </div>

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
          color="blue"
          href="/members"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="Events"
          value={stats.events}
          color="purple"
          href="/events"
        />
        <StatCard
          icon={<Dumbbell className="w-6 h-6" />}
          title="Trainings"
          value={stats.trainings}
          color="green"
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
            color="green"
          />
          <MiniStatCard
            icon={<CheckCircle className="w-5 h-5" />}
            title="Zusagen"
            value={adminStats.accepted_count || 0}
            color="blue"
          />
          <MiniStatCard
            icon={<XCircle className="w-5 h-5" />}
            title="Absagen"
            value={adminStats.declined_count || 0}
            color="red"
          />
          <MiniStatCard
            icon={<Bell className="w-5 h-5" />}
            title="Anstehende Events"
            value={adminStats.upcoming_events || 0}
            color="purple"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {userRole === "admin" && (
              <QuickLink href="/users" title="Benutzerverwaltung" />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5" />
              <h2 className="text-lg font-semibold">System-Übersicht</h2>
            </div>
          </div>
          <div className="card-body space-y-3">
            <InfoRow label="Teams" value={stats.teams} />
            <InfoRow label="Mitglieder" value={stats.members} />
            <InfoRow label="Events" value={stats.events} />
            <InfoRow label="Trainings" value={stats.trainings} />
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
  color: "red" | "blue" | "purple" | "green";
  href: string;
}) {
  const colorClasses = {
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
    green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
  };

  return (
    <Link href={href} className="card-hover group">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
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
  color: "red" | "blue" | "purple" | "green";
}) {
  const colorClasses = {
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    green: "text-green-600 dark:text-green-400",
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-2">
          <div className={colorClasses[color]}>
            {icon}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-medium">
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
