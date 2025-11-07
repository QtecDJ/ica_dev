import { requireRole, isAdmin } from "@/lib/auth-utils";
import Link from "next/link";
import { ArrowLeft, Shield, Crown, Users as UsersIcon } from "lucide-react";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import type { Session } from "next-auth";
import UserRoleManagerMulti from "@/app/components/UserRoleManagerMulti";

export default async function UserManagementPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  
  // Only admins can access this page
  if (!isAdmin(session)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Shield className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          Zugriff verweigert
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Nur Administratoren können Rollen verwalten.
        </p>
        <Link href="/" className="btn btn-primary">
          Zurück zum Dashboard
        </Link>
      </div>
    );
  }

  const sql = neon(process.env.DATABASE_URL!);
  
  // Get all users with their member information
  const usersResult = await sql`
    SELECT 
      u.id,
      u.username,
      u.name,
      u.email,
      u.role,
      u.roles,
      u.member_id,
      m.first_name,
      m.last_name
    FROM users u
    LEFT JOIN members m ON u.member_id = m.id
    ORDER BY 
      CASE u.role
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'coach' THEN 3
        WHEN 'parent' THEN 4
        ELSE 5
      END,
      u.name
  `;

  const users = usersResult.map(user => ({
    ...user,
    roles: user.roles && Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role]
  })) as Array<{
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
    roles: string[];
    member_id: number | null;
    first_name: string | null;
    last_name: string | null;
  }>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 sm:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-14 sm:h-16">
            <Link
              href="/settings"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium text-sm sm:text-base">Zurück</span>
            </Link>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 hidden xs:block">
                Rollenverwaltung
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Mehrfach-Rollenverwaltung - Nur für Administratoren
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Als Administrator kannst du hier Benutzerrollen zuweisen. Benutzer können <strong>mehrere Rollen gleichzeitig</strong> haben 
                (z.B. Coach + Manager). Die <strong>Manager</strong>-Rolle hat fast alle Admin-Rechte, 
                kann aber keine System-Einstellungen ändern und keine Rollen vergeben.
              </p>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-elegant border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <UsersIcon className="w-6 h-6 text-gray-900 dark:text-gray-50" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Benutzer ({users.length})
              </h2>
            </div>

            <UserRoleManagerMulti users={users} />
          </div>
        </div>
      </div>
    </div>
  );
}
