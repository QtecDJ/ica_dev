import { requireRole } from "@/lib/auth-utils";
import Link from "next/link";
import { 
  Users, 
  UserCog, 
  MessageSquare, 
  Settings,
  ChevronRight,
  Shield,
  Link2
} from "lucide-react";

export default async function AdministrationPage() {
  // Nur Admins dürfen diese Seite sehen
  await requireRole(["admin"]);

  const adminSections = [
    {
      title: "Benutzerverwaltung",
      description: "Benutzer erstellen, bearbeiten und Rollen zuweisen",
      icon: Users,
      href: "/administration/users",
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      stats: "Benutzer, Rollen & Teams"
    },
    {
      title: "Eltern-Kind-Beziehungen",
      description: "Verknüpfungen zwischen Eltern und Kindern verwalten",
      icon: Link2,
      href: "/administration/parent-children",
      color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      stats: "Familienverbindungen"
    },
    {
      title: "Dashboard Inhalte",
      description: "Willkommensnachrichten und Livestreams verwalten",
      icon: MessageSquare,
      href: "/administration/dashboard-content",
      color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      stats: "Content Management"
    },
    {
      title: "Berichte & Analytics",
      description: "Statistiken und Auswertungen einsehen",
      icon: UserCog,
      href: "/administration/reports",
      color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
      stats: "Datenanalyse"
    },
    {
      title: "System-Einstellungen",
      description: "Datenbank und System-Informationen",
      icon: Settings,
      href: "/administration/system",
      color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
      stats: "System & Wartung"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Administration
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Zentrale Verwaltung aller System-Funktionen
          </p>
        </div>
      </div>

      {/* Admin Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="card card-hover group"
          >
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                {section.title}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {section.description}
              </p>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {section.stats}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Info */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="card-body">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Administrator-Bereich
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Dieser Bereich ist nur für Administratoren zugänglich. Alle Änderungen hier wirken sich direkt auf das System aus.
                Bitte handle mit Vorsicht bei sensiblen Daten und System-Einstellungen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
