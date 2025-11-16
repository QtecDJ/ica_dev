import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasAnyRole } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// GET - Hole alle Notizen des Coaches
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const notes = await sql`
      SELECT id, title, content, category, color, is_pinned,
             tags, created_at, updated_at
      FROM coach_notes
      WHERE coach_id = ${userId}
      ORDER BY is_pinned DESC, updated_at DESC
    `;

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST - Erstelle neue Notiz
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { title, content, category, color, tags, team_id } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content required" },
        { status: 400 }
      );
    }

    const [newNote] = await sql`
      INSERT INTO coach_notes (
        coach_id, team_id, title, content, category, color, tags
      )
      VALUES (
        ${userId},
        ${team_id || null},
        ${title},
        ${content},
        ${category || null},
        ${color || 'gray'},
        ${tags || null}
      )
      RETURNING id, title, created_at
    `;

    return NextResponse.json({ 
      success: true,
      note: newNote
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
