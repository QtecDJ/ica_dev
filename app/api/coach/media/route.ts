import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasAnyRole } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// GET - Hole alle Fotos des Coaches
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const media = await sql`
      SELECT id, file_name, file_path, file_type, file_size, 
             ocr_text, ocr_language, ocr_confidence, notes, 
             created_at, updated_at
      FROM coach_media
      WHERE coach_id = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST - Speichere neues Foto mit OCR
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasAnyRole(session, ["coach", "admin", "manager"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { image_data, ocr_text, notes, team_id } = body;

    if (!image_data) {
      return NextResponse.json(
        { error: "Image data required" },
        { status: 400 }
      );
    }

    // Extrahiere File-Type und Größe
    const matches = image_data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    const fileType = matches[1];
    const base64Data = matches[2];
    const fileSize = Math.ceil((base64Data.length * 3) / 4); // Approximation

    // Speichere in Datenbank (Base64 direkt für einfache Implementierung)
    const [newMedia] = await sql`
      INSERT INTO coach_media (
        coach_id, team_id, file_name, file_path, file_type, 
        file_size, ocr_text, notes
      )
      VALUES (
        ${userId},
        ${team_id || null},
        ${`photo_${Date.now()}.jpg`},
        ${image_data},
        ${fileType},
        ${fileSize},
        ${ocr_text || null},
        ${notes || null}
      )
      RETURNING id, file_name, created_at
    `;

    return NextResponse.json({ 
      success: true,
      media: newMedia
    });
  } catch (error) {
    console.error("Error saving media:", error);
    return NextResponse.json(
      { error: "Failed to save media" },
      { status: 500 }
    );
  }
}
