import { requireAuth } from "@/lib/auth-utils";
import Link from "next/link";
import { ArrowLeft, Settings, Bell, Shield, Palette, Key, Moon, Sun } from "lucide-react";
import { neon } from "@neondatabase/serverless";
import SettingsForm from "@/app/components/SettingsForm";
import DarkModeToggle from "@/app/components/DarkModeToggle";
import PasswordChangeForm from "@/app/components/PasswordChangeForm";

export default async function SettingsPage() {
  const session = await requireAuth();
  const user = session.user;

  const sql = neon(process.env.DATABASE_URL!);
  
  // Get user details
  const userDetails = await sql`
    SELECT name, email, role
    FROM users 
    WHERE id = ${user.id}
  `;

  const userData = userDetails[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 sm:pb-8">
      {/* Header - Mobil optimiert */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-14 sm:h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium text-sm sm:text-base">Zurück</span>
            </Link>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 hidden xs:block">
                Einstellungen
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Rollenverwaltung - Nur für Admins */}
        {userData.role === "admin" && (
          <Link href="/settings/users">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-elegant hover:shadow-elegant-hover border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all cursor-pointer hover:border-red-300 dark:hover:border-red-700">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">
                      Rollenverwaltung
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Verwalte Benutzerrollen und Berechtigungen
                    </p>
                  </div>
                  <div className="text-gray-400 dark:text-gray-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Dark Mode - Erste Position */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-elegant hover:shadow-elegant-hover border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 text-white flex items-center justify-center shadow-lg">
                <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">
                  Darstellung
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Wähle zwischen hellem und dunklem Modus
                </p>
              </div>
            </div>
            
            <DarkModeToggle />
          </div>
        </div>

        {/* Passwort ändern - Zweite Position */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-elegant hover:shadow-elegant-hover border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                <Key className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">
                  Passwort ändern
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Aktualisiere dein Passwort für mehr Sicherheit
                </p>
              </div>
            </div>
            
            <PasswordChangeForm userId={Number(user.id)} />
          </div>
        </div>

        {/* Benachrichtigungen */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-elegant hover:shadow-elegant-hover border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">
                  Push-Benachrichtigungen
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Bleibe über Nachrichten und Trainings informiert
                </p>
              </div>
            </div>
            
            <SettingsForm />
          </div>
        </div>
      </div>
    </div>
  );
}