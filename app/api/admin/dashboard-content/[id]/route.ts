import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// PUT - Dashboard-Inhalt aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const id = params.id;

    const result = await sql`
      UPDATE dashboard_content
      SET
        content_type = ${data.content_type},
        title = ${data.title},
        content = ${data.content},
        is_active = ${data.is_active},
        target_role = ${data.target_role},
        priority = ${data.priority},
        livestream_url = ${data.livestream_url},
        livestream_platform = ${data.livestream_platform},
        event_date = ${data.event_date},
        expires_at = ${data.expires_at},
        background_color = ${data.background_color},
        icon = ${data.icon},
        updated_by = ${data.user_id},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating dashboard content:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Dashboard-Inhalt löschen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    const result = await sql`
      DELETE FROM dashboard_content
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dashboard content:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
