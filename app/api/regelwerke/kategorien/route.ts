import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireRole } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

// GET - Alle Kategorien abrufen
export async function GET() {
  try {
    await requireRole(["admin", "coach", "manager"]);

    const kategorien = await sql`
      SELECT * FROM regelwerk_kategorien
      ORDER BY reihenfolge ASC, name ASC
    `;

    return NextResponse.json(kategorien);
  } catch (error: any) {
    console.error("Fehler beim Abrufen der Kategorien:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Abrufen der Kategorien" },
      { status: 500 }
    );
  }
}

// POST - Neue Kategorie erstellen (nur Admin)
export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);

    const body = await request.json();
    const { name, beschreibung, icon, color, reihenfolge } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name ist erforderlich" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO regelwerk_kategorien (name, beschreibung, icon, color, reihenfolge)
      VALUES (${name}, ${beschreibung}, ${icon || 'book-open'}, ${color || '#8b5cf6'}, ${reihenfolge || 0})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error("Fehler beim Erstellen der Kategorie:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Erstellen der Kategorie" },
      { status: 500 }
    );
  }
}

// PUT - Kategorie aktualisieren (nur Admin)
export async function PUT(request: Request) {
  try {
    await requireRole(["admin"]);

    const body = await request.json();
    const { id, name, beschreibung, icon, color, reihenfolge } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID und Name sind erforderlich" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE regelwerk_kategorien
      SET name = ${name},
          beschreibung = ${beschreibung},
          icon = ${icon},
          color = ${color},
          reihenfolge = ${reihenfolge}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Kategorie nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Fehler beim Aktualisieren der Kategorie:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Aktualisieren der Kategorie" },
      { status: 500 }
    );
  }
}

// DELETE - Kategorie löschen (nur Admin)
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

    await sql`
      DELETE FROM regelwerk_kategorien
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Fehler beim Löschen der Kategorie:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Löschen der Kategorie" },
      { status: 500 }
    );
  }
}
