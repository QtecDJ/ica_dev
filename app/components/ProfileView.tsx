import { User, Calendar, Award, Mail, Phone, Crown, Shield, Users as UsersIcon } from "lucide-react";
import AvatarUploadSection from "./AvatarUploadSection";

type ProfileViewProps = {
  member: {
    id: number;
    first_name: string;
    last_name: string;
    birth_date: string;
    nationality?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    team_name?: string;
    team_level?: string;
    team_coach?: string;
    parent_name?: string;
    parent_email?: string;
    parent_phone?: string;
  };
  userRole?: string;
  showAvatarUpload?: boolean;
  userName?: string;
};

export default function ProfileView({ member, userRole, showAvatarUpload = false, userName }: ProfileViewProps) {
  const getRoleInfo = (role?: string) => {
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

  const roleInfo = getRoleInfo(userRole);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Avatar Section */}
        <div className="mb-6 sm:mb-8 flex flex-col items-center">
          {showAvatarUpload ? (
            <AvatarUploadSection 
              currentAvatar={member.avatar_url || null}
              userName={userName || `${member.first_name} ${member.last_name}`}
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex-shrink-0 shadow-xl mb-4">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={`${member.first_name} ${member.last_name}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-3xl sm:text-4xl">
                  {member.first_name[0]}{member.last_name[0]}
                </div>
              )}
            </div>
          )}
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 text-center mb-2">
            {member.first_name} {member.last_name}
          </h2>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {member.team_name && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <UsersIcon className="w-4 h-4" />
                <span>{member.team_name}</span>
                {member.team_level && (
                  <>
                    <span>•</span>
                    <span>{member.team_level}</span>
                  </>
                )}
              </div>
            )}
            {userRole && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${roleInfo.bg} ${roleInfo.color}`}>
                <RoleIcon className="w-4 h-4" />
                {roleInfo.label}
              </div>
            )}
          </div>
        </div>

        {/* Member Info Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Age */}
          {member.birth_date && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Alter</p>
                <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                  {calculateAge(member.birth_date)} Jahre
                </p>
              </div>
            </div>
          )}

          {/* Nationality */}
          {member.nationality && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Nationalität</p>
                <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                  {member.nationality}
                </p>
              </div>
            </div>
          )}

          {/* Team Coach */}
          {member.team_coach && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Coach</p>
                <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                  {member.team_coach}
                </p>
              </div>
            </div>
          )}

          {/* Email */}
          {member.email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Email</p>
                <a
                  href={`mailto:${member.email}`}
                  className="font-semibold text-sm sm:text-base text-red-600 dark:text-red-400 hover:underline truncate block"
                >
                  {member.email}
                </a>
              </div>
            </div>
          )}

          {/* Phone */}
          {member.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Telefon</p>
                <a
                  href={`tel:${member.phone}`}
                  className="font-semibold text-sm sm:text-base text-red-600 dark:text-red-400 hover:underline"
                >
                  {member.phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Parent/Guardian Info */}
        {(member.parent_name || member.parent_email || member.parent_phone) && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              Erziehungsberechtigte(r)
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {member.parent_name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Name</p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">{member.parent_name}</p>
                  </div>
                </div>
              )}
              {member.parent_email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Email</p>
                    <a
                      href={`mailto:${member.parent_email}`}
                      className="font-semibold text-sm sm:text-base text-red-600 dark:text-red-400 hover:underline truncate block"
                    >
                      {member.parent_email}
                    </a>
                  </div>
                </div>
              )}
              {member.parent_phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Telefon</p>
                    <a
                      href={`tel:${member.parent_phone}`}
                      className="font-semibold text-sm sm:text-base text-red-600 dark:text-red-400 hover:underline"
                    >
                      {member.parent_phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Member Since */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
            Mitglied seit {new Date(member.created_at).toLocaleDateString("de-DE", { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
