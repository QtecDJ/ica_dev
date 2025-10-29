import { Calendar, Users, Dumbbell, Trophy, User, Mail, Clock, MapPin, MessageCircle, Settings as SettingsIcon, Home, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DynamicDashboardContent from "./DynamicDashboardContent";

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Willkommen zurück
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {member.first_name}, hier ist deine Übersicht über Trainings und Events
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <User className="w-4 h-4" />
          Mitglieder-Ansicht
        </div>
      </div>

      {/* Info-Banner für Mitglieder - Dynamisch aus CMS */}
      <DynamicDashboardContent />

      {/* Member Profile Card */}
      {team && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-semibold">Mein Team</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt={`${member.first_name} ${member.last_name}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-lg">
                    {member.first_name[0]}{member.last_name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {member.first_name} {member.last_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-medium text-red-600 dark:text-red-400">
                    {team.name}
                  </span>
                  {team.level && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {team.level}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Link
                href="/profil"
                className="btn btn-primary"
              >
                Mein Profil
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard
          href="/trainings"
          icon={<Dumbbell className="w-6 h-6" />}
          title="Trainings"
          description="Meine Trainings"
          color="blue"
        />
        <QuickActionCard
          href="/events"
          icon={<Calendar className="w-6 h-6" />}
          title="Events"
          description="Veranstaltungen"
          color="green"
        />
        <QuickActionCard
          href="/messages"
          icon={<MessageCircle className="w-6 h-6" />}
          title="Nachrichten"
          description="Chat"
          color="yellow"
        />
        <QuickActionCard
          href="/calendar"
          icon={<Calendar className="w-6 h-6" />}
          title="Kalender"
          description="Terminübersicht"
          color="red"
        />
      </div>

      {/* Upcoming Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Trainings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold">Kommende Trainings</h2>
              </div>
              <Link href="/trainings" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Alle anzeigen
              </Link>
            </div>
          </div>
          <div className="card-body">
            {upcomingTrainings.length > 0 ? (
              <div className="space-y-3">
                {upcomingTrainings.slice(0, 4).map((training: any) => (
                  <div key={training.id} className="border-l-4 border-blue-200 dark:border-blue-800 pl-3 py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-50 text-sm">
                          {training.team_name || 'Training'}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(training.training_date).toLocaleDateString('de-DE')}
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
                      {training.status && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          training.status === 'accepted' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : training.status === 'declined'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {training.status === 'accepted' ? 'Zugesagt' : training.status === 'declined' ? 'Abgesagt' : 'Ausstehend'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Keine kommenden Trainings
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold">Kommende Events</h2>
              </div>
              <Link href="/events" className="text-sm text-green-600 dark:text-green-400 hover:underline">
                Alle anzeigen
              </Link>
            </div>
          </div>
          <div className="card-body">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 4).map((event: any) => (
                  <div key={event.id} className="border-l-4 border-green-200 dark:border-green-800 pl-3 py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-50 text-sm">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.event_date).toLocaleDateString('de-DE')}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          {event.event_type && (
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded">
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
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Keine kommenden Events
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Team & Coaches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold">Mein Team</h2>
            </div>
          </div>
          <div className="card-body">
            {teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.slice(0, 6).map((teamMember: any) => (
                  <div key={teamMember.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                      {teamMember.avatar_url ? (
                        <Image 
                          src={teamMember.avatar_url} 
                          alt={teamMember.first_name} 
                          width={40} 
                          height={40} 
                          className="object-cover w-full h-full" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm">
                          {teamMember.first_name[0]}{teamMember.last_name[0]}
                        </div>
                      )}
                    </div>
                    <p className="text-slate-900 dark:text-slate-50 text-sm font-medium">
                      {teamMember.first_name} {teamMember.last_name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Kein Team zugeordnet
              </p>
            )}
          </div>
        </div>

        {/* Coaches */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-semibold">Meine Coaches</h2>
            </div>
          </div>
          <div className="card-body">
            {coaches.length > 0 ? (
              <div className="space-y-3">
                {coaches.map((coach: any) => (
                  <div key={coach.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm">
                        {coach.name?.[0] || "C"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50 text-sm">
                          {coach.name}
                        </p>
                        {coach.email && (
                          <a 
                            href={`mailto:${coach.email}`} 
                            className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {coach.email}
                          </a>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/messages/new?to=${coach.id}`}
                      className="btn btn-secondary text-xs"
                    >
                      Nachricht
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Keine Coaches verfügbar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ href, icon, title, description, color }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "red" | "blue" | "yellow" | "green";
}) {
  const colorClasses = {
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
    yellow: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
    green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
  };

  return (
    <Link href={href} className="card-hover group">
      <div className="card-body text-center">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
          {title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
