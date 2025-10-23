import { getStats, getMember, getTeam, getMembers } from "./actions";
import { Users, Calendar, Trophy, Dumbbell, TrendingUp, Star, CheckCircle, XCircle, AlertTriangle, UserPlus, BarChart3, Bell } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Sci-Fi Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
          <div className="relative px-6 py-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/30">
              ∞
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Infinity Cheer Allstars</h1>
              <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
                <Star className="w-3 h-3 fill-cyan-400" />
                {userRole === "admin" ? "Admin" : "Coach"} Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            title="Teams"
            value={stats.teams}
            color="cyan"
            link="/teams"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            title="Mitglieder"
            value={stats.members}
            color="blue"
            link="/members"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            title="Events"
            value={stats.events}
            color="purple"
            link="/events"
          />
          <StatCard
            icon={<Dumbbell className="w-5 h-5" />}
            title="Trainings"
            value={stats.trainings}
            color="green"
            link="/trainings"
          />
        </div>

        {/* Admin Extended Stats */}
        {userRole === "admin" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStatCard
              icon={<UserPlus className="w-4 h-4" />}
              title="Neue (30T)"
              value={adminStats.new_members || 0}
              color="green"
            />
            <MiniStatCard
              icon={<CheckCircle className="w-4 h-4" />}
              title="Zusagen"
              value={adminStats.accepted_count || 0}
              color="cyan"
            />
            <MiniStatCard
              icon={<XCircle className="w-4 h-4" />}
              title="Absagen"
              value={adminStats.declined_count || 0}
              color="red"
            />
            <MiniStatCard
              icon={<Bell className="w-4 h-4" />}
              title="Events bald"
              value={adminStats.upcoming_events || 0}
              color="purple"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SciFiCard title="Schnellzugriff" icon={<TrendingUp className="w-4 h-4" />} color="cyan">
            <div className="space-y-2">
              <QuickLink href="/teams" title="Teams verwalten" icon="🏆" />
              <QuickLink href="/members" title="Mitglieder verwalten" icon="👥" />
              <QuickLink href="/events" title="Events planen" icon="📅" />
              <QuickLink href="/trainings" title="Trainings planen" icon="💪" />
              {userRole === "admin" && (
                <>
                  <QuickLink href="/users" title="Benutzerverwaltung" icon="👤" />
                  <QuickLink href="/reports" title="Berichte & Statistiken" icon="📊" />
                </>
              )}
            </div>
          </SciFiCard>

          <SciFiCard title={userRole === "admin" ? "Team-Übersicht" : "Systeminfo"} icon={<BarChart3 className="w-4 h-4" />} color="blue">
            {userRole === "admin" && adminStats.team_stats ? (
              <div className="space-y-2">
                {(adminStats.team_stats as any[]).map((team: any, index: number) => (
                  <TeamStatRow key={index} team={team} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <InfoRow label="Gesamte Teams" value={stats.teams} />
                <InfoRow label="Gesamte Mitglieder" value={stats.members} />
                <InfoRow label="Aktive Events" value={stats.events} />
                <InfoRow label="Geplante Trainings" value={stats.trainings} />
              </div>
            )}
          </SciFiCard>
        </div>
      </div>
    </div>
  );
}

function SciFiCard({ title, icon, color, children }: any) {
  const colorMap = {
    cyan: "border-cyan-500/30 bg-cyan-500/5",
    blue: "border-blue-500/30 bg-blue-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
    green: "border-green-500/30 bg-green-500/5",
  };

  return (
    <div className={`bg-slate-900 border ${colorMap[color as keyof typeof colorMap]} rounded-lg overflow-hidden`}>
      <div className="border-b border-slate-800 px-4 py-2 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatCard({ icon, title, value, color, link }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number; 
  color: string;
  link: string;
}) {
  const colorMap = {
    cyan: "border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 shadow-cyan-500/10",
    blue: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 shadow-blue-500/10",
    purple: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 shadow-purple-500/10",
    green: "border-green-500/30 bg-green-500/5 hover:bg-green-500/10 shadow-green-500/10",
  };
  
  const textColorMap = {
    cyan: "text-cyan-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
  };

  return (
    <a href={link} className={`bg-slate-900 border ${colorMap[color as keyof typeof colorMap]} rounded-lg p-3 transition-all hover:shadow-lg group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs mb-0.5">{title}</p>
          <p className={`text-2xl font-bold ${textColorMap[color as keyof typeof textColorMap]}`}>{value}</p>
        </div>
        <div className={`${textColorMap[color as keyof typeof textColorMap]} opacity-50 group-hover:opacity-100 transition-opacity`}>
          {icon}
        </div>
      </div>
    </a>
  );
}

function QuickLink({ href, title, icon }: { href: string; title: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 border border-slate-800 rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all group"
    >
      <div className="text-xl">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">{title}</h3>
      </div>
      <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-xl font-bold text-cyan-400">{value}</span>
    </div>
  );
}

function MiniStatCard({ icon, title, value, color }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}) {
  const colorMap = {
    cyan: "border-cyan-500/30 bg-cyan-500/5",
    blue: "border-blue-500/30 bg-blue-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
    green: "border-green-500/30 bg-green-500/5",
    red: "border-red-500/30 bg-red-500/5",
  };
  
  const textColorMap = {
    cyan: "text-cyan-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
    red: "text-red-400",
  };

  return (
    <div className={`bg-slate-900 border ${colorMap[color as keyof typeof colorMap]} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`${textColorMap[color as keyof typeof textColorMap]}`}>
          {icon}
        </div>
        <p className="text-slate-400 text-xs uppercase tracking-wide">{title}</p>
      </div>
      <p className={`text-2xl font-bold ${textColorMap[color as keyof typeof textColorMap]}`}>{value}</p>
    </div>
  );
}

function TeamStatRow({ team }: { team: any }) {
  const maxMembers = 20; // Annahme für die Fortschrittsbalken-Berechnung
  const percentage = Math.min((team.member_count / maxMembers) * 100, 100);
  
  return (
    <div className="py-2 border-b border-slate-800 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-white text-sm font-semibold">{team.team_name}</span>
          <span className="text-slate-500 text-xs ml-2">Level {team.level}</span>
        </div>
        <span className="text-cyan-400 font-bold text-sm">{team.member_count}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
