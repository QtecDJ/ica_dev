import { Calendar, Users, Dumbbell, Trophy, User, Mail, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface MemberDashboardProps {
  member: any;
  team: any;
  upcomingTrainings: any[];
  upcomingEvents: any[];
  teamMembers: any[];
  coaches: any[];
}

export default function MemberDashboard({
  member,
  team,
  upcomingTrainings,
  upcomingEvents,
  teamMembers,
  coaches,
}: MemberDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Compact Sci-Fi Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
          <div className="relative px-6 py-4 flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                {member.avatar_url ? (
                  <Image src={member.avatar_url} alt={member.first_name} width={56} height={56} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-cyan-400">
                    {member.first_name[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-0.5">
                {member.first_name} {member.last_name}
              </h1>
              {team && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                    <Trophy className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 font-medium">{team.name}</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-xs">{team.level}</span>
                </div>
              )}
            </div>
            <Link
              href={`/members/${member.id}/edit`}
              className="bg-cyan-500 text-slate-900 px-4 py-1.5 rounded text-sm font-semibold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
            >
              Profil
            </Link>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Trainings</p>
                <p className="text-2xl font-bold text-blue-400">{upcomingTrainings.length}</p>
              </div>
              <Dumbbell className="w-5 h-5 text-blue-400 opacity-50" />
            </div>
          </div>
          <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Events</p>
                <p className="text-2xl font-bold text-purple-400">{upcomingEvents.length}</p>
              </div>
              <Calendar className="w-5 h-5 text-purple-400 opacity-50" />
            </div>
          </div>
          <div className="bg-slate-900 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Team</p>
                <p className="text-2xl font-bold text-green-400">{teamMembers.length}</p>
              </div>
              <Users className="w-5 h-5 text-green-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <SciFiCard title="Trainings" icon={<Dumbbell className="w-4 h-4" />} color="blue">
              {upcomingTrainings.length > 0 ? (
                <div className="space-y-2">
                  {upcomingTrainings.slice(0, 5).map((training: any) => (
                    <TrainingCard key={training.id} training={training} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-6">Keine Trainings</p>
              )}
            </SciFiCard>

            <SciFiCard title="Events" icon={<Calendar className="w-4 h-4" />} color="purple">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 4).map((event: any) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-6">Keine Events</p>
              )}
            </SciFiCard>
          </div>

          <div className="space-y-4">
            <SciFiCard title="Coaches" icon={<User className="w-4 h-4" />} color="red">
              {coaches.length > 0 ? (
                <div className="space-y-2">
                  {coaches.map((coach: any) => (
                    <CoachCard key={coach.id} coach={coach} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-6">Keine Coaches</p>
              )}
            </SciFiCard>

            <SciFiCard title="Team" icon={<Users className="w-4 h-4" />} color="green">
              {teamMembers.length > 0 ? (
                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                  {teamMembers.map((tm: any) => (
                    <TeamMemberCard key={tm.id} member={tm} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-6">Kein Team</p>
              )}
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function SciFiCard({ title, icon, color, children }: any) {
  const colorMap = {
    blue: "border-blue-500/30 bg-blue-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
    red: "border-red-500/30 bg-red-500/5",
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

function TrainingCard({ training }: any) {
  const statusColors = {
    accepted: "border-green-500/30 bg-green-500/10 text-green-400",
    declined: "border-red-500/30 bg-red-500/10 text-red-400",
    pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  };
  
  const status = training.status || "pending";
  const statusClass = statusColors[status as keyof typeof statusColors];

  return (
    <div className={`border ${statusClass} rounded-lg p-3 hover:bg-white/5 transition-colors`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-white text-sm">
            {new Date(training.training_date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" })}
          </p>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
            <Clock className="w-3 h-3" />
            <span>{training.start_time} - {training.end_time}</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusClass}`}>
          {status === "accepted" ? "✓" : status === "declined" ? "✗" : "?"}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
        <MapPin className="w-3 h-3" />
        <span>{training.location}</span>
      </div>
    </div>
  );
}

function EventCard({ event }: any) {
  return (
    <div className="border border-purple-500/30 bg-purple-500/10 rounded-lg p-3 hover:bg-purple-500/20 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white text-sm flex-1">{event.title}</h3>
        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs font-bold ml-2">
          {event.event_type}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
        <Calendar className="w-3 h-3" />
        <span>{new Date(event.event_date).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
        <MapPin className="w-3 h-3" />
        <span>{event.location}</span>
      </div>
    </div>
  );
}

function CoachCard({ coach }: any) {
  return (
    <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-3 hover:bg-red-500/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm border border-red-500/30">
          {coach.name?.[0] || "C"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{coach.name}</p>
          {coach.email && (
            <a href={`mailto:${coach.email}`} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{coach.email}</span>
            </a>
          )}
        </div>
        <Link
          href={`/messages/new?to=${coach.id}`}
          className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-600 transition-all flex-shrink-0"
        >
          MSG
        </Link>
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: any) {
  return (
    <div className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded transition-colors border border-transparent hover:border-green-500/20">
      <div className="w-8 h-8 rounded overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
        {member.avatar_url ? (
          <Image src={member.avatar_url} alt={member.first_name} width={32} height={32} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
            {member.first_name[0]}{member.last_name[0]}
          </div>
        )}
      </div>
      <p className="text-slate-300 text-xs truncate flex-1">
        {member.first_name} {member.last_name}
      </p>
    </div>
  );
}
