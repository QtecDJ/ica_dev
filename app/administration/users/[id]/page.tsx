import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Shield, User as UserIcon, Calendar, Trophy, Users } from "lucide-react";
import { auth } from "@/auth";

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const sql = neon(process.env.DATABASE_URL!);
  
  // Hole Benutzer-Daten
  const users = await sql`
    SELECT 
      u.id,
      u.username,
      u.name,
      u.email,
      u.role,
      u.member_id,
      u.created_at,
      m.first_name,
      m.last_name,
      m.avatar_url,
      t.name as team_name
    FROM users u
    LEFT JOIN members m ON u.member_id = m.id
    LEFT JOIN teams t ON m.team_id = t.id
    WHERE u.id = ${parseInt(params.id)}
  `;

  if (users.length === 0) {
    redirect("/users");
  }

  const user = users[0];

  // Prüfe Berechtigung
  const isOwnProfile = session?.user?.id === user.id.toString();
  const isAdmin = session?.user?.role === "admin";

  if (!isOwnProfile && !isAdmin) {
    redirect("/");
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "badge-red";
      case "coach":
        return "badge-blue";
      case "member":
        return "badge-green";
      case "parent":
        return "badge-purple";
      default:
        return "badge-gray";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "coach":
        return "Coach";
      case "member":
        return "Mitglied";
      case "parent":
        return "Elternteil";
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />;
      case "coach":
        return <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case "member":
        return <Users className="w-6 h-6 text-green-600 dark:text-green-400" />;
      case "parent":
        return <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      default:
        return <UserIcon className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/users"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zur Übersicht</span>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-center -mt-8 mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                {getRoleIcon(user.role)}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              {user.name}
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={getRoleBadge(user.role)}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              @{user.username}
            </p>
          </div>
        </div>

        <div className="card-body">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Kontakt-Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Kontakt
              </h3>
              <div className="space-y-3">
                {user.email ? (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">E-Mail</p>
                      <a
                        href={`mailto:${user.email}`}
                        className="font-medium text-red-600 dark:text-red-400 hover:underline break-all"
                      >
                        {user.email}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Keine E-Mail-Adresse hinterlegt
                  </p>
                )}
              </div>
            </div>

            {/* Account-Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Account-Informationen
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Erstellt am</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {new Date(user.created_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verknüpftes Mitgliederprofil */}
          {user.member_id && user.first_name && (
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                Verknüpftes Mitgliederprofil
              </h3>
              <Link
                href={`/members/${user.member_id}`}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-600 dark:hover:border-red-400 transition-colors"
              >
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {user.first_name} {user.last_name}
                  </p>
                  {user.team_name && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {user.team_name}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>

        <div className="card-footer">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            Benutzer-ID: {user.id}
          </p>
        </div>
      </div>

      {/* Rollenbesch\u00f6rreibung */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Berechtigungen</h2>
          </div>
        </div>
        <div className="card-body">
          {user.role === "admin" && (
            <div className="alert-error">
              <h3 className="font-semibold mb-1">Administrator-Rechte</h3>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Vollzugriff auf alle Funktionen</li>
                <li>Kann Benutzer erstellen, bearbeiten und löschen</li>
                <li>Kann Teams und Mitglieder verwalten</li>
                <li>Kann Events und Trainings planen</li>
              </ul>
            </div>
          )}
          {user.role === "coach" && (
            <div className="alert-info">
              <h3 className="font-semibold mb-1">Coach-Rechte</h3>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Kann Teams verwalten</li>
                <li>Kann Trainings planen</li>
                <li>Kann Kommentare zu Mitgliedern schreiben</li>
                <li>Kann Mitgliederprofile einsehen</li>
              </ul>
            </div>
          )}
          {user.role === "member" && (
            <div className="alert-success">
              <h3 className="font-semibold mb-1">Mitglieder-Rechte</h3>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Kann eigenes Profil einsehen</li>
                <li>Kann Trainings zu- und absagen</li>
                <li>Kann öffentliche Kommentare lesen</li>
              </ul>
            </div>
          )}
          {user.role === "parent" && (
            <div className="alert-warning">
              <h3 className="font-semibold mb-1">Eltern-Rechte</h3>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Kann Profile der eigenen Kinder einsehen</li>
                <li>Kann Trainings für Kinder zu- und absagen</li>
                <li>Kann Kommentare zu Kindern lesen</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
