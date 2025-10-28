import { requireAuth } from "@/lib/auth-utils";
import Link from "next/link";
import { ArrowLeft, Settings, User, Bell, Shield, Palette } from "lucide-react";
import { neon } from "@neondatabase/serverless";
import SettingsForm from "@/app/components/SettingsForm";

export default async function SettingsPage() {
  const session = await requireAuth();
  const user = session.user;

  const sql = neon(process.env.DATABASE_URL!);
  
  // Get user details
  const userDetails = await sql`
    SELECT name, email, role, created_at
    FROM users 
    WHERE id = ${user.id}
  `;

  const userData = userDetails[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück zum Dashboard</span>
        </Link>
      </div>

      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Einstellungen
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-[60px]">
          Verwalte dein Profil und deine Benachrichtigungseinstellungen
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Profil-Übersicht */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold">Profil-Übersicht</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Name</label>
                <div className="input bg-slate-50 dark:bg-slate-800 cursor-not-allowed">
                  {userData.name}
                </div>
              </div>
              <div>
                <label className="label">E-Mail</label>
                <div className="input bg-slate-50 dark:bg-slate-800 cursor-not-allowed">
                  {userData.email}
                </div>
              </div>
              <div>
                <label className="label">Rolle</label>
                <div className="input bg-slate-50 dark:bg-slate-800 cursor-not-allowed">
                  {userData.role === 'admin' ? 'Administrator' : 
                   userData.role === 'coach' ? 'Coach' : 
                   userData.role === 'parent' ? 'Elternteil' : 'Mitglied'}
                </div>
              </div>
              <div>
                <label className="label">Mitglied seit</label>
                <div className="input bg-slate-50 dark:bg-slate-800 cursor-not-allowed">
                  {new Date(userData.created_at).toLocaleDateString('de-DE')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benachrichtigungen */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold">Benachrichtigungen</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Verwalte deine Push-Benachrichtigungen für Chat-Nachrichten und Trainings
            </p>
          </div>
          <div className="card-body">
            <SettingsForm />
          </div>
        </div>

        {/* Sicherheit */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold">Sicherheit</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-50">Passwort ändern</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Ändere dein Passwort für mehr Sicherheit
                  </p>
                </div>
                <button className="btn-secondary">
                  Passwort ändern
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-50">Aktive Sitzungen</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Verwalte deine aktiven Anmeldungen
                  </p>
                </div>
                <button className="btn-secondary">
                  Sitzungen verwalten
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Darstellung */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h2 className="text-xl font-semibold">Darstellung</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-50">Dunkler Modus</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Wechsle zwischen hellem und dunklem Design
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}