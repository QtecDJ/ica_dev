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

  // Hole verfügbare Coaches (für Parents und Members)
  let availableCoaches: any[] = [];
  if (userRole === "parent" || userRole === "member") {
    // Parents und Members können alle Coaches/Admins schreiben
    // (Da teams.coach nur ein VARCHAR ist, können wir keine team-basierte Filterung machen)
    availableCoaches = await sql`
      SELECT u.id, u.name, u.email
      FROM users u
      WHERE u.role IN ('coach', 'admin')
      ORDER BY u.name ASC
    `;
  }

  // Hole alle Parents (für Coaches/Admins)
  let availableParents: any[] = [];
  if (userRole === "coach" || userRole === "admin") {
    availableParents = await sql`
      SELECT u.id, u.name, u.email
      FROM users u
      WHERE u.role = 'parent'
      ORDER BY u.name ASC
    `;
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
            {userRole === "parent" 
              ? "Schreibe direkt mit den Coaches" 
              : "Kommuniziere privat mit Eltern"
            }
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="card-body">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🔒 Private & Sichere Kommunikation
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Alle Nachrichten sind privat und können nur von dir und deinem Gesprächspartner gelesen werden. 
                {userRole === "parent" && " Nutze diesen Bereich um direkt mit den Coaches zu kommunizieren."}
                {(userRole === "coach" || userRole === "admin") && " Hier kannst du auf Fragen von Eltern antworten."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Client Component */}
      <MessagesClient
        initialConversations={conversations}
        availableCoaches={availableCoaches}
        availableParents={availableParents}
        userRole={userRole}
        userId={userId}
      />
    </div>
  );
}
