import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Alle Dashboard-Inhalte abrufen
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json(contents);
  } catch (error) {
    console.error("Error fetching dashboard content:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Neuen Dashboard-Inhalt erstellen
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const result = await sql`
      INSERT INTO dashboard_content (
        content_type,
        title,
        content,
        is_active,
        target_role,
        priority,
        livestream_url,
        livestream_platform,
        event_date,
        expires_at,
        background_color,
        icon,
        created_by,
        updated_by
      ) VALUES (
        ${data.content_type},
        ${data.title},
        ${data.content},
        ${data.is_active},
        ${data.target_role},
        ${data.priority},
        ${data.livestream_url},
        ${data.livestream_platform},
        ${data.event_date},
        ${data.expires_at},
        ${data.background_color},
        ${data.icon},
        ${data.user_id},
        ${data.user_id}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating dashboard content:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
