import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// GET /api/emails/contacts - Hole verfügbare Kontakte zum Schreiben
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    let contacts: any[] = [];

    // Members und Parents können nur Trainer/Coaches anschreiben
    if (userRole === "member" || userRole === "parent") {
      if (userRole === "parent") {
        // Parents können Coaches ihrer Kinder-Teams schreiben
        const coaches = await sql`
          SELECT DISTINCT u.id, u.name, u.email, u.role, t.name as team_name
          FROM users u
          JOIN team_coaches tc ON u.id = tc.coach_id
          JOIN teams t ON tc.team_id = t.id
          JOIN members m ON m.team_id = t.id
          JOIN parent_children pc ON pc.child_member_id = m.id
          WHERE pc.parent_user_id = ${userId}
            AND (u.role = 'coach' OR u.role = 'admin' OR u.role = 'manager')
          ORDER BY tc.is_primary DESC, u.name
        `;
        contacts.push(...coaches);
      } else if (userRole === "member") {
        // Members können Coaches ihres Teams schreiben
        const coaches = await sql`
          SELECT DISTINCT u.id, u.name, u.email, u.role, t.name as team_name
          FROM users user_self
          JOIN members m ON user_self.member_id = m.id
          JOIN teams t ON m.team_id = t.id
          JOIN team_coaches tc ON t.id = tc.team_id
          JOIN users u ON tc.coach_id = u.id
          WHERE user_self.id = ${userId}
            AND (u.role = 'coach' OR u.role = 'admin' OR u.role = 'manager')
          ORDER BY tc.is_primary DESC, u.name
        `;
        contacts.push(...coaches);
      }
    } else {
      // Coaches, Admins, Manager können ALLE schreiben (für @mention System)
      const allUsers = await sql`
        SELECT id, name, email, role, 'user' as contact_type
        FROM users
        WHERE id != ${userId}
        ORDER BY 
          CASE role
            WHEN 'admin' THEN 1
            WHEN 'manager' THEN 2
            WHEN 'coach' THEN 3
            WHEN 'parent' THEN 4
            WHEN 'member' THEN 5
            ELSE 6
          END,
          name
      `;
      contacts.push(...allUsers);
    }

    // Entferne Duplikate basierend auf ID
    const uniqueContacts = Array.from(
      new Map(contacts.map(contact => [contact.id, contact])).values()
    );

    return NextResponse.json({ contacts: uniqueContacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
