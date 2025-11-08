import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// GET - Dashboard-Inhalte für aktuellen User abrufen
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;

    // Hole aktive Inhalte für die Rolle des Users
    // Zeige nur nicht-abgelaufene Inhalte
    const contents = await sql`
      SELECT 
        id,
        content_type,
        title,
        content,
        target_role,
        priority,
        livestream_url,
        livestream_platform,
        event_date,
        background_color,
        icon
      FROM dashboard_content
      WHERE is_active = true
        AND (target_role = ${userRole} OR target_role IS NULL)
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY priority DESC, created_at DESC
    `;

    return NextResponse.json(contents);
  } catch (error) {
    console.error("Error fetching dashboard content for user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
