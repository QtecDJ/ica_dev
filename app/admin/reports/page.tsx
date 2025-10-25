import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { BarChart3, Users, Calendar, TrendingUp, Activity, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Berichte - ICA Backoffice",
  description: "Administrative Berichte und Statistiken",
};

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Admin Berichte
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Statistiken und Berichte für Administratoren
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mitglieder Bericht */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold">Mitglieder Report</h2>
            </div>
          </div>
          <div className="card-body">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Detaillierte Mitgliederstatistiken und Aktivitäten
            </p>
            <button className="btn-primary w-full">
              Bericht erstellen
            </button>
          </div>
        </div>

        {/* Events Bericht */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold">Events Report</h2>
            </div>
          </div>
          <div className="card-body">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Übersicht über Events und Teilnehmerzahlen
            </p>
            <button className="btn-primary w-full">
              Bericht erstellen
            </button>
          </div>
        </div>

        {/* Aktivitäts Bericht */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold">Aktivitäts Report</h2>
            </div>
          </div>
          <div className="card-body">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Benutzeraktivitäten und System-Nutzung
            </p>
            <button className="btn-primary w-full">
              Bericht erstellen
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold">Schnellstatistiken</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">124</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Aktive Mitglieder</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">18</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Events diesen Monat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">89%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Anwesenheitsrate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Teams</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}