import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasAnyRole } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// GET - Hole alle Songs des Coaches
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const songs = await sql`
      SELECT id, title, artist, gdrive_link, gdrive_file_id,
             duration, playlist_order, tags, notes, play_count,
             last_played_at, created_at
      FROM coach_music
      WHERE coach_id = ${userId}
      ORDER BY playlist_order ASC, created_at DESC
    `;

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Error fetching music:", error);
    return NextResponse.json(
      { error: "Failed to fetch music" },
      { status: 500 }
    );
  }
}

// POST - Füge neuen Song hinzu
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { title, artist, gdrive_link, tags, notes, team_id } = body;

    if (!title || !gdrive_link) {
      return NextResponse.json(
        { error: "Title and Google Drive link required" },
        { status: 400 }
      );
    }

    // Extrahiere File ID aus Google Drive Link
    const extractFileId = (link: string): string | null => {
      const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/,
        /\/open\?id=([a-zA-Z0-9_-]+)/,
      ];

      for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    const fileId = extractFileId(gdrive_link);

    const [newSong] = await sql`
      INSERT INTO coach_music (
        coach_id, team_id, title, artist, gdrive_link,
        gdrive_file_id, tags, notes
      )
      VALUES (
        ${userId},
        ${team_id || null},
        ${title},
        ${artist || null},
        ${gdrive_link},
        ${fileId},
        ${tags || null},
        ${notes || null}
      )
      RETURNING id, title, created_at
    `;

    return NextResponse.json({ 
      success: true,
      song: newSong
    });
  } catch (error) {
    console.error("Error adding music:", error);
    return NextResponse.json(
      { error: "Failed to add music" },
      { status: 500 }
    );
  }
}
