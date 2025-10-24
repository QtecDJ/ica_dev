import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const eventId = parseInt(params.id);
    const body = await request.json();
    
    const {
      title,
      description,
      event_type,
      location,
      event_date,
      start_time,
      end_time,
      max_participants,
      is_mandatory,
      notes,
      selectedTeams
    } = body;

    // Validierung
    if (!title || !event_date || !location || !event_type) {
      return NextResponse.json(
        { error: "Titel, Datum, Ort und Event-Typ sind erforderlich" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Update Event
    await sql`
      UPDATE events
      SET 
        title = ${title},
        description = ${description || null},
        event_type = ${event_type},
        location = ${location},
        event_date = ${event_date},
        start_time = ${start_time || null},
        end_time = ${end_time || null},
        max_participants = ${max_participants || null},
        is_mandatory = ${is_mandatory || false},
        notes = ${notes || null}
      WHERE id = ${eventId}
    `;

    // Update Teilnehmer wenn Teams ausgewählt wurden
    if (selectedTeams && Array.isArray(selectedTeams)) {
      // Hole alle Members der ausgewählten Teams
      const members = await sql`
        SELECT id FROM members 
        WHERE team_id = ANY(${selectedTeams})
      `;

      // Lösche Teilnehmer die nicht mehr in den ausgewählten Teams sind
      await sql`
        DELETE FROM event_participants
        WHERE event_id = ${eventId}
        AND member_id NOT IN (
          SELECT id FROM members WHERE team_id = ANY(${selectedTeams})
        )
      `;

      // Füge neue Teilnehmer hinzu
      for (const member of members) {
        await sql`
          INSERT INTO event_participants (event_id, member_id, status)
          VALUES (${eventId}, ${member.id}, 'pending')
          ON CONFLICT (event_id, member_id) DO NOTHING
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Event erfolgreich aktualisiert"
    });

  } catch (error: any) {
    console.error("❌ Error updating event:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Aktualisieren des Events" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const eventId = parseInt(params.id);
    const sql = neon(process.env.DATABASE_URL!);

    // Lösche Teilnehmer (CASCADE sollte das auch machen, aber sicherheitshalber)
    await sql`
      DELETE FROM event_participants WHERE event_id = ${eventId}
    `;

    // Lösche Event
    await sql`
      DELETE FROM events WHERE id = ${eventId}
    `;

    return NextResponse.json({
      success: true,
      message: "Event erfolgreich gelöscht"
    });

  } catch (error: any) {
    console.error("❌ Error deleting event:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Löschen des Events" },
      { status: 500 }
    );
  }
}
