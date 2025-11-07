import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import DashboardContentManager from "./DashboardContentManager";

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

export default async function DashboardContentPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
    redirect("/");
  }

  // Hole alle Dashboard-Inhalte
  const contents = await sql`
    SELECT 
      dc.*,
      cu.name as created_by_name,
      uu.name as updated_by_name
    FROM dashboard_content dc
    LEFT JOIN users cu ON dc.created_by = cu.id
    LEFT JOIN users uu ON dc.updated_by = uu.id
    ORDER BY dc.priority DESC, dc.created_at DESC
  `;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Dashboard-Inhalte verwalten
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Bearbeite Willkommensnachrichten, Livestreams und Ankündigungen für das Dashboard
          </p>
        </div>
      </div>

      {/* Info-Box */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="card-body">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            ℹ️ Funktionsweise
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>Content-Typen:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Willkommen - Begrüßungsnachricht</li>
                <li>• Ankündigung - Wichtige Infos</li>
                <li>• Livestream - Video-Einbettung</li>
                <li>• Alert - Dringende Meldungen</li>
              </ul>
            </div>
            <div>
              <strong>Zielgruppen:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Eltern - Nur für Parents</li>
                <li>• Mitglieder - Nur für Members</li>
                <li>• Coaches - Nur für Coaches</li>
                <li>• Alle - Für jeden sichtbar</li>
              </ul>
            </div>
            <div>
              <strong>Livestreams:</strong>
              <ul className="mt-1 space-y-1">
                <li>• YouTube Embed-URLs unterstützt</li>
                <li>• Twitch Embed-URLs unterstützt</li>
                <li>• Automatische Aktivierung möglich</li>
                <li>• Zeitgesteuerte Anzeige</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Content Manager Component */}
      <DashboardContentManager 
        contents={JSON.parse(JSON.stringify(contents))} 
        userId={session.user.id}
      />
    </div>
  );
}
