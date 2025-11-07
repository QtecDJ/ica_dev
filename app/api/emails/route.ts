import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET /api/emails - Hole Emails (Inbox oder Sent)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "inbox"; // inbox, sent, starred, trash

    let emails;

    switch (folder) {
      case "inbox":
        emails = await sql`
          SELECT 
            e.id,
            e.subject,
            e.body,
            e.is_read,
            e.is_starred,
            e.sent_at,
            e.read_at,
            sender.id as sender_id,
            sender.name as sender_name,
            sender.email as sender_email,
            sender.role as sender_role
          FROM emails e
          JOIN users sender ON e.sender_id = sender.id
          WHERE e.recipient_id = ${userId}
            AND e.is_deleted_by_recipient = false
          ORDER BY e.sent_at DESC
        `;
        break;

      case "sent":
        emails = await sql`
          SELECT 
            e.id,
            e.subject,
            e.body,
            e.is_read,
            e.is_starred,
            e.sent_at,
            e.read_at,
            recipient.id as recipient_id,
            recipient.name as recipient_name,
            recipient.email as recipient_email,
            recipient.role as recipient_role
          FROM emails e
          JOIN users recipient ON e.recipient_id = recipient.id
          WHERE e.sender_id = ${userId}
            AND e.is_deleted_by_sender = false
          ORDER BY e.sent_at DESC
        `;
        break;

      case "starred":
        emails = await sql`
          SELECT 
            e.id,
            e.subject,
            e.body,
            e.is_read,
            e.is_starred,
            e.sent_at,
            e.read_at,
            sender.id as sender_id,
            sender.name as sender_name,
            sender.email as sender_email,
            sender.role as sender_role,
            recipient.id as recipient_id,
            recipient.name as recipient_name,
            recipient.email as recipient_email
          FROM emails e
          LEFT JOIN users sender ON e.sender_id = sender.id
          LEFT JOIN users recipient ON e.recipient_id = recipient.id
          WHERE (e.recipient_id = ${userId} OR e.sender_id = ${userId})
            AND e.is_starred = true
            AND (
              (e.recipient_id = ${userId} AND e.is_deleted_by_recipient = false) OR
              (e.sender_id = ${userId} AND e.is_deleted_by_sender = false)
            )
          ORDER BY e.sent_at DESC
        `;
        break;

      case "trash":
        emails = await sql`
          SELECT 
            e.id,
            e.subject,
            e.body,
            e.is_read,
            e.is_starred,
            e.sent_at,
            e.read_at,
            sender.id as sender_id,
            sender.name as sender_name,
            recipient.id as recipient_id,
            recipient.name as recipient_name
          FROM emails e
          LEFT JOIN users sender ON e.sender_id = sender.id
          LEFT JOIN users recipient ON e.recipient_id = recipient.id
          WHERE (
            (e.recipient_id = ${userId} AND e.is_deleted_by_recipient = true) OR
            (e.sender_id = ${userId} AND e.is_deleted_by_sender = true)
          )
          ORDER BY e.sent_at DESC
        `;
        break;

      default:
        return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    return NextResponse.json({ emails, folder });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}

// POST /api/emails - Sende neue Email
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { recipient_id, subject, body } = await request.json();

    // Validierung
    if (!recipient_id || !subject || !body) {
      return NextResponse.json(
        { error: "recipient_id, subject and body are required" },
        { status: 400 }
      );
    }

    // Prüfe ob Empfänger existiert
    const recipient = await sql`
      SELECT id FROM users WHERE id = ${recipient_id}
    `;

    if (recipient.length === 0) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Erstelle Email
    const result = await sql`
      INSERT INTO emails (sender_id, recipient_id, subject, body)
      VALUES (${userId}, ${recipient_id}, ${subject}, ${body})
      RETURNING id, subject, sent_at
    `;

    return NextResponse.json({
      success: true,
      email: result[0],
      message: "Email sent successfully"
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
