#!/usr/bin/env node

/**
 * Migration Script: Add coach_id FK to teams table
 * Run this on your production database ONCE
 * 
 * Usage: node run-coach-migration.mjs
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Starting migration: add coach_id FK to teams...\n');

  try {
    // Step 1: Add coach_id column
    console.log('1️⃣  Adding coach_id column...');
    try {
      await sql`ALTER TABLE teams ADD COLUMN coach_id INTEGER`;
      console.log('   ✅ Column added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Column already exists, continuing...');
      } else {
        throw error;
      }
    }

    // Step 2: Add Foreign Key constraint
    console.log('2️⃣  Adding Foreign Key constraint...');
    try {
      await sql`
        ALTER TABLE teams 
        ADD CONSTRAINT fk_teams_coach 
        FOREIGN KEY (coach_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL
      `;
      console.log('   ✅ Foreign Key added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Constraint already exists, continuing...');
      } else {
        throw error;
      }
    }

    // Step 3: Check current data
    console.log('3️⃣  Checking current teams and coaches...');
    const teams = await sql`SELECT id, name, coach, coach_id FROM teams ORDER BY id`;
    const coaches = await sql`SELECT id, name FROM users WHERE role IN ('coach', 'admin') ORDER BY name`;
    
    console.log('   📋 Teams:');
    teams.forEach(t => console.log(`      - ${t.name} (coach: ${t.coach}, coach_id: ${t.coach_id || 'null'})`));
    
    console.log('   👥 Available Coaches:');
    coaches.forEach(c => console.log(`      - ${c.name} (id: ${c.id})`));

    // Step 4: Migrate data (match by partial name)
    console.log('\n4️⃣  Migrating coach assignments...');
    const updateResult = await sql`
      UPDATE teams 
      SET coach_id = (
        SELECT u.id 
        FROM users u 
        WHERE u.role IN ('coach', 'admin')
          AND (
            u.name ILIKE '%' || teams.coach || '%'
            OR teams.coach ILIKE '%' || u.name || '%'
          )
        LIMIT 1
      )
      WHERE teams.coach IS NOT NULL
        AND teams.coach_id IS NULL
      RETURNING id, name, coach, coach_id
    `;
    
    if (updateResult.length > 0) {
      console.log(`   ✅ Updated ${updateResult.length} teams`);
      updateResult.forEach(t => console.log(`      - ${t.name}: coach_id set to ${t.coach_id}`));
    } else {
      console.log('   ℹ️  No teams needed updating (already migrated)');
    }

    // Step 5: Create index
    console.log('5️⃣  Creating index...');
    try {
      await sql`CREATE INDEX idx_teams_coach_id ON teams(coach_id)`;
      console.log('   ✅ Index created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Index already exists');
      } else {
        throw error;
      }
    }

    // Verification
    console.log('\n📊 Final Verification:');
    const verification = await sql`
      SELECT 
        t.id,
        t.name as team_name,
        t.coach as old_coach,
        t.coach_id,
        u.name as coach_name,
        u.email as coach_email
      FROM teams t
      LEFT JOIN users u ON t.coach_id = u.id
      ORDER BY t.id
    `;

    verification.forEach(t => {
      console.log(`\n   🏆 ${t.team_name}`);
      console.log(`      Old coach name: ${t.old_coach}`);
      if (t.coach_id) {
        console.log(`      ✅ Assigned to: ${t.coach_name} (ID: ${t.coach_id})`);
        console.log(`      Email: ${t.coach_email || 'N/A'}`);
      } else {
        console.log(`      ⚠️  NO COACH ASSIGNED - Please assign manually!`);
      }
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Note: If any teams show "NO COACH ASSIGNED", run these commands:');
    console.log('   UPDATE teams SET coach_id = <user_id> WHERE id = <team_id>;');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
