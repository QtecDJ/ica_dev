import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Nur Admins dürfen die Daten abrufen
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hole alle Benutzer mit ihren verknüpften Mitgliedern
    const usersRaw = await sql`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.name,
        u.role,
        u.member_id,
        u.created_at,
        m.first_name,
        m.last_name,
        t.name as team_name
      FROM users u
      LEFT JOIN members m ON u.member_id = m.id
      LEFT JOIN teams t ON m.team_id = t.id
      ORDER BY u.created_at DESC
    `;

    // Erweitere Benutzer um roles Array für Multi-Rollen Support
    const users = usersRaw.map(user => ({
      ...user,
      roles: [user.role] // Wandle single role in array um für Frontend-Kompatibilität
    }));

    // Hole alle Mitglieder für die Verknüpfung
    const members = await sql`
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        t.name as team_name
      FROM members m
      LEFT JOIN teams t ON m.team_id = t.id
      ORDER BY m.first_name, m.last_name
    `;

    // Hole alle Teams für Coach-Zuweisung
    const teams = await sql`
      SELECT id, name, coach_id FROM teams ORDER BY name
    `;

    return NextResponse.json({
      users,
      members,
      teams
    });
  } catch (error) {
    console.error('Error fetching administration data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch administration data' },
      { status: 500 }
    );
  }
}