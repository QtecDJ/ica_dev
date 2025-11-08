import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔐 API Route: /api/administration/users called');
    const session = await getServerSession(authOptions);
    
    console.log('👤 Session user:', session?.user?.email, 'Role:', session?.user?.role);
    
    // Nur Admins und Manager dürfen die Daten abrufen
    if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log('✅ Authorization passed');

    // Hole alle Benutzer mit ihren verknüpften Mitgliedern
    const usersRaw = await sql`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.name,
        u.role,
        u.roles,
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

    // Verarbeite Benutzer für Frontend-Kompatibilität
    const users = usersRaw.map(user => ({
      ...user,
      roles: user.roles && Array.isArray(user.roles) ? user.roles : [user.role].filter(Boolean)
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

    // Hole alle Teams für Coach-Zuweisung (coach column wurde entfernt, nur team_coaches table)
    const teams = await sql`
      SELECT id, name FROM teams ORDER BY name
    `;

    console.log('📊 Data counts:', {
      users: users.length,
      members: members.length,
      teams: teams.length
    });

    return NextResponse.json({
      users,
      members,
      teams
    });
  } catch (error) {
    console.error('💥 Error fetching administration data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch administration data' },
      { status: 500 }
    );
  }
}