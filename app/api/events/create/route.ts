import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "coach"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Nur Admins und Coaches können Events erstellen" },
        { status: 403 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    const data = await request.json();

    // Validierung
    if (!data.title || !data.event_date || !data.location || !data.event_type) {
      return NextResponse.json(
        { error: "Titel, Datum, Ort und Event-Typ sind erforderlich" },
        { status: 400 }
      );
    }

    // Erstelle Event
    const result = await sql`
      INSERT INTO events (
        title,
        description,
        event_date,
        start_time,
        end_time,
        location,
        event_type,
        notes,
        max_participants,
        is_mandatory
      )
      VALUES (
        ${data.title},
        ${data.description || null},
        ${data.event_date},
        ${data.start_time || null},
        ${data.end_time || null},
        ${data.location},
        ${data.event_type},
        ${data.notes || null},
        ${data.max_participants || null},
        ${data.is_mandatory || false}
      )
      RETURNING *
    `;

    if (!result || result.length === 0) {
      throw new Error("Failed to create event");
    }

    const event = result[0];
    const eventId = event.id;

    // Wenn Teams ausgewählt wurden, erstelle Teilnehmer-Einträge
    if (data.selected_teams && Array.isArray(data.selected_teams) && data.selected_teams.length > 0) {
      try {
        // Hole alle Mitglieder der ausgewählten Teams
        const members = await sql`
          SELECT DISTINCT id
          FROM members
          WHERE team_id = ANY(${data.selected_teams})
        `;

        // Erstelle Teilnehmer-Einträge
        for (const member of members) {
          await sql`
            INSERT INTO event_participants (event_id, member_id, status)
            VALUES (${eventId}, ${member.id}, 'pending')
            ON CONFLICT (event_id, member_id) DO NOTHING
          `;
        }
      } catch (participantError) {
        console.warn("Error adding participants:", participantError);
        // Continue even if participant creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Event erfolgreich erstellt",
      event: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Events" },
      { status: 500 }
    );
  }
}
