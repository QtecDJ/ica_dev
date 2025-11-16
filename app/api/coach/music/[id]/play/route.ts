import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasAnyRole } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// POST - Track Song Play
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const songId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    // Update play count and last played timestamp
    await sql`
      UPDATE coach_music
      SET play_count = play_count + 1,
          last_played_at = CURRENT_TIMESTAMP
      WHERE id = ${songId}
        AND coach_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking play:", error);
    return NextResponse.json(
      { error: "Failed to track play" },
      { status: 500 }
    );
  }
}
