import { requireRole } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";
import RegelwerkeAdmin from "./RegelwerkeAdmin";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

export default async function RegelwerkePage() {
  await requireRole(["admin"]);

  // Lade alle Kategorien
  const kategorien = await sql`
    SELECT * FROM regelwerk_kategorien
    ORDER BY reihenfolge ASC, name ASC
  `;

  // Lade alle Regelwerke mit Kategorie-Info
  const regelwerke = await sql`
    SELECT r.*, k.name as kategorie_name, k.icon as kategorie_icon, k.color as kategorie_color,
           u1.name as erstellt_von_name, t.name as team_name
    FROM regelwerke r
    LEFT JOIN regelwerk_kategorien k ON r.kategorie_id = k.id
    LEFT JOIN users u1 ON r.erstellt_von = u1.id
    LEFT JOIN teams t ON r.team_id = t.id
    WHERE r.ist_aktiv = true
    ORDER BY r.created_at DESC
  `;

  // Lade alle Coaches
  const coaches = await sql`
    SELECT DISTINCT u.id, u.name, u.email
    FROM users u
    WHERE u.roles @> '["coach"]'::jsonb OR u.role = 'coach'
    ORDER BY u.name ASC
  `;

  // Lade alle Teams
  const teams = await sql`
    SELECT id, name, level
    FROM teams
    ORDER BY name ASC
  `;

  return <RegelwerkeAdmin 
    initialKategorien={kategorien as any} 
    initialRegelwerke={regelwerke as any}
    coaches={coaches as any}
    teams={teams as any}
  />;
}
