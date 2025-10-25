import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import Image from "next/image";
import { User, Mail, Phone, Calendar, Users as UsersIcon, Award } from "lucide-react";

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Mein Profil</h1>
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Mein Profil</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {children.length} {children.length === 1 ? 'Kind' : 'Kinder'}
        </p>
      </div>

      {/* Children Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children.map((child: any) => (
          <div key={child.id} className="card-hover">
            <div className="card-body">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 mb-4">
                  {child.avatar_url ? (
                    <Image
                      src={child.avatar_url}
                      alt={`${child.first_name} ${child.last_name}`}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-2xl">
                      {child.first_name[0]}{child.last_name[0]}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {child.first_name} {child.last_name}
                </h3>
                {child.team_name && (
                  <span className="badge-blue text-xs mt-2">
                    {child.team_name} - {child.team_level}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">Geburtsdatum</div>
                    <div className="text-slate-900 dark:text-slate-50 font-medium">
                      {new Date(child.birth_date).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                </div>

                {child.team_coach && (
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs">Coach</div>
                      <div className="text-slate-900 dark:text-slate-50 font-medium">
                        {child.team_coach}
                      </div>
                    </div>
                  </div>
                )}

                {child.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div className="truncate">
                      <div className="text-slate-600 dark:text-slate-400 text-xs">Email</div>
                      <div className="text-slate-900 dark:text-slate-50 font-medium truncate">
                        {child.email}
                      </div>
                    </div>
                  </div>
                )}

                {child.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs">Telefon</div>
                      <div className="text-slate-900 dark:text-slate-50 font-medium">
                        {child.phone}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                Mitglied seit {new Date(child.created_at).toLocaleDateString("de-DE")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Parent Info Card */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                Deine Kontaktdaten
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Als Elternteil registriert
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Name</div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {session.user.name}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Email</div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {session.user.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
