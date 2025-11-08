import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireRole, requireAuth } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

// GET - Alle Regelwerke abrufen (oder nur für spezifischen Coach)
export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get("coach_id");
    const kategorieId = searchParams.get("kategorie_id");

    let regelwerke;

    if (session.user.role === "admin" || session.user.role === "manager") {
      // Admin und Manager sehen alle Regelwerke
      if (kategorieId) {
        regelwerke = await sql`
          SELECT r.*, k.name as kategorie_name, k.icon as kategorie_icon, k.color as kategorie_color,
                 u1.name as erstellt_von_name, t.name as team_name
          FROM regelwerke r
          LEFT JOIN regelwerk_kategorien k ON r.kategorie_id = k.id
          LEFT JOIN users u1 ON r.erstellt_von = u1.id
          LEFT JOIN teams t ON r.team_id = t.id
          WHERE r.ist_aktiv = true AND r.kategorie_id = ${kategorieId}
          ORDER BY r.created_at DESC
        `;
      } else {
        regelwerke = await sql`
          SELECT r.*, k.name as kategorie_name, k.icon as kategorie_icon, k.color as kategorie_color,
                 u1.name as erstellt_von_name, t.name as team_name
          FROM regelwerke r
          LEFT JOIN regelwerk_kategorien k ON r.kategorie_id = k.id
          LEFT JOIN users u1 ON r.erstellt_von = u1.id
          LEFT JOIN teams t ON r.team_id = t.id
          WHERE r.ist_aktiv = true
          ORDER BY r.created_at DESC
        `;
      }
    } else if (session.user.role === "coach") {
      // Coach sieht nur zugewiesene Regelwerke
      const userId = coachId || session.user.id;
      
      if (kategorieId) {
        regelwerke = await sql`
          SELECT DISTINCT r.*, k.name as kategorie_name, k.icon as kategorie_icon, k.color as kategorie_color,
                 crz.gelesen, crz.gelesen_am, t.name as team_name
          FROM regelwerke r
          INNER JOIN coach_regelwerk_zuweisungen crz ON r.id = crz.regelwerk_id
          LEFT JOIN regelwerk_kategorien k ON r.kategorie_id = k.id
          LEFT JOIN teams t ON crz.team_id = t.id
          WHERE r.ist_aktiv = true 
            AND crz.coach_id = ${userId}
            AND r.kategorie_id = ${kategorieId}
          ORDER BY r.created_at DESC
        `;
      } else {
        regelwerke = await sql`
          SELECT DISTINCT r.*, k.name as kategorie_name, k.icon as kategorie_icon, k.color as kategorie_color,
                 crz.gelesen, crz.gelesen_am, t.name as team_name
          FROM regelwerke r
          INNER JOIN coach_regelwerk_zuweisungen crz ON r.id = crz.regelwerk_id
          LEFT JOIN regelwerk_kategorien k ON r.kategorie_id = k.id
          LEFT JOIN teams t ON crz.team_id = t.id
          WHERE r.ist_aktiv = true AND crz.coach_id = ${userId}
          ORDER BY r.created_at DESC
        `;
      }
    }

    return NextResponse.json(regelwerke);
  } catch (error: any) {
    console.error("Fehler beim Abrufen der Regelwerke:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Abrufen der Regelwerke" },
      { status: 500 }
    );
  }
}

// POST - Neues Regelwerk erstellen (nur Admin)
export async function POST(request: Request) {
  try {
    const session = await requireRole(["admin"]);

    const body = await request.json();
    const { titel, beschreibung, inhalt, kategorie_id, team_id, version, gueltig_ab, gueltig_bis } = body;

    if (!titel || !inhalt) {
      return NextResponse.json(
        { error: "Titel und Inhalt sind erforderlich" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO regelwerke (titel, beschreibung, inhalt, kategorie_id, team_id, version, gueltig_ab, gueltig_bis, erstellt_von)
      VALUES (${titel}, ${beschreibung}, ${inhalt}, ${kategorie_id}, ${team_id}, ${version || '1.0'}, 
              ${gueltig_ab || new Date().toISOString().split('T')[0]}, ${gueltig_bis}, ${session.user.id})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error("Fehler beim Erstellen des Regelwerks:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Erstellen des Regelwerks" },
      { status: 500 }
    );
  }
}

// PUT - Regelwerk aktualisieren (nur Admin)
export async function PUT(request: Request) {
  try {
    const session = await requireRole(["admin"]);

    const body = await request.json();
    const { id, titel, beschreibung, inhalt, kategorie_id, team_id, version, gueltig_ab, gueltig_bis, ist_aktiv } = body;

    if (!id || !titel || !inhalt) {
      return NextResponse.json(
        { error: "ID, Titel und Inhalt sind erforderlich" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE regelwerke
      SET titel = ${titel},
          beschreibung = ${beschreibung},
          inhalt = ${inhalt},
          kategorie_id = ${kategorie_id},
          team_id = ${team_id},
          version = ${version},
          gueltig_ab = ${gueltig_ab},
          gueltig_bis = ${gueltig_bis},
          ist_aktiv = ${ist_aktiv !== undefined ? ist_aktiv : true},
          aktualisiert_von = ${session.user.id}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Regelwerk nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Fehler beim Aktualisieren des Regelwerks:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Aktualisieren des Regelwerks" },
      { status: 500 }
    );
  }
}

// DELETE - Regelwerk löschen/deaktivieren (nur Admin)
export async function DELETE(request: Request) {
  try {
    await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID ist erforderlich" },
        { status: 400 }
      );
    }

    // Soft delete - setze ist_aktiv auf false
    await sql`
      UPDATE regelwerke
      SET ist_aktiv = false
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Fehler beim Löschen des Regelwerks:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Löschen des Regelwerks" },
      { status: 500 }
    );
  }
}
