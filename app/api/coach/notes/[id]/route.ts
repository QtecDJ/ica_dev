import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasAnyRole } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// PUT - Update Notiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const noteId = parseInt(params.id);
    const body = await request.json();
    const { title, content, category, color, tags } = body;

    await sql`
      UPDATE coach_notes
      SET title = ${title},
          content = ${content},
          category = ${category || null},
          color = ${color || 'gray'},
          tags = ${tags || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${noteId}
        AND coach_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle Pin oder andere einzelne Felder
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const noteId = parseInt(params.id);
    const body = await request.json();

    // Dynamisches Update basierend auf übergebenen Feldern
    if (body.hasOwnProperty('is_pinned')) {
      await sql`
        UPDATE coach_notes
        SET is_pinned = ${body.is_pinned},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${noteId}
          AND coach_id = ${userId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error patching note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE - Lösche Notiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const noteId = parseInt(params.id);

    await sql`
      DELETE FROM coach_notes
      WHERE id = ${noteId}
        AND coach_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
