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

    const { participantId, status } = await request.json();
    const eventId = parseInt(params.id);

    if (!participantId || !status) {
      return NextResponse.json(
        { error: "ParticipantId und Status sind erforderlich" },
        { status: 400 }
      );
    }

    if (!['pending', 'accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: "Ungültiger Status" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Hole Teilnehmer-Info
    const participants = await sql`
      SELECT ep.*, m.user_id
      FROM event_participants ep
      LEFT JOIN members m ON ep.member_id = m.id
      WHERE ep.id = ${participantId} AND ep.event_id = ${eventId}
    `;

    if (participants.length === 0) {
      return NextResponse.json(
        { error: "Teilnehmer nicht gefunden" },
        { status: 404 }
      );
    }

    const participant = participants[0];

    // Prüfe Berechtigung
    const userRole = session.user.role;
    const userId = session.user.id;
    
    const canEdit = 
      userRole === 'admin' || 
      userRole === 'coach' || 
      (userRole === 'member' && participant.user_id && participant.user_id.toString() === userId);

    if (!canEdit) {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    // Update Status
    await sql`
      UPDATE event_participants
      SET status = ${status}
      WHERE id = ${participantId}
    `;

    return NextResponse.json({
      success: true,
      message: "Status erfolgreich aktualisiert"
    });

  } catch (error: any) {
    console.error("❌ Error updating participant status:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Aktualisieren des Status" },
      { status: 500 }
    );
  }
}
