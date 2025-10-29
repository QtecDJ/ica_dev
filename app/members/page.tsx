import { getMembers, deleteMember } from "../actions";
import type { MemberRecord } from "../actions";
import {
  Plus,
  Pencil,
  Eye,
  Users,
  UserCheck,
  UserMinus,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";

const germanDateFormatter = new Intl.DateTimeFormat("de-DE");

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return germanDateFormatter.format(date);
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const firstInitial = firstName?.trim()?.[0] ?? "";
  const lastInitial = lastName?.trim()?.[0] ?? "";
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();
  return initials || "IC";
}

function getDisplayName(firstName: string | null, lastName: string | null): string {
  const displayName = [firstName, lastName]
    .filter((value) => Boolean(value && value.trim().length))
    .join(" ")
    .trim();
  return displayName || "Unbekanntes Mitglied";
}

export default async function MembersPage() {
  const session = await requireAuth();
  const userRole = session.user.role;

  // Only admin and coach can see all members
  if (userRole !== "admin" && userRole !== "coach") {
    redirect("/profil");
  }

  const members = await getMembers();

  const totalMembers = members.length;
  const membersWithTeam = members.filter(
    (member): member is MemberRecord & { team_name: string } => Boolean(member.team_name)
  );
  const membersWithoutTeam = totalMembers - membersWithTeam.length;
  const teamCount = new Set(membersWithTeam.map((member) => member.team_name)).size;
  const currentMonth = new Date().getMonth();
  const birthdaysThisMonth = members.filter((member) => {
    if (!member.birth_date) return false;
    const birthDate = new Date(member.birth_date);
    return !Number.isNaN(birthDate.getTime()) && birthDate.getMonth() === currentMonth;
  }).length;

  const memberStats: Array<{
    label: string;
    value: number;
    icon: LucideIcon;
    accentClasses: string;
  }> = [
    {
      label: "Aktive Mitglieder",
      value: totalMembers,
      icon: Users,
      accentClasses: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    },
    {
      label: "Teams vertreten",
      value: teamCount,
      icon: UserCheck,
      accentClasses: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300",
    },
    {
      label: "Ohne Team",
      value: membersWithoutTeam,
      icon: UserMinus,
      accentClasses: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300",
    },
    {
      label: "Geburtstage (diesen Monat)",
      value: birthdaysThisMonth,
      icon: CalendarDays,
      accentClasses: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
            Mitgliederverwaltung
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Verwalte aktive Mitglieder, Teamzuweisungen und Kontaktdaten im Überblick
          </p>
        </div>
        <Link href="/members/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Neues Mitglied
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {memberStats.map(({ label, value, icon: Icon, accentClasses }) => (
          <div key={label} className="card">
            <div className="card-body flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentClasses}`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Members Grid/Table */}
      {members.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block card overflow-hidden">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Geburtsdatum</th>
                    <th>Team</th>
                    <th>Email</th>
                    <th className="text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const displayName = getDisplayName(member.first_name, member.last_name);
                    const email = member.email?.trim() ?? "";

                    return (
                      <tr key={member.id}>
                        <td>
                          <Link href={`/members/${member.id}`} className="block">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                              {member.avatar_url ? (
                                <Image
                                  src={member.avatar_url}
                                  alt={displayName}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 text-xs font-bold">
                                  {getInitials(member.first_name, member.last_name)}
                                </div>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td>
                          <Link
                            href={`/members/${member.id}`}
                            className="font-medium text-slate-900 dark:text-slate-50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            {displayName}
                          </Link>
                        </td>
                        <td className="text-slate-600 dark:text-slate-400">
                          {formatDate(member.birth_date)}
                        </td>
                        <td>
                          {member.team_name ? (
                            <span className="badge-blue">{member.team_name}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="text-slate-600 dark:text-slate-400">
                          {email ? (
                            <a
                              href={`mailto:${email}`}
                              className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              {email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/members/${member.id}`}
                              className="text-slate-600 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-colors"
                              title="Profil ansehen"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/members/${member.id}/edit`}
                              className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                              title="Bearbeiten"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <DeleteButton id={member.id} action={deleteMember} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="md:hidden space-y-4">
            {members.map((member) => {
              const displayName = getDisplayName(member.first_name, member.last_name);
              const email = member.email?.trim() ?? "";

              return (
                <div key={member.id} className="card-hover">
                  <div className="card-body space-y-4">
                    <div className="flex items-start gap-4">
                      <Link href={`/members/${member.id}`} className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                          {member.avatar_url ? (
                            <Image
                              src={member.avatar_url}
                              alt={displayName}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-lg">
                              {getInitials(member.first_name, member.last_name)}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/members/${member.id}`}
                          className="font-semibold text-lg text-slate-900 dark:text-slate-50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {displayName}
                        </Link>
                        {member.team_name ? (
                          <span className="badge-blue text-xs mt-2 inline-block">{member.team_name}</span>
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400 mt-2 inline-block">Keinem Team zugeordnet</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Geburtsdatum:</span>
                        <span className="text-slate-900 dark:text-slate-50">{formatDate(member.birth_date)}</span>
                      </div>
                      {email.length > 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-600 dark:text-slate-400">Email:</span>
                          <a
                            href={`mailto:${email}`}
                            className="text-slate-900 dark:text-slate-50 hover:text-red-600 dark:hover:text-red-400 truncate max-w-[60%] transition-colors"
                          >
                            {email}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href={`/members/${member.id}`}
                        className="text-slate-600 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-colors"
                        aria-label="Profil ansehen"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/members/${member.id}/edit`}
                        className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                        aria-label="Mitglied bearbeiten"
                      >
                        <Pencil className="w-5 h-5" />
                      </Link>
                      <DeleteButton id={member.id} action={deleteMember} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Noch keine Mitglieder
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Füge dein erstes Mitglied hinzu, um loszulegen!
            </p>
            <Link href="/members/new" className="btn btn-primary inline-flex">
              <Plus className="w-5 h-5" />
              Neues Mitglied erstellen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
