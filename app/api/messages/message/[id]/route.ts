import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

// DELETE - Nachricht löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    // Prüfe ob User berechtigt ist (Sender oder Empfänger)
    const message = await sql`
      SELECT sender_id, recipient_id 
      FROM messages 
      WHERE id = ${messageId}
    `;

    if (message.length === 0) {
      return NextResponse.json({ error: "Nachricht nicht gefunden" }, { status: 404 });
    }

    const isSender = message[0].sender_id === userId;
    const isRecipient = message[0].recipient_id === userId;

    if (!isSender && !isRecipient) {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
    }

    // Soft Delete - markiere als gelöscht für den User
    if (isSender) {
      await sql`
        UPDATE messages 
        SET deleted_by_sender = true 
        WHERE id = ${messageId}
      `;
    }

    if (isRecipient) {
      await sql`
        UPDATE messages 
        SET deleted_by_recipient = true 
        WHERE id = ${messageId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen der Nachricht" },
      { status: 500 }
    );
  }
}

// PATCH - Nachricht als erledigt markieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = parseInt(params.id);
    const userId = parseInt(session.user.id);
    const { action } = await request.json();

    if (action === "mark_completed") {
      // Prüfe Berechtigung
      const message = await sql`
        SELECT sender_id, recipient_id 
        FROM messages 
        WHERE id = ${messageId}
      `;

      if (message.length === 0) {
        return NextResponse.json({ error: "Nachricht nicht gefunden" }, { status: 404 });
      }

      const isSender = message[0].sender_id === userId;
      const isRecipient = message[0].recipient_id === userId;

      if (!isSender && !isRecipient) {
        return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
      }

      // Markiere als erledigt
      await sql`
        UPDATE messages 
        SET completed = true, completed_at = NOW(), completed_by = ${userId}
        WHERE id = ${messageId}
      `;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Nachricht" },
      { status: 500 }
    );
  }
}