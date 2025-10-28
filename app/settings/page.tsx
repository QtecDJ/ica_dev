import { requireAuth } from "@/lib/auth-utils";
import Link from "next/link";
import { ArrowLeft, Settings, User, Bell, Shield, Palette, Mail, Calendar, Crown } from "lucide-react";
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

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: Crown };
      case 'coach':
        return { label: 'Coach', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: User };
      case 'parent':
        return { label: 'Elternteil', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: User };
      default:
        return { label: 'Mitglied', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: User };
    }
  };

  const roleInfo = getRoleInfo(userData.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-all duration-200 hover:gap-3"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Zurück</span>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                Einstellungen
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar - Profil Card */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden lg:sticky lg:top-24">
              {/* Profile Header */}
              <div className="relative h-20 sm:h-24 lg:h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              </div>
              
              {/* Profile Content */}
              <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 lg:pb-8">
                <div className="flex flex-col items-center -mt-8 sm:-mt-10 lg:-mt-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 dark:text-slate-300 shadow-2xl border-4 border-white dark:border-slate-800">
                    {userData.name?.charAt(0)?.toUpperCase()}
                  </div>
                  
                  <div className="text-center mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
                      {userData.name}
                    </h2>
                    
                    <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${roleInfo.bg} ${roleInfo.color}`}>
                      <RoleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      {roleInfo.label}
                    </div>
                    
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 sm:mt-3">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate max-w-[200px]">{userData.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      Seit {new Date(userData.created_at).toLocaleDateString('de-DE', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2">
            {/* Benachrichtigungen */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-50">
                      Push-Benachrichtigungen
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1">
                      Bleibe über Chat-Nachrichten und Trainings informiert
                    </p>
                  </div>
                </div>
                
                <SettingsForm />
              </div>
            </div>

            {/* Sicherheit */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-50">
                      Sicherheit & Datenschutz
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1">
                      Verwalte deine Kontosicherheit
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-3 sm:gap-4">
                  <div className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base">Passwort ändern</h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                            Aktualisiere dein Passwort für mehr Sicherheit
                          </p>
                        </div>
                      </div>
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-xs sm:text-sm flex-shrink-0 ml-3">
                        Ändern
                      </button>
                    </div>
                  </div>
                  
                  <div className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base">Aktive Sitzungen</h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                            Verwalte deine aktiven Anmeldungen
                          </p>
                        </div>
                      </div>
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-xs sm:text-sm flex-shrink-0 ml-3">
                        Verwalten
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Darstellung */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg">
                    <Palette className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-50">
                      Darstellung
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1">
                      Personalisiere dein Interface
                    </p>
                  </div>
                </div>
                
                <div className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base">Dunkler Modus</h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          Wechsle zwischen hellem und dunklem Design
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 sm:w-14 sm:h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-5 sm:peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}