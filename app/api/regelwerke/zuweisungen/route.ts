import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireRole } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

// GET - Zuweisungen für ein Regelwerk abrufen
export async function GET(request: Request) {
  try {
    await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const regelwerkId = searchParams.get("regelwerk_id");

    if (!regelwerkId) {
      return NextResponse.json(
        { error: "Regelwerk-ID ist erforderlich" },
        { status: 400 }
      );
    }

    const zuweisungen = await sql`
      SELECT crz.*, u.name as coach_name, u.email as coach_email, t.name as team_name
      FROM coach_regelwerk_zuweisungen crz
      JOIN users u ON crz.coach_id = u.id
      LEFT JOIN teams t ON crz.team_id = t.id
      WHERE crz.regelwerk_id = ${regelwerkId}
      ORDER BY u.name ASC
    `;

    return NextResponse.json(zuweisungen);
  } catch (error: any) {
    console.error("Fehler beim Abrufen der Zuweisungen:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Abrufen der Zuweisungen" },
      { status: 500 }
    );
  }
}

// POST - Regelwerk einem Coach zuweisen (nur Admin)
export async function POST(request: Request) {
  try {
    const session = await requireRole(["admin"]);

    const body = await request.json();
    const { coach_id, regelwerk_id, team_id } = body;

    if (!coach_id || !regelwerk_id) {
      return NextResponse.json(
        { error: "Coach-ID und Regelwerk-ID sind erforderlich" },
        { status: 400 }
      );
    }

    // Prüfe ob Coach existiert und Role coach hat
    const coach = await sql`
      SELECT id, roles FROM users WHERE id = ${coach_id}
    `;

    if (coach.length === 0) {
      return NextResponse.json(
        { error: "Coach nicht gefunden" },
        { status: 404 }
      );
    }

    const roles = coach[0].roles || [coach[0].role];
    if (!roles.includes('coach') && !roles.includes('admin')) {
      return NextResponse.json(
        { error: "Benutzer ist kein Coach" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO coach_regelwerk_zuweisungen (coach_id, regelwerk_id, team_id, zugewiesen_von)
      VALUES (${coach_id}, ${regelwerk_id}, ${team_id}, ${session.user.id})
      ON CONFLICT (coach_id, regelwerk_id, team_id) DO NOTHING
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Zuweisung existiert bereits" },
        { status: 409 }
      );
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error("Fehler beim Zuweisen des Regelwerks:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Zuweisen des Regelwerks" },
      { status: 500 }
    );
  }
}

// DELETE - Zuweisung entfernen (nur Admin)
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
      DELETE FROM coach_regelwerk_zuweisungen
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Fehler beim Entfernen der Zuweisung:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Entfernen der Zuweisung" },
      { status: 500 }
    );
  }
}
