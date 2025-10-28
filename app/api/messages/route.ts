import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// GET - Hole alle Nachrichten für den aktuellen Benutzer
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Hole alle Konversationen (gruppiert nach Gesprächspartner)
    const conversations = await sql`
      WITH message_threads AS (
        SELECT 
          m.*,
          sender.name as sender_name,
          sender.role as sender_role,
          recipient.name as recipient_name,
          recipient.role as recipient_role,
          CASE 
            WHEN m.sender_id = ${userId} THEN m.recipient_id
            ELSE m.sender_id
          END as partner_id,
          CASE 
            WHEN m.sender_id = ${userId} THEN recipient.name
            ELSE sender.name
          END as partner_name,
          CASE 
            WHEN m.sender_id = ${userId} THEN recipient.role
            ELSE sender.role
          END as partner_role
        FROM messages m
        JOIN users sender ON m.sender_id = sender.id
        JOIN users recipient ON m.recipient_id = recipient.id
        WHERE m.sender_id = ${userId} OR m.recipient_id = ${userId}
      )
      SELECT 
        partner_id,
        partner_name,
        partner_role,
        COUNT(*) as message_count,
        COUNT(CASE WHEN NOT is_read AND recipient_id = ${userId} THEN 1 END) as unread_count,
        MAX(created_at) as last_message_date
      FROM message_threads
      GROUP BY partner_id, partner_name, partner_role
      ORDER BY last_message_date DESC
    `;

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Nachrichten" },
      { status: 500 }
    );
  }
}

// POST - Neue Nachricht senden
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const senderId = parseInt(session.user.id);
    const senderRole = session.user.role;
    
    const body = await request.json();
    const { recipientId, subject, content, parentMessageId } = body;

    // Validierung
    if (!recipientId || !content) {
      return NextResponse.json(
        { error: "Empfänger und Nachricht sind erforderlich" },
        { status: 400 }
      );
    }

    // Prüfe ob Empfänger existiert
    const recipient = await sql`
      SELECT id, role FROM users WHERE id = ${recipientId}
    `;

    if (recipient.length === 0) {
      return NextResponse.json(
        { error: "Empfänger nicht gefunden" },
        { status: 404 }
      );
    }

    const recipientRole = recipient[0].role;

    // Nur Parent ↔ Coach Kommunikation erlaubt
    const isValidCommunication = 
      (senderRole === "parent" && (recipientRole === "coach" || recipientRole === "admin")) ||
      ((senderRole === "coach" || senderRole === "admin") && recipientRole === "parent");

    if (!isValidCommunication) {
      return NextResponse.json(
        { error: "Nachrichten sind nur zwischen Eltern und Coaches erlaubt" },
        { status: 403 }
      );
    }

    // Nachricht speichern
    const result = await sql`
      INSERT INTO messages (sender_id, recipient_id, subject, content, parent_message_id)
      VALUES (
        ${senderId},
        ${recipientId},
        ${subject || null},
        ${content},
        ${parentMessageId || null}
      )
      RETURNING *
    `;

    // Send push notification to recipient
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: [recipientId],
          title: 'Neue Nachricht',
          body: `${session.user.name || 'Jemand'} hat Ihnen eine Nachricht gesendet`,
          url: '/messages',
          tag: 'chat-message'
        }),
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }

    return NextResponse.json({ 
      message: result[0],
      success: true 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Fehler beim Senden der Nachricht" },
      { status: 500 }
    );
  }
}
