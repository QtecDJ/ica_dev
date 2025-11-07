import { getMembers, deleteMember } from "../actions";
import { Plus, Pencil, Eye, Users } from "lucide-react";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function MembersPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  
  // Alle rollen können Mitglieder sehen
  if (!session?.user) {
    redirect("/login");
  }

  let members: any[] = [];

  if (userRole === "admin" || userRole === "manager") {
    // Admin und Manager sehen ALLE Mitglieder
    members = await getMembers();
  } else if (userRole === "coach") {
    // Coach sieht nur Mitglieder seiner zugewiesenen Teams
    members = await sql`
      SELECT DISTINCT m.*, t.name as team_name
      FROM members m
      LEFT JOIN teams t ON m.team_id = t.id
      INNER JOIN team_coaches tc ON t.id = tc.team_id
      WHERE tc.coach_id = ${userId}
      ORDER BY m.last_name, m.first_name
    `;
  } else if (userRole === "member") {
    // Members sehen nur Mitglieder ihres eigenen Teams
    members = await sql`
      SELECT DISTINCT m2.*, t.name as team_name
      FROM users u
      INNER JOIN members m ON u.member_id = m.id
      LEFT JOIN teams t ON m.team_id = t.id
      INNER JOIN members m2 ON m2.team_id = t.id
      WHERE u.id = ${userId} AND m.team_id IS NOT NULL
      ORDER BY m2.last_name, m2.first_name
    `;
  } else if (userRole === "parent") {
    // Parents sehen ihre Kinder
    members = await sql`
      SELECT DISTINCT m.*, t.name as team_name
      FROM members m
      LEFT JOIN teams t ON m.team_id = t.id
      INNER JOIN parent_children pc ON pc.child_member_id = m.id
      WHERE pc.parent_user_id = ${userId}
      ORDER BY m.last_name, m.first_name
    `;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Mitglieder
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {members.length} {members.length === 1 ? 'Mitglied' : 'Mitglieder'}
            {userRole === "coach" && " in deinen Teams"}
            {userRole === "member" && " in deinem Team"}
            {userRole === "parent" && " (deine Kinder)"}
          </p>
        </div>
        {(userRole === "admin" || userRole === "manager") && (
          <Link href="/members/new" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            Neues Mitglied
          </Link>
        )}
      </div>

      {/* Members Grid/Table */}
      {members.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block card overflow-hidden">
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
                  {members.map((member: any) => (
                    <tr key={member.id}>
                      <td>
                        <Link href={`/members/${member.id}`} className="block">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            {member.avatar_url ? (
                              <Image
                                src={member.avatar_url}
                                alt={`${member.first_name} ${member.last_name}`}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs font-bold">
                                {member.first_name[0]}{member.last_name[0]}
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td>
                        <Link 
                          href={`/members/${member.id}`}
                          className="font-medium text-gray-900 dark:text-gray-50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {member.first_name} {member.last_name}
                        </Link>
                      </td>
                      <td className="text-gray-600 dark:text-gray-400">
                        {new Date(member.birth_date).toLocaleDateString("de-DE")}
                      </td>
                      <td>
                        {member.team_name ? (
                          <span className="badge-red">{member.team_name}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="text-gray-600 dark:text-gray-400">
                        {member.email || "-"}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/members/${member.id}`}
                            className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                            title="Profil ansehen"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {(userRole === "admin" || userRole === "manager") && (
                            <>
                              <Link
                                href={`/members/${member.id}/edit`}
                                className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                title="Bearbeiten"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                              <DeleteButton id={member.id} action={deleteMember} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {members.map((member: any) => (
              <div key={member.id} className="card-hover">
                <div className="card-body">
                  <div className="flex items-start gap-4 mb-4">
                    <Link href={`/members/${member.id}`} className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {member.avatar_url ? (
                          <Image
                            src={member.avatar_url}
                            alt={`${member.first_name} ${member.last_name}`}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold text-lg">
                            {member.first_name[0]}{member.last_name[0]}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/members/${member.id}`}
                        className="font-semibold text-lg text-gray-900 dark:text-gray-50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        {member.first_name} {member.last_name}
                      </Link>
                      {member.team_name && (
                        <span className="badge-red text-xs mt-1 inline-block">
                          {member.team_name}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/members/${member.id}`}
                        className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      {(userRole === "admin" || userRole === "manager") && (
                        <>
                          <Link
                            href={`/members/${member.id}/edit`}
                            className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                          >
                            <Pencil className="w-5 h-5" />
                          </Link>
                          <DeleteButton id={member.id} action={deleteMember} />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Geburtsdatum:</span>
                      <span className="text-gray-900 dark:text-gray-50">
                        {new Date(member.birth_date).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                    {member.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="text-gray-900 dark:text-gray-50 truncate ml-2">
                          {member.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
              Noch keine Mitglieder
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
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
