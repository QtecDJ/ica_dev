import { requireAuth } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";
import RegelwerkeView from "./RegelwerkeView";
import { hasAnyRole } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

export default async function RegelwerkePage() {
  const session = await requireAuth();
  const isCoach = hasAnyRole(session, ["coach"]);
  const isAdmin = hasAnyRole(session, ["admin"]);
  const isManager = hasAnyRole(session, ["manager"]);

  if (!isCoach && !isAdmin && !isManager) {
    throw new Error("Unauthorized - Nur Coaches, Manager und Admins haben Zugriff auf Regelwerke");
  }

  // Lade alle Kategorien
  const kategorien = await sql`
    SELECT * FROM regelwerk_kategorien
    ORDER BY reihenfolge ASC, name ASC
  `;

  // Lade Regelwerke basierend auf Rolle
  let regelwerke;
  
  if (isAdmin || isManager) {
    // Admin und Manager sehen alle Regelwerke
    regelwerke = await sql`
      SELECT r.*, k.name as kategorie_name, k.icon as kategorie_icon, k.color as kategorie_color,
             u1.name as erstellt_von_name, t.name as team_name,
             false as gelesen, null as gelesen_am
      FROM regelwerke r
      LEFT JOIN regelwerk_kategorien k ON r.kategorie_id = k.id
      LEFT JOIN users u1 ON r.erstellt_von = u1.id
      LEFT JOIN teams t ON r.team_id = t.id
      WHERE r.ist_aktiv = true
      ORDER BY r.created_at DESC
    `;
  } else {
    // Coach sieht nur zugewiesene Regelwerke
    regelwerke = await sql`
      SELECT DISTINCT r.*, k.name as kategorie_name, k.icon as kategorie_icon, k.color as kategorie_color,
             crz.gelesen, crz.gelesen_am, t.name as team_name
      FROM regelwerke r
      INNER JOIN coach_regelwerk_zuweisungen crz ON r.id = crz.regelwerk_id
      LEFT JOIN regelwerk_kategorien k ON r.kategorie_id = k.id
      LEFT JOIN teams t ON crz.team_id = t.id
      WHERE r.ist_aktiv = true AND crz.coach_id = ${session.user.id}
      ORDER BY crz.gelesen ASC, r.created_at DESC
    `;
  }

  return <RegelwerkeView 
    kategorien={kategorien as any}
    regelwerke={regelwerke as any}
    isAdmin={isAdmin || isManager}
  />;
}
