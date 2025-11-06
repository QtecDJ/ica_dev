/**
 * Migration: Cleanup Coach System
 * Ziel: Entferne teams.coach Spalte, nutze nur noch team_coaches Tabelle
 * Datum: 2025-11-06
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('🔧 Starting Coach System Cleanup Migration...\n');

  try {
    // 1. Prüfe ob team_coaches Tabelle existiert
    console.log('1️⃣ Checking if team_coaches table exists...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'team_coaches'
      );
    `;

    if (!tableExists[0].exists) {
      console.log('   ⚠️  team_coaches table does not exist. Creating it...');
      
      await sql`
        CREATE TABLE team_coaches (
          id SERIAL PRIMARY KEY,
          team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role VARCHAR(50) DEFAULT 'coach',
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(team_id, coach_id)
        );
      `;
      
      console.log('   ✅ team_coaches table created');
    } else {
      console.log('   ✅ team_coaches table exists');
    }

    // 2. Migriere bestehende Daten von teams.coach nach team_coaches
    console.log('\n2️⃣ Migrating existing coach assignments...');
    
    const teamsWithCoach = await sql`
      SELECT id, coach 
      FROM teams 
      WHERE coach IS NOT NULL AND coach != ''
    `;

    console.log(`   Found ${teamsWithCoach.length} teams with coach assignments`);

    let migratedCount = 0;
    for (const team of teamsWithCoach) {
      // Prüfe ob coach eine User ID ist (Zahl als String)
      const coachId = parseInt(team.coach);
      
      if (!isNaN(coachId)) {
        // Prüfe ob User existiert
        const userExists = await sql`
          SELECT id FROM users WHERE id = ${coachId}
        `;

        if (userExists.length > 0) {
          // Prüfe ob Assignment bereits existiert
          const existingAssignment = await sql`
            SELECT id FROM team_coaches 
            WHERE team_id = ${team.id} AND coach_id = ${coachId}
          `;

          if (existingAssignment.length === 0) {
            // Füge zu team_coaches hinzu
            await sql`
              INSERT INTO team_coaches (team_id, coach_id, role, is_primary)
              VALUES (${team.id}, ${coachId}, 'head_coach', true)
            `;
            migratedCount++;
            console.log(`   ✅ Migrated team ${team.id} -> coach ${coachId}`);
          } else {
            console.log(`   ⏭️  Assignment already exists for team ${team.id}`);
          }
        } else {
          console.log(`   ⚠️  User ${coachId} does not exist, skipping team ${team.id}`);
        }
      } else {
        console.log(`   ⚠️  Invalid coach value "${team.coach}" for team ${team.id}, skipping`);
      }
    }

    console.log(`   ✅ Migrated ${migratedCount} coach assignments`);

    // 3. Entferne teams.coach Spalte
    console.log('\n3️⃣ Removing teams.coach column...');
    
    const coachColumnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'teams' 
        AND column_name = 'coach'
      );
    `;

    if (coachColumnExists[0].exists) {
      await sql`ALTER TABLE teams DROP COLUMN coach`;
      console.log('   ✅ teams.coach column dropped');
    } else {
      console.log('   ⏭️  teams.coach column does not exist, skipping');
    }

    // 4. Erstelle Indizes für Performance
    console.log('\n4️⃣ Creating indexes...');
    
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_team_coaches_team_id ON team_coaches(team_id);
      `;
      console.log('   ✅ Index on team_id created');
    } catch (err) {
      console.log('   ⏭️  Index on team_id already exists');
    }

    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_team_coaches_coach_id ON team_coaches(coach_id);
      `;
      console.log('   ✅ Index on coach_id created');
    } catch (err) {
      console.log('   ⏭️  Index on coach_id already exists');
    }

    // 5. Summary
    console.log('\n📊 Migration Summary:');
    const stats = await sql`
      SELECT 
        COUNT(*) as total_teams,
        COUNT(DISTINCT tc.team_id) as teams_with_coaches,
        COUNT(tc.id) as total_assignments,
        COUNT(DISTINCT tc.coach_id) as unique_coaches
      FROM teams t
      LEFT JOIN team_coaches tc ON t.id = tc.team_id
    `;

    console.log(`   Total Teams: ${stats[0].total_teams}`);
    console.log(`   Teams with Coaches: ${stats[0].teams_with_coaches}`);
    console.log(`   Total Coach Assignments: ${stats[0].total_assignments}`);
    console.log(`   Unique Coaches: ${stats[0].unique_coaches}`);

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
