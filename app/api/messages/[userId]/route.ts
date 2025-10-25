import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// GET - Hole alle Nachrichten mit einem bestimmten Benutzer
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const currentUserId = parseInt(session.user.id);
    const partnerId = parseInt(params.userId);

    // Hole alle Nachrichten zwischen den beiden Benutzern
    const messages = await sql`
      SELECT 
        m.*,
        sender.name as sender_name,
        sender.role as sender_role,
        recipient.name as recipient_name,
        recipient.role as recipient_role
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users recipient ON m.recipient_id = recipient.id
      WHERE 
        (m.sender_id = ${currentUserId} AND m.recipient_id = ${partnerId})
        OR
        (m.sender_id = ${partnerId} AND m.recipient_id = ${currentUserId})
      ORDER BY m.created_at ASC
    `;

    // Markiere empfangene Nachrichten als gelesen
    await sql`
      UPDATE messages
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE recipient_id = ${currentUserId}
        AND sender_id = ${partnerId}
        AND is_read = false
    `;

    // Hole Partner-Informationen
    const partner = await sql`
      SELECT id, name, role, email
      FROM users
      WHERE id = ${partnerId}
    `;

    return NextResponse.json({ 
      messages,
      partner: partner[0] || null
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Konversation" },
      { status: 500 }
    );
  }
}

// PATCH - Nachricht als gelesen markieren
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const currentUserId = parseInt(session.user.id);
    const partnerId = parseInt(params.userId);

    await sql`
      UPDATE messages
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE recipient_id = ${currentUserId}
        AND sender_id = ${partnerId}
        AND is_read = false
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Fehler beim Markieren der Nachrichten" },
      { status: 500 }
    );
  }
}
