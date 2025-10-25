import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { getSafeDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const sql = getSafeDb();

    // Zähle ungelesene Nachrichten für diesen User
    const result = await sql`
      SELECT COUNT(*) as unread_count
      FROM messages
      WHERE recipient_id = ${userId}
        AND is_read = false
    `;

    const unreadCount = Number(result[0]?.unread_count || 0);

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
