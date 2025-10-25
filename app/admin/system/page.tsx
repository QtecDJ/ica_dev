import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Database, Server, Settings, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "System Administration - ICA Backoffice",
  description: "System-Einstellungen und Wartung",
};

export default async function AdminSystemPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            System Administration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            System-Einstellungen und Wartungsfunktionen
          </p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold">System Status</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Datenbank</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>API Services</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Aktiv</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Backup System</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">OK</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold">Server Info</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>CPU Auslastung</span>
                <span>23%</span>
              </div>
              <div className="flex justify-between">
                <span>RAM Nutzung</span>
                <span>4.2 GB / 8 GB</span>
              </div>
              <div className="flex justify-between">
                <span>Festplatte</span>
                <span>156 GB / 500 GB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-lg font-semibold">Wartung</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <button className="btn-secondary w-full text-left">
                Datenbank optimieren
              </button>
              <button className="btn-secondary w-full text-left">
                Cache leeren
              </button>
              <button className="btn-secondary w-full text-left">
                Backup erstellen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-slate-600" />
            <h2 className="text-lg font-semibold">System-Einstellungen</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Allgemeine Einstellungen</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Wartungsmodus</label>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Debug-Modus</label>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Automatische Backups</label>
                  <input type="checkbox" className="rounded" checked readOnly />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Sicherheitseinstellungen</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">2FA für Admins</label>
                  <input type="checkbox" className="rounded" checked readOnly />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Session Timeout (Min)</label>
                  <input type="number" className="w-16 px-2 py-1 border rounded" defaultValue="30" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Login-Versuche</label>
                  <input type="number" className="w-16 px-2 py-1 border rounded" defaultValue="5" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <button className="btn-primary">
              Einstellungen speichern
            </button>
            <button className="btn-secondary">
              Zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}