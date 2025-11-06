import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import AvatarUploadSection from "@/app/components/AvatarUploadSection";
import { User, Calendar, Award, Mail, Phone, Crown, Shield, Users as UsersIcon, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  const userId = session.user.id;

  // Get member data for all non-admin users
  let memberData: any = null;
  let childrenData: any[] = [];
  
  if (userRole !== "admin") {
    // Get member data if user has member_id
    const userData = await sql`
      SELECT member_id FROM users WHERE id = ${userId}
    `;
    
    if (userData.length > 0 && userData[0].member_id) {
      const memberResult = await sql`
        SELECT 
          m.id,
          m.first_name,
          m.last_name,
          m.birth_date,
          m.nationality,
          m.email,
          m.phone,
          m.avatar_url,
          m.created_at,
          t.name as team_name,
          t.level as team_level,
          t.coach as team_coach
        FROM members m
        LEFT JOIN teams t ON m.team_id = t.id
        WHERE m.id = ${userData[0].member_id}
      `;
      
      if (memberResult.length > 0) {
        memberData = memberResult[0];
      }
    }
    
    // Get children for parents
    if (userRole === "parent") {
      childrenData = await sql`
        SELECT 
          m.id,
          m.first_name,
          m.last_name,
          m.birth_date,
          m.nationality,
          m.email,
          m.phone,
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
    }
  }

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: Crown };
      case 'manager':
        return { label: 'Manager', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: Shield };
      case 'coach':
        return { label: 'Coach', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Shield };
      case 'parent':
        return { label: 'Elternteil', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: UsersIcon };
      default:
        return { label: 'Mitglied', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: User };
    }
  };

  const roleInfo = getRoleInfo(userRole);
  const RoleIcon = roleInfo.icon;

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

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
                Mein Profil
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
        <div className="space-y-4 sm:space-y-6">
          {/* Account Information Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4 sm:mb-6">
                Account-Informationen
              </h2>
              
              {/* Avatar Upload Section */}
              <div className="mb-6 sm:mb-8">
                <AvatarUploadSection 
                  currentAvatar={memberData?.avatar_url || null}
                  userName={session.user.name || "User"}
                />
              </div>

              {/* User Details Grid */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Name</p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                      {session.user.name || "Nicht angegeben"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">E-Mail</p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${roleInfo.bg} ${roleInfo.color} flex items-center justify-center flex-shrink-0`}>
                    <RoleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Rolle</p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                      {roleInfo.label}
                    </p>
                  </div>
                </div>

                {/* Phone (if member data exists) */}
                {memberData?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Telefon</p>
                      <a
                        href={`tel:${memberData.phone}`}
                        className="font-semibold text-sm sm:text-base text-red-600 dark:text-red-400 hover:underline"
                      >
                        {memberData.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Member Info Card (for non-admins with member data) */}
          {memberData && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4 sm:mb-6">
                  Mitgliedschafts-Informationen
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Age */}
                  {memberData.birth_date && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Alter</p>
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                          {calculateAge(memberData.birth_date)} Jahre
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Nationality */}
                  {memberData.nationality && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Nationalität</p>
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                          {memberData.nationality}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Team */}
                  {memberData.team_name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                        <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Team</p>
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                          {memberData.team_name}
                        </p>
                        {memberData.team_level && (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {memberData.team_level}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Coach */}
                  {memberData.team_coach && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Coach</p>
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                          {memberData.team_coach}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Member Since */}
                  {memberData.created_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Mitglied seit</p>
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                          {new Date(memberData.created_at).toLocaleDateString("de-DE", { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Children Cards (for parents) */}
          {userRole === "parent" && childrenData.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 px-1">
                Meine Kinder
              </h2>
              
              {childrenData.map((child: any) => (
                <div key={child.id} className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <div className="p-4 sm:p-6 lg:p-8">
                    {/* Child Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex-shrink-0">
                        {child.avatar_url ? (
                          <img
                            src={child.avatar_url}
                            alt={`${child.first_name} ${child.last_name}`}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-lg sm:text-xl">
                            {child.first_name[0]}{child.last_name[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-50">
                          {child.first_name} {child.last_name}
                        </h3>
                        {child.team_name && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm sm:text-base font-medium text-red-600 dark:text-red-400">
                              {child.team_name}
                            </span>
                            {child.team_level && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                  {child.team_level}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Child Info Grid */}
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Age */}
                      {child.birth_date && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Alter</p>
                            <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-slate-50">
                              {calculateAge(child.birth_date)} Jahre
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Nationality */}
                      {child.nationality && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                            <UsersIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Nationalität</p>
                            <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-slate-50">
                              {child.nationality}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Coach */}
                      {child.team_coach && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Coach</p>
                            <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-slate-50">
                              {child.team_coach}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      {child.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Email</p>
                            <a
                              href={`mailto:${child.email}`}
                              className="font-medium text-sm sm:text-base text-red-600 dark:text-red-400 hover:underline truncate block"
                            >
                              {child.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Phone */}
                      {child.phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Telefon</p>
                            <a
                              href={`tel:${child.phone}`}
                              className="font-medium text-sm sm:text-base text-red-600 dark:text-red-400 hover:underline"
                            >
                              {child.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State for Parents without children */}
          {userRole === "parent" && childrenData.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-6 sm:p-8 lg:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  Keine Kinder zugeordnet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Bitte kontaktiere einen Administrator, um deine Kinder zu verknüpfen.
                </p>
              </div>
            </div>
          )}

          {/* Empty State for Admins */}
          {userRole === "admin" && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-6 sm:p-8 lg:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  Administrator-Account
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Als Administrator hast du vollen Zugriff auf alle Funktionen des Systems.
                </p>
                <Link
                  href="/members"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium transition-all duration-200 shadow-lg"
                >
                  <UsersIcon className="w-5 h-5" />
                  Mitglieder verwalten
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

