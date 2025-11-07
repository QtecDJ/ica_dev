import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET /api/emails/[id] - Hole einzelne Email
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const emailId = parseInt(params.id);

    // Hole Email mit Sender und Empfänger Info
    const emails = await sql`
      SELECT 
        e.id,
        e.subject,
        e.body,
        e.is_read,
        e.is_starred,
        e.sent_at,
        e.read_at,
        e.reply_to_id,
        sender.id as sender_id,
        sender.name as sender_name,
        sender.email as sender_email,
        sender.role as sender_role,
        recipient.id as recipient_id,
        recipient.name as recipient_name,
        recipient.email as recipient_email,
        recipient.role as recipient_role
      FROM emails e
      JOIN users sender ON e.sender_id = sender.id
      JOIN users recipient ON e.recipient_id = recipient.id
      WHERE e.id = ${emailId}
        AND (e.sender_id = ${userId} OR e.recipient_id = ${userId})
        AND (
          (e.recipient_id = ${userId} AND e.is_deleted_by_recipient = false) OR
          (e.sender_id = ${userId} AND e.is_deleted_by_sender = false)
        )
    `;

    if (emails.length === 0) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const email = emails[0];

    // Wenn User der Empfänger ist und Email noch nicht gelesen, markiere als gelesen
    if (email.recipient_id === userId && !email.is_read) {
      await sql`
        UPDATE emails
        SET is_read = true, read_at = CURRENT_TIMESTAMP
        WHERE id = ${emailId}
      `;
      email.is_read = true;
      email.read_at = new Date();
    }

    return NextResponse.json({ email });
  } catch (error) {
    console.error("Error fetching email:", error);
    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 }
    );
  }
}

// PATCH /api/emails/[id] - Update Email (star, delete, read status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const emailId = parseInt(params.id);
    const { action } = await request.json();

    // Prüfe ob Email dem User gehört
    const emails = await sql`
      SELECT sender_id, recipient_id FROM emails
      WHERE id = ${emailId}
        AND (sender_id = ${userId} OR recipient_id = ${userId})
    `;

    if (emails.length === 0) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const email = emails[0];
    const isSender = email.sender_id === userId;
    const isRecipient = email.recipient_id === userId;

    switch (action) {
      case "star":
        await sql`
          UPDATE emails
          SET is_starred = NOT is_starred
          WHERE id = ${emailId}
        `;
        break;

      case "delete":
        if (isSender) {
          await sql`
            UPDATE emails
            SET is_deleted_by_sender = true
            WHERE id = ${emailId}
          `;
        }
        if (isRecipient) {
          await sql`
            UPDATE emails
            SET is_deleted_by_recipient = true
            WHERE id = ${emailId}
          `;
        }
        break;

      case "restore":
        if (isSender) {
          await sql`
            UPDATE emails
            SET is_deleted_by_sender = false
            WHERE id = ${emailId}
          `;
        }
        if (isRecipient) {
          await sql`
            UPDATE emails
            SET is_deleted_by_recipient = false
            WHERE id = ${emailId}
          `;
        }
        break;

      case "mark_read":
        if (isRecipient) {
          await sql`
            UPDATE emails
            SET is_read = true, read_at = CURRENT_TIMESTAMP
            WHERE id = ${emailId}
          `;
        }
        break;

      case "mark_unread":
        if (isRecipient) {
          await sql`
            UPDATE emails
            SET is_read = false, read_at = NULL
            WHERE id = ${emailId}
          `;
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Email ${action} successful` });
  } catch (error) {
    console.error("Error updating email:", error);
    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 }
    );
  }
}

// DELETE /api/emails/[id] - Permanent Delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const emailId = parseInt(params.id);

    // Prüfe ob beide Seiten gelöscht haben (dann permanent löschen)
    const emails = await sql`
      SELECT sender_id, recipient_id, is_deleted_by_sender, is_deleted_by_recipient
      FROM emails
      WHERE id = ${emailId}
        AND (sender_id = ${userId} OR recipient_id = ${userId})
    `;

    if (emails.length === 0) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const email = emails[0];

    // Wenn beide Seiten gelöscht haben → permanent löschen
    if (email.is_deleted_by_sender && email.is_deleted_by_recipient) {
      await sql`DELETE FROM emails WHERE id = ${emailId}`;
      return NextResponse.json({ success: true, message: "Email permanently deleted" });
    }

    return NextResponse.json({ success: true, message: "Email marked as deleted" });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json(
      { error: "Failed to delete email" },
      { status: 500 }
    );
  }
}
