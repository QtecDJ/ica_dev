import { neon } from '@neondatabase/serverless';
import { NextRequest } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

// API Route für parent-child Verwaltung
export async function POST(request: NextRequest) {
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

      case 'bulk_sync':
        // Sync alle Parent-Child Beziehungen basierend auf member.parent_email
        return await bulkSyncRelationships();
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  
  if (parentId) {
    return await getChildrenForParent(parseInt(parentId));
  }
  
  return new Response(JSON.stringify({ error: 'Missing parentId' }), { status: 400 });
}

// Verbesserte Hilfsfunktionen
async function ensureParentChildrenTable() {
  const tableExists = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'parent_children'
    );
  `;

  if (!tableExists[0].exists) {
    // Erstelle die Tabelle falls sie nicht existiert (vereinfachtes Schema)
    await sql`
      CREATE TABLE parent_children (
        id SERIAL PRIMARY KEY,
        parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        child_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parent_user_id, child_member_id)
      );
    `;

    // Erstelle Indizes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_parent_children_parent 
      ON parent_children(parent_user_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_parent_children_child 
      ON parent_children(child_member_id);
    `;
  }
  
  return true;
}

async function linkChildToParent(parentUserId: number, childMemberId: number) {
  try {
    console.log(`Attempting to link parent ${parentUserId} with child ${childMemberId}`);
    
    // Überprüfe ob Parent und Child existieren
    const parentExists = await sql`SELECT id FROM users WHERE id = ${parentUserId} AND role = 'parent'`;
    const childExists = await sql`SELECT id FROM members WHERE id = ${childMemberId}`;
    
    console.log(`Parent exists: ${parentExists.length > 0}, Child exists: ${childExists.length > 0}`);
    
    if (parentExists.length === 0) {
      return new Response(JSON.stringify({ error: 'Parent user not found' }), { status: 404 });
    }
    
    if (childExists.length === 0) {
      return new Response(JSON.stringify({ error: 'Child member not found' }), { status: 404 });
    }

    // Prüfe ob parent_children Tabelle existiert
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parent_children'
      );
    `;

    if (!tableExists[0].exists) {
      // Erstelle die Tabelle falls sie nicht existiert
      console.log('Creating parent_children table...');
      await sql`
        CREATE TABLE parent_children (
          id SERIAL PRIMARY KEY,
          parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          child_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(parent_user_id, child_member_id)
        );
      `;
    }

    // Erstelle die Verknüpfung (ohne relationship_type da die Spalte möglicherweise nicht existiert)
    await sql`
      INSERT INTO parent_children (parent_user_id, child_member_id)
      VALUES (${parentUserId}, ${childMemberId})
      ON CONFLICT (parent_user_id, child_member_id) DO NOTHING;
    `;

    console.log('Link created successfully');

    // Update auch member.parent_email für Backward-Kompatibilität
    const parentUser = await sql`SELECT email FROM users WHERE id = ${parentUserId}`;
    if (parentUser.length > 0) {
      await sql`
        UPDATE members 
        SET parent_email = ${parentUser[0].email}
        WHERE id = ${childMemberId};
      `;
      console.log('Updated member.parent_email');
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Link error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: `Failed to link child: ${errorMessage}` }), { status: 500 });
  }
}

async function unlinkChildFromParent(parentUserId: number, childMemberId: number) {
  try {
    await ensureParentChildrenTable();
    
    // Entferne aus parent_children Tabelle
    await sql`
      DELETE FROM parent_children 
      WHERE parent_user_id = ${parentUserId} AND child_member_id = ${childMemberId};
    `;

    // Optional: Entferne auch parent_email falls keine anderen Verknüpfungen existieren
    const otherConnections = await sql`
      SELECT COUNT(*) as count FROM parent_children 
      WHERE child_member_id = ${childMemberId};
    `;

    if (otherConnections[0].count === 0) {
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
    await ensureParentChildrenTable();
    
    // Hole Parent User Email
    const parentUser = await sql`SELECT email FROM users WHERE id = ${parentUserId}`;
    if (parentUser.length === 0) {
      return new Response(JSON.stringify({ children: [] }), { status: 200 });
    }

    const parentEmail = parentUser[0].email;

    // Hole sowohl direkt verknüpfte als auch email-matched Kinder
    const children = await sql`
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
          WHEN pc.parent_user_id IS NOT NULL THEN 'direct_link'
          ELSE 'email_match'
        END as link_type,
        'parent' as relationship_type,
        true as can_manage,
        EXTRACT(YEAR FROM AGE(m.birth_date)) as age
      FROM members m
      LEFT JOIN teams t ON m.team_id = t.id
      LEFT JOIN parent_children pc ON pc.child_member_id = m.id AND pc.parent_user_id = ${parentUserId}
      WHERE pc.parent_user_id = ${parentUserId} 
         OR m.parent_email = ${parentEmail}
      ORDER BY m.first_name, m.last_name;
    `;

    return new Response(JSON.stringify({ children }), { status: 200 });
  } catch (error) {
    console.error('Get children error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get children' }), { status: 500 });
  }
}

async function createParentFromEmail(parentEmail: string) {
  try {
    // Validiere Email Format
    if (!parentEmail || !parentEmail.includes('@')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid email format' 
      }), { status: 400 });
    }

    // Prüfe ob User bereits existiert
    const existingUser = await sql`SELECT id FROM users WHERE email = ${parentEmail}`;
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User already exists',
        userId: existingUser[0].id
      }), { status: 400 });
    }

    // Hole Daten aus members für besseren Namen
    const memberData = await sql`
      SELECT parent_name, parent_phone, COUNT(*) as child_count
      FROM members 
      WHERE parent_email = ${parentEmail} 
      GROUP BY parent_name, parent_phone
      ORDER BY child_count DESC
      LIMIT 1;
    `;

    const username = parentEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const name = memberData.length > 0 && memberData[0].parent_name 
      ? memberData[0].parent_name 
      : 'Elternteil';

    // Erstelle neuen Parent User (vereinfacht für vorhandenes Schema)
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
        ${name},
        ${parentEmail}
      ) RETURNING id, username, email, name;
    `;

    // Erstelle automatisch Verknüpfungen zu allen Kindern mit dieser Email
    const children = await sql`
      SELECT id FROM members WHERE parent_email = ${parentEmail};
    `;

    let linkedCount = 0;
    for (const child of children) {
      try {
        // Vereinfachter Insert ohne relationship_type
        await sql`
          INSERT INTO parent_children (parent_user_id, child_member_id)
          VALUES (${newUser[0].id}, ${child.id})
          ON CONFLICT (parent_user_id, child_member_id) DO NOTHING;
        `;
        linkedCount++;
      } catch (linkError) {
        console.warn('Could not link child:', child.id, linkError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: newUser[0],
      linkedChildren: linkedCount
    }), { status: 201 });
  } catch (error) {
    console.error('Create parent error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create parent user' }), { status: 500 });
  }
}

async function bulkSyncRelationships() {
  try {
    await ensureParentChildrenTable();
    
    // Finde alle member.parent_email Einträge ohne entsprechende parent_children Verknüpfung
    const unlinkedMembers = await sql`
      SELECT DISTINCT
        m.id as member_id,
        m.parent_email,
        u.id as parent_user_id
      FROM members m
      JOIN users u ON u.email = m.parent_email AND u.role = 'parent'
      LEFT JOIN parent_children pc ON pc.parent_user_id = u.id AND pc.child_member_id = m.id
      WHERE m.parent_email IS NOT NULL 
        AND m.parent_email != ''
        AND pc.id IS NULL;
    `;

    let syncedCount = 0;
    for (const link of unlinkedMembers) {
      try {
        await sql`
          INSERT INTO parent_children (parent_user_id, child_member_id)
          VALUES (${link.parent_user_id}, ${link.member_id})
          ON CONFLICT (parent_user_id, child_member_id) DO NOTHING;
        `;
        syncedCount++;
      } catch (error) {
        console.warn('Could not sync relationship:', link, error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      syncedRelationships: syncedCount,
      totalFound: unlinkedMembers.length
    }), { status: 200 });
  } catch (error) {
    console.error('Bulk sync error:', error);
    return new Response(JSON.stringify({ error: 'Failed to sync relationships' }), { status: 500 });
  }
}