import { Metadata } from "next"
import { requireAuth } from "@/lib/auth-utils"
import ParentChildManager from "@/app/components/ParentChildManager"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Info } from "lucide-react"

export const metadata: Metadata = {
  title: "Parent-Child Verwaltung | ICA Admin",
  description: "Erweiterte Verwaltung der Verknüpfungen zwischen Eltern und Kindern",
}

export default async function ParentChildManagementPage() {
  const session = await requireAuth();
  
  // Allow admins and managers
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h1>
          <p className="text-slate-600">Diese Seite ist nur für Administratoren und Manager verfügbar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link 
          href="/administration" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Admin-Übersicht
        </Link>
      </div>

      {/* System Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Erweiterte Parent-Child Verwaltung
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                Diese überarbeitete Verwaltung unterstützt zwei Datenbank-Systeme:
              </p>
              <ul className="list-disc ml-4 space-y-1">
                <li><strong>Optimiert (parent_children Tabelle):</strong> Direkte Verknüpfungen mit erweiterten Features</li>
                <li><strong>Legacy (member.parent_email):</strong> Backward-kompatibel mit bestehenden Daten</li>
              </ul>
              <p className="mt-3">
                <strong>Neue Features:</strong> Bulk-Synchronisation, Such-Filter, Status-Dashboard, 
                automatische Parent-User-Erstellung
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Häufige Probleme & Lösungen
            </h3>
            <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
              <div>
                <strong>Problem:</strong> "Kinder ohne Parent User" angezeigt
                <br />
                <strong>Lösung:</strong> Klicke auf "Parent User erstellen" oder verwende "Alle Parent Users erstellen"
              </div>
              <div>
                <strong>Problem:</strong> Verknüpfungen werden nicht angezeigt
                <br />
                <strong>Lösung:</strong> Verwende "Sync Beziehungen" um email-basierte Verknüpfungen zu aktualisieren
              </div>
              <div>
                <strong>Problem:</strong> Doppelte Einträge
                <br />
                <strong>Lösung:</strong> Das System erkennt automatisch doppelte Verknüpfungen und ignoriert diese
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ParentChildManager />
    </div>
  );
}