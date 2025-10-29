import { Calendar, Users, Dumbbell, Trophy, User, Mail, Clock, MapPin, MessageCircle, Settings as SettingsIcon, Home, Bell } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Willkommen, {member.first_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/messages"
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base hidden sm:inline">Chat</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-all duration-200"
              >
                <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base hidden sm:inline">Einstellungen</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Member Profile Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden lg:sticky lg:top-24">
              {/* Profile Header */}
              <div className="relative h-20 sm:h-24 lg:h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              </div>
              
              {/* Profile Content */}
              <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 lg:pb-8">
                <div className="flex flex-col items-center -mt-8 sm:-mt-10 lg:-mt-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 shadow-2xl border-4 border-white dark:border-slate-800">
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={`${member.first_name} ${member.last_name}`}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-lg sm:text-xl lg:text-2xl">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
                      {member.first_name} {member.last_name}
                    </h2>
                    
                    {team && (
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                        {team.name}
                      </div>
                    )}
                    
                    {member.email && (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 sm:mt-3">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate max-w-[200px]">{member.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-4 sm:mt-6 space-y-2">
                  <Link
                    href="/profil"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Mein Profil
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/messages"
                      className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg font-medium text-xs transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Chat
                    </Link>
                    <Link
                      href="/calendar"
                      className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg font-medium text-xs transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      Kalender
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Trainings</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{upcomingTrainings.length}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Events</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{upcomingEvents.length}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Team</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{teamMembers.length}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
                  Schnellzugriff
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <Link
                    href="/trainings"
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4 text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-lg bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">Trainings</p>
                  </Link>
                  
                  <Link
                    href="/events"
                    className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3 sm:p-4 text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-lg bg-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-100">Events</p>
                  </Link>
                  
                  <Link
                    href="/messages"
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4 text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-lg bg-green-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">Chat</p>
                  </Link>
                  
                  <Link
                    href="/calendar"
                    className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 sm:p-4 text-center hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-lg bg-orange-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-orange-900 dark:text-orange-100">Kalender</p>
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Trainings */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
                      Kommende Trainings
                    </h3>
                  </div>
                  <Link 
                    href="/trainings" 
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  >
                    Alle anzeigen
                  </Link>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {upcomingTrainings.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {upcomingTrainings.slice(0, 5).map((training: any) => (
                      <TrainingCard key={training.id} training={training} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                      <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Keine anstehenden Trainings</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
                      Kommende Events
                    </h3>
                  </div>
                  <Link 
                    href="/events" 
                    className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
                  >
                    Alle anzeigen
                  </Link>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {upcomingEvents.slice(0, 4).map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Keine anstehenden Events</p>
                  </div>
                )}
              </div>
            </div>

            {/* Team & Coaches */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Team Members */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
                      Team
                    </h3>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  {teamMembers.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {teamMembers.map((teamMember: any) => (
                        <TeamMemberCard key={teamMember.id} member={teamMember} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Kein Team zugeordnet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Coaches */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
                      Coaches
                    </h3>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  {coaches.length > 0 ? (
                    <div className="space-y-3">
                      {coaches.map((coach: any) => (
                        <CoachCard key={coach.id} coach={coach} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Keine Coaches verfügbar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainingCard({ training }: any) {
  const statusColors = {
    accepted: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    declined: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
    pending: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
  };
  
  const status = training.status || "pending";
  const statusClass = statusColors[status as keyof typeof statusColors];

  const statusLabels = {
    accepted: "Zugesagt",
    declined: "Abgesagt", 
    pending: "Ausstehend"
  };

  return (
    <div className={`border rounded-xl p-3 sm:p-4 ${statusClass} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base">
            {training.team_name || 'Training'}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {new Date(training.training_date).toLocaleDateString("de-DE", { 
              weekday: "long", 
              day: "2-digit", 
              month: "long" 
            })}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusClass}`}>
          {statusLabels[status as keyof typeof statusLabels]}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{training.start_time} - {training.end_time}</span>
        </div>
        {training.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{training.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: any) {
  return (
    <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:bg-purple-100 dark:hover:bg-purple-900/30">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base flex-1">
          {event.title}
        </h4>
        {event.event_type && (
          <span className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium ml-2">
            {event.event_type}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>
            {new Date(event.event_date).toLocaleDateString("de-DE", { 
              day: "2-digit", 
              month: "short", 
              year: "numeric" 
            })}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CoachCard({ coach }: any) {
  return (
    <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:bg-red-100 dark:hover:bg-red-900/30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-200 dark:bg-red-800 flex items-center justify-center text-red-800 dark:text-red-200 font-bold text-sm border border-red-300 dark:border-red-700">
          {coach.name?.[0] || "C"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base truncate">
            {coach.name}
          </p>
          {coach.email && (
            <a 
              href={`mailto:${coach.email}`} 
              className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 truncate"
            >
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{coach.email}</span>
            </a>
          )}
        </div>
        <Link
          href={`/messages/new?to=${coach.id}`}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1 flex-shrink-0"
        >
          <MessageCircle className="w-3 h-3" />
          <span className="hidden sm:inline">Nachricht</span>
        </Link>
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: any) {
  return (
    <div className="flex items-center gap-3 p-2 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-800">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-slate-300 dark:border-slate-600">
        {member.avatar_url ? (
          <Image 
            src={member.avatar_url} 
            alt={member.first_name} 
            width={40} 
            height={40} 
            className="object-cover w-full h-full" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs sm:text-sm">
            {member.first_name[0]}{member.last_name[0]}
          </div>
        )}
      </div>
      <p className="text-slate-900 dark:text-slate-50 text-sm sm:text-base truncate flex-1 font-medium">
        {member.first_name} {member.last_name}
      </p>
    </div>
  );
}
