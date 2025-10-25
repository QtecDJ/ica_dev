import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Hole alle aktuellen Beziehungen
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parent_children'
      );
    `;

    let relationships;
    if (tableExists[0].exists) {
      // Verwende parent_children Tabelle plus email matches
      relationships = await sql`
        SELECT DISTINCT
          u.id as parent_id,
          u.name as parent_name,
          u.email as parent_email,
          m.id as child_id,
          m.first_name || ' ' || m.last_name as child_name,
          CASE 
            WHEN pc.parent_user_id IS NOT NULL THEN 'direct_link'
            ELSE 'email_match'
          END as link_type
        FROM users u
        JOIN members m ON (
          m.parent_email = u.email OR 
          EXISTS (
            SELECT 1 FROM parent_children pc2 
            WHERE pc2.parent_user_id = u.id AND pc2.child_member_id = m.id
          )
        )
        LEFT JOIN parent_children pc ON pc.parent_user_id = u.id AND pc.child_member_id = m.id
        WHERE u.role = 'parent'
        ORDER BY u.name, m.first_name;
      `;
    } else {
      // Fallback: Nur email matches
      relationships = await sql`
        SELECT 
          u.id as parent_id,
          u.name as parent_name,
          u.email as parent_email,
          m.id as child_id,
          m.first_name || ' ' || m.last_name as child_name,
          'email_match' as link_type
        FROM users u
        JOIN members m ON m.parent_email = u.email
        WHERE u.role = 'parent'
        ORDER BY u.name, m.first_name;
      `;
    }

    return new Response(JSON.stringify({ relationships }), { status: 200 });
  } catch (error) {
    console.error('Error getting relationships:', error);
    return new Response(JSON.stringify({ error: 'Failed to get relationships' }), { status: 500 });
  }
}