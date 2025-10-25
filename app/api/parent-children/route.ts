import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// API Route für parent-child Verwaltung
export async function POST(request: Request) {
  try {
    const { action, parentUserId, childMemberId, parentEmail } = await request.json();

    switch (action) {
      case 'link_child':
        // Verknüpfe ein Kind mit einem Elternteil
        return await linkChildToParent(parentUserId, childMemberId);
      
      case 'unlink_child':
        // Entferne Verknüpfung
        return await unlinkChildFromParent(parentUserId, childMemberId);
      
      case 'get_children':
        // Hole alle Kinder eines Elternteils
        return await getChildrenForParent(parentUserId);
      
      case 'create_parent_from_email':
        // Erstelle Parent User basierend auf Email aus member
        return await createParentFromEmail(parentEmail);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  
  if (parentId) {
    return await getChildrenForParent(parseInt(parentId));
  }
  
  return new Response(JSON.stringify({ error: 'Missing parentId' }), { status: 400 });
}

// Hilfsfunktionen
async function linkChildToParent(parentUserId: number, childMemberId: number) {
  try {
    // Prüfe ob parent_children Tabelle existiert, falls nicht verwende member.parent_email
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parent_children'
      );
    `;

    if (tableExists[0].exists) {
      // Verwende parent_children Tabelle
      await sql`
        INSERT INTO parent_children (parent_user_id, child_member_id)
        VALUES (${parentUserId}, ${childMemberId})
        ON CONFLICT (parent_user_id, child_member_id) DO NOTHING;
      `;
    } else {
      // Fallback: Aktualisiere member.parent_email
      const parentUser = await sql`SELECT email FROM users WHERE id = ${parentUserId}`;
      if (parentUser.length > 0) {
        await sql`
          UPDATE members 
          SET parent_email = ${parentUser[0].email}
          WHERE id = ${childMemberId};
        `;
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Link error:', error);
    return new Response(JSON.stringify({ error: 'Failed to link child' }), { status: 500 });
  }
}

async function unlinkChildFromParent(parentUserId: number, childMemberId: number) {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parent_children'
      );
    `;

    if (tableExists[0].exists) {
      await sql`
        DELETE FROM parent_children 
        WHERE parent_user_id = ${parentUserId} AND child_member_id = ${childMemberId};
      `;
    } else {
      // Fallback: Entferne parent_email
      await sql`
        UPDATE members 
        SET parent_email = NULL
        WHERE id = ${childMemberId};
      `;
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Unlink error:', error);
    return new Response(JSON.stringify({ error: 'Failed to unlink child' }), { status: 500 });
  }
}

async function getChildrenForParent(parentUserId: number) {
  try {
    // Hole Parent User Email
    const parentUser = await sql`SELECT email FROM users WHERE id = ${parentUserId}`;
    if (parentUser.length === 0) {
      return new Response(JSON.stringify({ children: [] }), { status: 200 });
    }

    const parentEmail = parentUser[0].email;

    // Prüfe parent_children Tabelle
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parent_children'
      );
    `;

    let children;
    if (tableExists[0].exists) {
      // Verwende parent_children Tabelle mit Fallback auf parent_email
      children = await sql`
        SELECT DISTINCT
          m.id,
          m.first_name,
          m.last_name,
          m.birth_date,
          m.email,
          m.phone,
          m.team_id,
          m.avatar_url,
          t.name as team_name,
          t.level as team_level,
          CASE 
            WHEN pc.parent_user_id IS NOT NULL THEN 'linked'
            ELSE 'email_match'
          END as link_type
        FROM members m
        LEFT JOIN teams t ON m.team_id = t.id
        LEFT JOIN parent_children pc ON pc.child_member_id = m.id AND pc.parent_user_id = ${parentUserId}
        WHERE pc.parent_user_id = ${parentUserId} 
           OR m.parent_email = ${parentEmail}
        ORDER BY m.first_name, m.last_name;
      `;
    } else {
      // Fallback: Nur parent_email
      children = await sql`
        SELECT 
          m.id,
          m.first_name,
          m.last_name,
          m.birth_date,
          m.email,
          m.phone,
          m.team_id,
          m.avatar_url,
          t.name as team_name,
          t.level as team_level,
          'email_match' as link_type
        FROM members m
        LEFT JOIN teams t ON m.team_id = t.id
        WHERE m.parent_email = ${parentEmail}
        ORDER BY m.first_name, m.last_name;
      `;
    }

    return new Response(JSON.stringify({ children }), { status: 200 });
  } catch (error) {
    console.error('Get children error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get children' }), { status: 500 });
  }
}

async function createParentFromEmail(parentEmail: string) {
  try {
    // Prüfe ob User bereits existiert
    const existingUser = await sql`SELECT id FROM users WHERE email = ${parentEmail}`;
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User already exists',
        userId: existingUser[0].id
      }), { status: 400 });
    }

    // Hole Daten aus members
    const memberData = await sql`
      SELECT parent_name, parent_phone 
      FROM members 
      WHERE parent_email = ${parentEmail} 
      LIMIT 1;
    `;

    const username = parentEmail.split('@')[0];
    const name = memberData.length > 0 ? memberData[0].parent_name : 'Elternteil';

    // Erstelle neuen Parent User
    const newUser = await sql`
      INSERT INTO users (
        username, 
        password_hash, 
        role, 
        name, 
        email
      ) VALUES (
        ${username},
        '$2a$10$dummy.hash.needs.to.be.changed.on.first.login',
        'parent',
        ${name || 'Elternteil'},
        ${parentEmail}
      ) RETURNING id, username, email;
    `;

    return new Response(JSON.stringify({ 
      success: true, 
      user: newUser[0] 
    }), { status: 201 });
  } catch (error) {
    console.error('Create parent error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create parent user' }), { status: 500 });
  }
}