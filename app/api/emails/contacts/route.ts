import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

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

    // Alle können Admins schreiben
    const admins = await sql`
      SELECT id, name, email, role, 'admin' as contact_type
      FROM users
      WHERE role = 'admin' AND id != ${userId}
      ORDER BY name
    `;
    contacts.push(...admins);

    // Coaches können allen anderen Coaches schreiben
    if (userRole === "coach" || userRole === "admin") {
      const coaches = await sql`
        SELECT id, name, email, role, 'coach' as contact_type
        FROM users
        WHERE role = 'coach' AND id != ${userId}
        ORDER BY name
      `;
      contacts.push(...coaches);
    }

    // Coaches/Admins können Parents schreiben
    if (userRole === "coach") {
      const parents = await sql`
        SELECT DISTINCT u.id, u.name, u.email, u.role, 'parent' as contact_type
        FROM users u
        JOIN parent_children pc ON pc.parent_user_id = u.id
        JOIN members m ON pc.child_member_id = m.id
        JOIN teams t ON m.team_id = t.id
        JOIN team_coaches tc ON t.id = tc.team_id
        WHERE tc.coach_id = ${userId}
          AND u.role = 'parent'
        ORDER BY u.name
      `;
      contacts.push(...parents);
    } else if (userRole === "admin") {
      const parents = await sql`
        SELECT id, name, email, role, 'parent' as contact_type
        FROM users
        WHERE role = 'parent'
        ORDER BY name
      `;
      contacts.push(...parents);
    }

    // Parents können Coaches ihrer Kinder-Teams schreiben
    if (userRole === "parent") {
      const coaches = await sql`
        SELECT DISTINCT u.id, u.name, u.email, u.role, t.name as team_name
        FROM users u
        JOIN team_coaches tc ON u.id = tc.coach_id
        JOIN teams t ON tc.team_id = t.id
        JOIN members m ON m.team_id = t.id
        JOIN parent_children pc ON pc.child_member_id = m.id
        WHERE pc.parent_user_id = ${userId}
          AND u.role IN ('coach', 'admin')
        ORDER BY tc.is_primary DESC, u.name
      `;
      contacts.push(...coaches);
    }

    // Members können Coaches ihres Teams schreiben
    if (userRole === "member") {
      const coaches = await sql`
        SELECT DISTINCT u.id, u.name, u.email, u.role, t.name as team_name
        FROM users user_self
        JOIN members m ON user_self.member_id = m.id
        JOIN teams t ON m.team_id = t.id
        JOIN team_coaches tc ON t.id = tc.team_id
        JOIN users u ON tc.coach_id = u.id
        WHERE user_self.id = ${userId}
          AND u.role IN ('coach', 'admin')
        ORDER BY tc.is_primary DESC, u.name
      `;
      contacts.push(...coaches);
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
