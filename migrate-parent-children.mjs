import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🔄 Setting up parent-child relationships...\n');

try {
  // 1. Prüfe ob parent_children Tabelle existiert
  console.log('🔍 Checking if parent_children table exists...');
  
  const tableExists = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'parent_children'
    );
  `;
  
  if (!tableExists[0].exists) {
    console.log('📋 Creating parent_children table...');
    
    await sql`
      CREATE TABLE parent_children (
        id SERIAL PRIMARY KEY,
        parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        child_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) DEFAULT 'parent', -- 'parent', 'guardian', etc.
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parent_user_id, child_member_id)
      );
    `;
    
    console.log('   ✅ parent_children table created');
  } else {
    console.log('   ✅ parent_children table already exists');
  }

  // 2. Erstelle Index für bessere Performance
  console.log('📊 Creating indexes...');
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_parent_children_parent 
    ON parent_children(parent_user_id);
  `;
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_parent_children_child 
    ON parent_children(child_member_id);
  `;
  
  console.log('   ✅ Indexes created');

  // 3. Erstelle Eltern-Users basierend auf member.parent_email
  console.log('👥 Creating parent users from member data...');
  
  const membersWithParents = await sql`
    SELECT DISTINCT parent_email, parent_name, parent_phone
    FROM members 
    WHERE parent_email IS NOT NULL 
    AND parent_email != ''
    AND parent_email NOT IN (SELECT email FROM users);
  `;

  console.log(`   Found ${membersWithParents.length} unique parent emails`);

  let createdParents = [];
  for (const memberParent of membersWithParents) {
    try {
      const parentUser = await sql`
        INSERT INTO users (
          username, 
          password_hash, 
          role, 
          name, 
          email
        ) VALUES (
          ${memberParent.parent_email.split('@')[0]}, -- Username aus Email ableiten
          '$2a$10$dummy.hash.for.initial.setup.only', -- Dummy hash, muss beim ersten Login geändert werden
          'parent',
          ${memberParent.parent_name || 'Elternteil'},
          ${memberParent.parent_email}
        ) RETURNING id, username, email;
      `;
      
      createdParents.push(parentUser[0]);
      console.log(`   ✅ Created parent user: ${parentUser[0].email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${memberParent.parent_email} (might already exist)`);
    }
  }

  // 4. Verknüpfe Eltern mit ihren Kindern
  console.log('🔗 Linking parents to children...');
  
  const parentUsers = await sql`
    SELECT id, email FROM users WHERE role = 'parent';
  `;

  let linksCreated = 0;
  for (const parent of parentUsers) {
    const children = await sql`
      SELECT id FROM members WHERE parent_email = ${parent.email};
    `;

    for (const child of children) {
      try {
        await sql`
          INSERT INTO parent_children (parent_user_id, child_member_id, relationship_type)
          VALUES (${parent.id}, ${child.id}, 'parent')
          ON CONFLICT (parent_user_id, child_member_id) DO NOTHING;
        `;
        linksCreated++;
      } catch (error) {
        console.log(`   ⚠️  Could not link parent ${parent.email} to child ${child.id}`);
      }
    }
  }

  console.log(`   ✅ Created ${linksCreated} parent-child links`);

  // 5. Zeige Übersicht
  console.log('\n📊 Current parent-child relationships:');
  
  const relationships = await sql`
    SELECT 
      u.name as parent_name,
      u.email as parent_email,
      m.first_name || ' ' || m.last_name as child_name,
      pc.relationship_type
    FROM parent_children pc
    JOIN users u ON pc.parent_user_id = u.id
    JOIN members m ON pc.child_member_id = m.id
    ORDER BY u.name, m.first_name;
  `;

  relationships.forEach(rel => {
    console.log(`   ${rel.parent_name} (${rel.parent_email}) -> ${rel.child_name} (${rel.relationship_type})`);
  });

  console.log(`\n✨ Setup complete! Created ${createdParents.length} parent users and ${linksCreated} relationships.`);

} catch (error) {
  console.error('\n❌ Error:', error);
  process.exit(1);
}