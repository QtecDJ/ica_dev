import { getMember, getTeam } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Phone, Calendar, Users, User as UserIcon, Edit, Award } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import type { Session } from "next-auth";

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions)) as Session | null;
  const member = await getMember(parseInt(params.id));

  if (!member) {
    redirect("/members");
  }

  const team = member.team_id ? await getTeam(member.team_id) : null;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zur Übersicht</span>
        </Link>
        <Link
          href={`/members/${params.id}/edit`}
          className="btn btn-primary"
        >
          <Edit className="w-4 h-4" />
          Bearbeiten
        </Link>
      </div>

      {/* Member Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Member Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex-shrink-0 shadow-xl">
              {member.avatar_url ? (
                <Image
                  src={member.avatar_url}
                  alt={`${member.first_name} ${member.last_name}`}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-2xl sm:text-3xl">
                  {member.first_name[0]}{member.last_name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {member.first_name} {member.last_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {team && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    <Users className="w-4 h-4" />
                    <span>{team.name}</span>
                    {team.level && (
                      <>
                        <span>•</span>
                        <span>{team.level}</span>
                      </>
                    )}
                  </div>
                )}
                {member.user_role && (
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    member.user_role === "admin" ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                    member.user_role === "coach" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                    member.user_role === "member" ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                    "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                  }`}>
                    {member.user_role === "admin" ? "Administrator" :
                     member.user_role === "coach" ? "Coach" :
                     member.user_role === "member" ? "Mitglied" :
                     "Elternteil"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Member Info Grid */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Age */}
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

            {/* Team Coach */}
            {team?.coach && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Coach</p>
                  <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                    {team.coach}
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
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                Erziehungsberechtigte(r)
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {member.parent_name && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5" />
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
    </div>
  );
}
