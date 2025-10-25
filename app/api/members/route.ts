import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const members = await sql`
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        m.birth_date,
        m.email,
        m.phone,
        m.parent_name,
        m.parent_email,
        m.parent_phone,
        m.team_id,
        m.avatar_url,
        m.created_at,
        t.name as team_name,
        t.level as team_level,
        t.coach
      FROM members m
      LEFT JOIN teams t ON m.team_id = t.id
      ORDER BY m.first_name, m.last_name;
    `;

    return new Response(JSON.stringify({ members }), { status: 200 });
  } catch (error) {
    console.error('Error fetching members:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch members' }), { status: 500 });
  }
}