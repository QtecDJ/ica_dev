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
    pageTitle = "Mein Kind";
    pageDescription = "Übersicht deiner Kinder";
  } else if (userRole === "coach" && isCoachMember) {
    // Coach sieht sein eigenes Mitgliedsprofil
    members = [coachMemberData];
    pageTitle = "Mein Profil";
    pageDescription = "Übersicht deiner Mitgliedschaft";
  }

  if (members.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{pageTitle}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {pageDescription}
          </p>
        </div>

        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {userRole === "parent" ? "Keine Kinder zugeordnet" : "Kein Mitgliedsprofil"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {userRole === "parent" 
                ? "Bitte kontaktiere einen Administrator, um deine Kinder zu verknüpfen."
                : "Du bist nicht als Mitglied registriert."
              }
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{pageTitle}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {members.length} {userRole === "parent" ? (members.length === 1 ? 'Kind' : 'Kinder') : 'Profil'}
          </p>
        </div>
      </div>

      {/* Member Cards */}
      <div className="grid gap-4">
        {members.map((member: any) => (
          <div key={member.id} className="card-hover bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="card-body p-4">
              {/* Compact Avatar & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={`${member.first_name} ${member.last_name}`}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-lg">
                      {member.first_name[0]}{member.last_name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 truncate">
                    {member.first_name} {member.last_name}
                  </h3>
                  {member.team_name && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      {member.team_name}
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
                      const birthDate = new Date(member.birth_date);
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

                {member.team_coach && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Coach
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-50 truncate">
                      {member.team_coach}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}