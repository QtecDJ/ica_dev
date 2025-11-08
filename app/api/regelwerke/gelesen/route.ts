import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

// POST - Regelwerk als gelesen markieren
export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { regelwerk_id } = body;

    if (!regelwerk_id) {
      return NextResponse.json(
        { error: "Regelwerk-ID ist erforderlich" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE coach_regelwerk_zuweisungen
      SET gelesen = true,
          gelesen_am = CURRENT_TIMESTAMP
      WHERE coach_id = ${session.user.id} AND regelwerk_id = ${regelwerk_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Zuweisung nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Fehler beim Markieren als gelesen:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Markieren als gelesen" },
      { status: 500 }
    );
  }
}
