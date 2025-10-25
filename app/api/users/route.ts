import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query;
    if (role === 'parent') {
      query = sql`
        SELECT id, username, name, email, role, created_at
        FROM users 
        WHERE role = 'parent'
        ORDER BY name;
      `;
    } else {
      query = sql`
        SELECT id, username, name, email, role, created_at
        FROM users 
        ORDER BY role, name;
      `;
    }

    const users = await query;

    return new Response(JSON.stringify({ users }), { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
  }
}