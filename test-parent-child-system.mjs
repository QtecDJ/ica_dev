import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🧪 Testing Parent-Child System...\n');

async function testParentChildSystem() {
  try {
    // 1. Überprüfe Datenbankverbindung
    console.log('🔗 Testing database connection...');
    const connectionTest = await sql`SELECT 1 as test`;
    if (connectionTest[0].test === 1) {
      console.log('   ✅ Database connection successful\n');
    }

    // 2. Überprüfe Parent-Children Tabelle
    console.log('📋 Checking parent_children table...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'parent_children'
      );
    `;

    if (tableExists[0].exists) {
      console.log('   ✅ parent_children table exists');
      
      // Zeige Struktur
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'parent_children'
        ORDER BY ordinal_position;
      `;
      
      console.log('   📊 Table structure:');
      columns.forEach(col => {
        console.log(`      - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
      });
    } else {
      console.log('   ❌ parent_children table does not exist');
      console.log('   🔧 Creating table...');
      
      await sql`
        CREATE TABLE parent_children (
          id SERIAL PRIMARY KEY,
          parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          child_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          relationship_type VARCHAR(50) DEFAULT 'parent',
          can_manage BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(parent_user_id, child_member_id)
        );
      `;
      
      await sql`
        CREATE INDEX IF NOT EXISTS idx_parent_children_parent 
        ON parent_children(parent_user_id);
      `;
      
      await sql`
        CREATE INDEX IF NOT EXISTS idx_parent_children_child 
        ON parent_children(child_member_id);
      `;
      
      console.log('   ✅ parent_children table created');
    }

    // 3. Überprüfe Users mit Role Parent
    console.log('\n👥 Checking parent users...');
    const parentUsers = await sql`
      SELECT id, username, name, email
      FROM users 
      WHERE role = 'parent'
      ORDER BY name;
    `;
    
    console.log(`   📊 Found ${parentUsers.length} parent users:`);
    parentUsers.forEach(parent => {
      console.log(`      - ${parent.name} (${parent.email})`);
    });

    // 4. Überprüfe Members mit parent_email
    console.log('\n👶 Checking members with parent_email...');
    const membersWithParents = await sql`
      SELECT 
        id, 
        first_name, 
        last_name, 
        parent_email,
        (SELECT name FROM teams WHERE id = members.team_id) as team_name
      FROM members 
      WHERE parent_email IS NOT NULL 
      AND parent_email != ''
      ORDER BY parent_email, first_name;
    `;
    
    console.log(`   📊 Found ${membersWithParents.length} members with parent_email:`);
    const groupedByEmail = {};
    membersWithParents.forEach(member => {
      if (!groupedByEmail[member.parent_email]) {
        groupedByEmail[member.parent_email] = [];
      }
      groupedByEmail[member.parent_email].push(member);
    });
    
    Object.entries(groupedByEmail).forEach(([email, children]) => {
      console.log(`      📧 ${email}:`);
      children.forEach(child => {
        console.log(`         - ${child.first_name} ${child.last_name}${child.team_name ? ` (${child.team_name})` : ''}`);
      });
    });

    // 5. Überprüfe aktuelle Parent-Child Verknüpfungen
    console.log('\n🔗 Checking current parent-child relationships...');
    const currentLinks = await sql`
      SELECT 
        pc.id,
        u.name as parent_name,
        u.email as parent_email,
        m.first_name || ' ' || m.last_name as child_name,
        pc.created_at
      FROM parent_children pc
      JOIN users u ON pc.parent_user_id = u.id
      JOIN members m ON pc.child_member_id = m.id
      ORDER BY u.name, m.first_name;
    `;
    
    console.log(`   📊 Found ${currentLinks.length} direct relationships:`);
    currentLinks.forEach(link => {
      console.log(`      - ${link.parent_name} → ${link.child_name}`);
    });

    // 6. Finde verwaiste Kinder (parent_email ohne entsprechenden parent user)
    console.log('\n🔍 Finding orphaned children...');
    const orphanedChildren = await sql`
      SELECT DISTINCT
        m.parent_email,
        COUNT(*) as child_count,
        STRING_AGG(m.first_name || ' ' || m.last_name, ', ') as children_names
      FROM members m
      LEFT JOIN users u ON u.email = m.parent_email AND u.role = 'parent'
      WHERE m.parent_email IS NOT NULL 
        AND m.parent_email != ''
        AND u.id IS NULL
      GROUP BY m.parent_email
      ORDER BY child_count DESC;
    `;
    
    if (orphanedChildren.length > 0) {
      console.log(`   ⚠️  Found ${orphanedChildren.length} orphaned parent emails:`);
      orphanedChildren.forEach(orphan => {
        console.log(`      📧 ${orphan.parent_email} (${orphan.child_count} children: ${orphan.children_names})`);
      });
      
      console.log('\n   💡 Recommendation: Create parent users for these emails using the admin interface.');
    } else {
      console.log('   ✅ No orphaned children found - all parent emails have corresponding users');
    }

    // 7. Finde unverknüpfte Beziehungen (parent user + child mit gleicher email, aber keine parent_children Eintrag)
    console.log('\n🔍 Finding unlinked relationships...');
    const unlinkedRelationships = await sql`
      SELECT 
        u.id as parent_user_id,
        u.name as parent_name,
        u.email as parent_email,
        m.id as child_member_id,
        m.first_name || ' ' || m.last_name as child_name
      FROM users u
      JOIN members m ON m.parent_email = u.email
      LEFT JOIN parent_children pc ON pc.parent_user_id = u.id AND pc.child_member_id = m.id
      WHERE u.role = 'parent'
        AND pc.id IS NULL
      ORDER BY u.name, m.first_name;
    `;
    
    if (unlinkedRelationships.length > 0) {
      console.log(`   ⚠️  Found ${unlinkedRelationships.length} unlinked relationships:`);
      unlinkedRelationships.forEach(rel => {
        console.log(`      - ${rel.parent_name} (${rel.parent_email}) → ${rel.child_name} (not linked in parent_children)`);
      });
      
      console.log('\n   💡 Recommendation: Use the bulk sync feature in the admin interface.');
    } else {
      console.log('   ✅ All email-matched relationships are properly linked');
    }

    // 8. Zusammenfassung und Empfehlungen
    console.log('\n📊 SUMMARY:');
    console.log(`   👥 Parent Users: ${parentUsers.length}`);
    console.log(`   👶 Members with parent_email: ${membersWithParents.length}`);
    console.log(`   🔗 Direct relationships: ${currentLinks.length}`);
    console.log(`   ⚠️  Orphaned emails: ${orphanedChildren.length}`);
    console.log(`   🔄 Unlinked relationships: ${unlinkedRelationships.length}`);
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (orphanedChildren.length > 0) {
      console.log('   1. ⭐ Create parent users for orphaned emails using admin interface');
    }
    if (unlinkedRelationships.length > 0) {
      console.log('   2. ⭐ Run bulk sync to link existing email matches');
    }
    if (orphanedChildren.length === 0 && unlinkedRelationships.length === 0) {
      console.log('   ✅ System is properly configured! No action needed.');
    }
    
    console.log('\n🚀 Ready to test admin interface at: /administration/parent-children');
    
  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    process.exit(1);
  }
}

// Führe Test aus
testParentChildSystem();