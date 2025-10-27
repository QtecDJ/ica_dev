import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query;
    if (role === 'parent') {
      query = sql`
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
        WHERE u.role = 'parent'
        ORDER BY u.name;
      `;
    } else {
      query = sql`
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
        ORDER BY u.created_at DESC;
      `;
    }

    const users = await query;

    return new Response(JSON.stringify({ users }), { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
  }
}