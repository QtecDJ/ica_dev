import { requireAuth } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";
import { MessageCircle, Send, User } from "lucide-react";
import Link from "next/link";
import MessagesClient from "@/app/components/MessagesClient";

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

export default async function MessagesPage() {
  const session = await requireAuth();
  const userId = parseInt(session.user.id);
  const userRole = session.user.role;

  // Überprüfe Berechtigung
  if (!["admin", "coach", "parent", "member"].includes(userRole)) {
    throw new Error("Unauthorized");
  }

  // Hole verfügbare Coaches (für Parents und Members - alle Coaches ihrer Teams)
  let availableCoaches: any[] = [];
  if (userRole === "parent") {
    // Parent kann allen Coaches seiner Kinder-Teams schreiben
    availableCoaches = await sql`
      SELECT DISTINCT u.id, u.name, u.email, t.name as team_name, tc.is_primary
      FROM users u
      JOIN team_coaches tc ON u.id = tc.coach_id
      JOIN teams t ON tc.team_id = t.id
      JOIN members m ON m.team_id = t.id
      JOIN parent_children pc ON pc.child_member_id = m.id
      WHERE pc.parent_user_id = ${userId}
        AND u.role IN ('coach', 'admin')
      ORDER BY tc.is_primary DESC, u.name ASC
    `;
  } else if (userRole === "member") {
    // Member kann allen Coaches seines Teams schreiben
    availableCoaches = await sql`
      SELECT DISTINCT u.id, u.name, u.email, t.name as team_name, tc.is_primary
      FROM users user_self
      JOIN members m ON user_self.member_id = m.id
      JOIN teams t ON m.team_id = t.id
      JOIN team_coaches tc ON t.id = tc.team_id
      JOIN users u ON tc.coach_id = u.id
      WHERE user_self.id = ${userId}
        AND u.role IN ('coach', 'admin')
      ORDER BY tc.is_primary DESC, u.name ASC
    `;
  }

  // Hole Admin-Kontakte (für alle Benutzer verfügbar)
  const adminContacts = await sql`
    SELECT id, name, email, 'admin' as contact_type
    FROM users 
    WHERE role = 'admin'
    ORDER BY name
  `;

  // Hole andere Coaches aus gleichen Teams (für Coaches)
  let availableTeamCoaches: any[] = [];
  if (userRole === "coach") {
    // Coaches können nur anderen Coaches ihrer eigenen Teams schreiben
    availableTeamCoaches = await sql`
      SELECT DISTINCT u.id, u.name, u.email, t.name as team_name
      FROM team_coaches tc1
      JOIN teams t ON tc1.team_id = t.id
      JOIN team_coaches tc2 ON t.id = tc2.team_id
      JOIN users u ON tc2.coach_id = u.id
      WHERE tc1.coach_id = ${userId}
        AND u.id != ${userId}
        AND u.role = 'coach'
      ORDER BY t.name, u.name ASC
    `;
  }

  // Hole alle Parents (NUR für Coaches/Admins - aber nur die Parents ihrer eigenen Teams)
  let availableParents: any[] = [];
  if (userRole === "coach") {
    // Coaches sehen NUR Parents der Teams, die sie betreuen
    availableParents = await sql`
      SELECT DISTINCT u.id, u.name, u.email
      FROM users u
      JOIN parent_children pc ON pc.parent_user_id = u.id
      JOIN members m ON pc.child_member_id = m.id
      JOIN teams t ON m.team_id = t.id
      JOIN team_coaches tc ON t.id = tc.team_id
      WHERE tc.coach_id = ${userId}
        AND u.role = 'parent'
      ORDER BY u.name ASC
    `;
  } else if (userRole === "admin") {
    // Nur Admins sehen alle Parents
    availableParents = await sql`
      SELECT DISTINCT u.id, u.name, u.email
      FROM users u
      WHERE u.role = 'parent'
      ORDER BY u.name ASC
    `;
  }

  // Kombiniere verfügbare Kontakte basierend auf Rolle
  let allAvailableContacts: any[] = [...adminContacts]; // Alle können Admins schreiben
  
  if (userRole === "coach") {
    allAvailableContacts = [...allAvailableContacts, ...availableTeamCoaches, ...availableParents];
  } else if (userRole === "admin") {
    allAvailableContacts = [...allAvailableContacts, ...availableParents];
  } else {
    // Parents und Members können nur Coaches und Admins schreiben
    allAvailableContacts = [...allAvailableContacts, ...availableCoaches];
  }

  // Hole Konversationen
  const conversationsRaw = await sql`
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
      MAX(created_at) as last_message_date,
      (
        SELECT content 
        FROM message_threads mt2 
        WHERE mt2.partner_id = message_threads.partner_id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) as last_message_content
    FROM message_threads
    GROUP BY partner_id, partner_name, partner_role
    ORDER BY last_message_date DESC
  `;

  // Type casting für TypeScript
  const conversations = conversationsRaw.map((conv: any) => ({
    partner_id: Number(conv.partner_id),
    partner_name: String(conv.partner_name),
    partner_role: String(conv.partner_role),
    message_count: Number(conv.message_count),
    unread_count: Number(conv.unread_count),
    last_message_date: String(conv.last_message_date),
    last_message_content: conv.last_message_content ? String(conv.last_message_content) : undefined,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Private Nachrichten
          </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
            Kommuniziere direkt mit deinen Coaches und der Administration
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/messages/new" 
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Neue Nachricht
          </Link>
        </div>
      </div>

      {/* Messages Client Component */}
      <MessagesClient
        initialConversations={conversations}
        availableCoaches={allAvailableContacts}
        availableParents={availableParents}
        userRole={userRole}
        userId={userId}
      />
    </div>
  );
}
