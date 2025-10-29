import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import Image from "next/image";
import { User, Calendar, Users as UsersIcon, Award, Mail, Phone, Crown, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

const sql = neon(process.env.DATABASE_URL!);

export default async function ProfilPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  const userId = session.user.id;

  // Prüfe, ob Coach auch ein Mitglied ist
  let isCoachMember = false;
  let coachMemberData = null;
  
  if (userRole === "coach") {
    const coachMember = await sql`
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        m.birth_date,
        m.email,
        m.phone,
        m.avatar_url,
        m.created_at,
        t.name as team_name,
        t.level as team_level
      FROM users u
      JOIN members m ON u.member_id = m.id
      LEFT JOIN teams t ON m.team_id = t.id
      WHERE u.id = ${userId}
    `;
    
    if (coachMember.length > 0) {
      isCoachMember = true;
      coachMemberData = coachMember[0];
    }
  }

  // Admin leitet zur Mitglieder-Seite weiter, Coach nur wenn er kein Mitglied ist
  if (userRole === "admin" || (userRole === "coach" && !isCoachMember)) {
    redirect("/members");
  }

  // Hole die relevanten Mitglieder basierend auf der Rolle
  let members: any[] = [];
  let pageTitle = "Mein Profil";
  let pageDescription = "Übersicht deiner Informationen";
  
  if (userRole === "parent") {
    // Parent sieht seine Kinder
    members = await sql`
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        m.birth_date,
        m.email,
        m.phone,
        m.parent_name,
        m.parent_email,
        m.parent_phone,
        m.avatar_url,
        m.created_at,
        t.name as team_name,
        t.level as team_level,
        t.coach as team_coach
      FROM members m
      LEFT JOIN teams t ON m.team_id = t.id
      LEFT JOIN parent_children pc ON pc.child_member_id = m.id
      WHERE pc.parent_user_id = ${userId}
      ORDER BY m.first_name, m.last_name
    `;
    pageTitle = "Meine Kinder";
    pageDescription = "Übersicht deiner Kinder";
  } else if (userRole === "coach" && isCoachMember) {
    // Coach sieht sein eigenes Mitgliedsprofil
    members = [coachMemberData];
    pageTitle = "Mein Profil";
    pageDescription = "Übersicht deiner Mitgliedschaft";
  }

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: Crown };
      case 'coach':
        return { label: 'Coach', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: User };
      case 'parent':
        return { label: 'Elternteil', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: User };
      default:
        return { label: 'Mitglied', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: User };
    }
  };

  const roleInfo = getRoleInfo(userRole);
  const RoleIcon = roleInfo.icon;

  if (members.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {pageTitle}
                </h1>
              </div>
              
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

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                {userRole === "parent" ? "Keine Kinder zugeordnet" : "Kein Mitgliedsprofil"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {userRole === "parent" 
                  ? "Bitte kontaktiere einen Administrator, um deine Kinder zu verknüpfen."
                  : "Du bist nicht als Mitglied registriert."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {pageTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {members.length} {userRole === "parent" ? (members.length === 1 ? 'Kind' : 'Kinder') : 'Profil'}
                </p>
              </div>
            </div>
            
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar - User Info */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden lg:sticky lg:top-24">
              {/* Profile Header */}
              <div className="relative h-20 sm:h-24 lg:h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              </div>
              
              {/* Profile Content */}
              <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 lg:pb-8">
                <div className="flex flex-col items-center -mt-8 sm:-mt-10 lg:-mt-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 dark:text-slate-300 shadow-2xl border-4 border-white dark:border-slate-800">
                    {session.user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  
                  <div className="text-center mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
                      {session.user.name}
                    </h2>
                    
                    <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${roleInfo.bg} ${roleInfo.color}`}>
                      <RoleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      {roleInfo.label}
                    </div>
                    
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 sm:mt-3">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate max-w-[200px]">{session.user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Member Cards */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
            {members.map((member: any) => (
              <div key={member.id} className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Member Header */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={`${member.first_name} ${member.last_name}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-lg sm:text-xl">
                          {member.first_name[0]}{member.last_name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {member.first_name} {member.last_name}
                      </h3>
                      {member.team_name && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm sm:text-base font-medium text-red-600 dark:text-red-400">
                            {member.team_name}
                          </span>
                          {member.team_level && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                {member.team_level}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member Info Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Alter</p>
                          <p className="font-medium text-slate-900 dark:text-slate-50 text-sm sm:text-base">
                            {(() => {
                              const birthDate = new Date(member.birth_date);
                              const today = new Date();
                              let age = today.getFullYear() - birthDate.getFullYear();
                              const monthDiff = today.getMonth() - birthDate.getMonth();
                              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                              }
                              return `${age} Jahre`;
                            })()}
                          </p>
                        </div>
                      </div>

                      {member.team_coach && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Coach</p>
                            <p className="font-medium text-slate-900 dark:text-slate-50 text-sm sm:text-base">
                              {member.team_coach}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {member.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Email</p>
                            <a
                              href={`mailto:${member.email}`}
                              className="font-medium text-red-600 dark:text-red-400 hover:underline text-sm sm:text-base truncate block"
                            >
                              {member.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {member.phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Telefon</p>
                            <a
                              href={`tel:${member.phone}`}
                              className="font-medium text-red-600 dark:text-red-400 hover:underline text-sm sm:text-base"
                            >
                              {member.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member since info */}
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
                      Mitglied seit {new Date(member.created_at).toLocaleDateString("de-DE", { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}