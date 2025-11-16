import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// GET /api/emails/unread-count - Hole Anzahl ungelesener Emails
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const result = await sql`
      SELECT COUNT(*) as unread_count
      FROM emails
      WHERE recipient_id = ${userId}
        AND is_read = false
        AND is_deleted_by_recipient = false
    `;

    return NextResponse.json({ unread_count: parseInt(result[0].unread_count) });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
