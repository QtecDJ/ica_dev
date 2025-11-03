import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// DELETE - Gesamte Konversation löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = parseInt(session.user.id);
    const partnerId = parseInt(params.userId);

    // Markiere alle Nachrichten der Konversation als gelöscht für den aktuellen User
    await sql`
      UPDATE messages 
      SET 
        deleted_by_sender = CASE WHEN sender_id = ${currentUserId} THEN true ELSE deleted_by_sender END,
        deleted_by_recipient = CASE WHEN recipient_id = ${currentUserId} THEN true ELSE deleted_by_recipient END,
        sender_deleted_at = CASE WHEN sender_id = ${currentUserId} THEN NOW() ELSE sender_deleted_at END,
        recipient_deleted_at = CASE WHEN recipient_id = ${currentUserId} THEN NOW() ELSE recipient_deleted_at END
      WHERE 
        (sender_id = ${currentUserId} AND recipient_id = ${partnerId})
        OR
        (sender_id = ${partnerId} AND recipient_id = ${currentUserId})
    `;

    return NextResponse.json({ success: true, message: "Konversation gelöscht" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen der Konversation" },
      { status: 500 }
    );
  }
}

// PATCH - Gesamte Konversation als erledigt markieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = parseInt(session.user.id);
    const partnerId = parseInt(params.userId);
    const { action } = await request.json();

    if (action === "mark_completed") {
      // Markiere alle Nachrichten der Konversation als erledigt
      await sql`
        UPDATE messages 
        SET 
          is_completed = true, 
          completed_at = NOW(), 
          completed_by = ${currentUserId}
        WHERE 
          (sender_id = ${currentUserId} AND recipient_id = ${partnerId})
          OR
          (sender_id = ${partnerId} AND recipient_id = ${currentUserId})
      `;

      return NextResponse.json({ success: true, message: "Konversation als erledigt markiert" });
    }

    return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Konversation" },
      { status: 500 }
    );
  }
}