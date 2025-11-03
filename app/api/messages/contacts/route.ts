import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    let contacts: any[] = [];

    // Hole verfügbare Coaches (für Parents und Members)
    if (userRole === "parent") {
      const availableCoaches = await sql`
        SELECT DISTINCT u.id, u.name, u.email, 'coach' as contact_type, t.name as team_name
        FROM users u
        JOIN team_coaches tc ON u.id = tc.coach_id
        JOIN teams t ON tc.team_id = t.id
        JOIN members m ON m.team_id = t.id
        JOIN parent_children pc ON pc.child_member_id = m.id
        WHERE pc.parent_user_id = ${userId}
          AND u.role IN ('coach', 'admin')
        ORDER BY u.name ASC
      `;
      contacts = [...contacts, ...availableCoaches];
    } else if (userRole === "member") {
      const availableCoaches = await sql`
        SELECT DISTINCT u.id, u.name, u.email, 'coach' as contact_type, t.name as team_name
        FROM users user_self
        JOIN members m ON user_self.member_id = m.id
        JOIN teams t ON m.team_id = t.id
        JOIN team_coaches tc ON t.id = tc.team_id
        JOIN users u ON tc.coach_id = u.id
        WHERE user_self.id = ${userId}
          AND u.role IN ('coach', 'admin')
        ORDER BY u.name ASC
      `;
      contacts = [...contacts, ...availableCoaches];
    }

    // Hole andere Coaches aus gleichen Teams (für Coaches)
    if (userRole === "coach") {
      const availableTeamCoaches = await sql`
        SELECT DISTINCT u.id, u.name, u.email, 'coach' as contact_type, t.name as team_name
        FROM team_coaches tc1
        JOIN teams t ON tc1.team_id = t.id
        JOIN team_coaches tc2 ON t.id = tc2.team_id
        JOIN users u ON tc2.coach_id = u.id
        WHERE tc1.coach_id = ${userId}
          AND u.id != ${userId}
          AND u.role = 'coach'
        ORDER BY u.name ASC
      `;
      contacts = [...contacts, ...availableTeamCoaches];
    }

    // Hole verfügbare Parents (für Coaches/Admins)
    if (userRole === "coach" || userRole === "admin") {
      if (userRole === "admin") {
        const availableParents = await sql`
          SELECT DISTINCT u.id, u.name, u.email, 'parent' as contact_type
          FROM users u
          WHERE u.role = 'parent'
          ORDER BY u.name ASC
        `;
        contacts = [...contacts, ...availableParents];
      } else {
        const availableParents = await sql`
          SELECT DISTINCT u.id, u.name, u.email, 'parent' as contact_type
          FROM users u
          JOIN parent_children pc ON pc.parent_user_id = u.id
          JOIN members m ON pc.child_member_id = m.id
          JOIN teams t ON m.team_id = t.id
          JOIN team_coaches tc ON t.id = tc.team_id
          WHERE tc.coach_id = ${userId}
            AND u.role = 'parent'
          ORDER BY u.name ASC
        `;
        contacts = [...contacts, ...availableParents];
      }
    }

    // Hole Admin-Kontakte (für alle Benutzer verfügbar)
    const adminContacts = await sql`
      SELECT id, name, email, 'admin' as contact_type
      FROM users 
      WHERE role = 'admin'
      ORDER BY name
    `;
    contacts = [...contacts, ...adminContacts];

    // Entferne Duplikate basierend auf der ID
    const uniqueContacts = contacts.filter((contact, index, self) =>
      index === self.findIndex(c => c.id === contact.id)
    );

    return NextResponse.json({ contacts: uniqueContacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Kontakte" },
      { status: 500 }
    );
  }
}