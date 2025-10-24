import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    if (!["admin", "coach"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const { title, description, event_type, location, event_date, start_time, end_time } = await request.json();

    // Validierung
    if (!title || !event_date || !event_type) {
      return NextResponse.json(
        { error: "Titel, Datum und Typ sind erforderlich" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Erstelle Calendar Event
    const result = await sql`
      INSERT INTO calendar_events (
        title,
        description,
        event_type,
        location,
        event_date,
        start_time,
        end_time,
        created_by
      ) VALUES (
        ${title},
        ${description || null},
        ${event_type},
        ${location || null},
        ${event_date},
        ${start_time || null},
        ${end_time || null},
        ${parseInt(session.user.id)}
      )
      RETURNING id, title
    `;

    return NextResponse.json({
      success: true,
      calendarEvent: result[0]
    });

  } catch (error: any) {
    console.error("❌ Error creating calendar event:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Erstellen des Termins" },
      { status: 500 }
    );
  }
}
