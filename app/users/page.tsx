import { requireRole } from "@/lib/auth-utils";
import UserManagementClient from "@/app/components/UserManagementClient";
import { neon } from "@neondatabase/serverless";

interface User {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: string;
  member_id: number | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  team_name: string | null;
}

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  team_name: string | null;
}

export default async function UsersManagementPage() {
  // Nur Admins dürfen diese Seite sehen
  await requireRole(["admin"]);

  // Hole alle Benutzer mit ihren verknüpften Mitgliedern
  const sql = neon(process.env.DATABASE_URL!);
  const users = await sql`
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
  ` as unknown as User[];

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
  ` as unknown as Member[];

  return <UserManagementClient users={users} members={members} />;
}
