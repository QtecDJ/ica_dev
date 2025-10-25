import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import Image from "next/image";
import { User, Calendar, Users as UsersIcon, Award } from "lucide-react";

const sql = neon(process.env.DATABASE_URL!);

export default async function ProfilPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  const userId = session.user.id;

  // Admin und Coach sehen keinen Profil-Bereich, sondern werden zur Mitglieder-Seite weitergeleitet
  if (userRole === "admin" || userRole === "coach") {
    redirect("/members");
  }

  // Hole die Kinder-Mitglieder des Parent-Users
  const children = await sql`
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

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Mein Kind</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Übersicht deiner Kinder
          </p>
        </div>

        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Keine Kinder zugeordnet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Bitte kontaktiere einen Administrator, um deine Kinder zu verknüpfen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Mein Kind</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {children.length} {children.length === 1 ? 'Kind' : 'Kinder'}
          </p>
        </div>
      </div>

      {/* Modern Compact Children Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child: any) => (
          <div key={child.id} className="card-hover bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="card-body p-4">
              {/* Compact Avatar & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                  {child.avatar_url ? (
                    <Image
                      src={child.avatar_url}
                      alt={`${child.first_name} ${child.last_name}`}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-lg">
                      {child.first_name[0]}{child.last_name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 truncate">
                    {child.first_name} {child.last_name}
                  </h3>
                  {child.team_name && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      {child.team_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Compact Info Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Alter
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-50">
                    {(() => {
                      const birthDate = new Date(child.birth_date);
                      const today = new Date();
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      return `${age} Jahre`;
                    })()}
                  </span>
                </div>

                {child.team_coach && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Coach
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-50 truncate ml-2">
                      {child.team_coach}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compact Parent Info Card */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50">
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  {session.user.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {session.user.email}
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-full">
              Elternteil
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
