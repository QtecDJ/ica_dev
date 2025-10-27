#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Running Multi-Coach Migration...');
  
  try {
    // Read and split the migration file into individual statements
    const migrationSQL = fs.readFileSync('./migrations/add_multi_coach_support.sql', 'utf8');
    
    // Split by semicolons and filter out comments and empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .filter(stmt => !stmt.match(/^\/\*.*\*\/$/s));
    
    console.log(`📄 Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty or comment-only statements
      if (!statement || statement.trim().length === 0) continue;
      
      try {
        console.log(`${i + 1}. Executing: ${statement.substring(0, 50)}...`);
        await sql`${statement}`;
        console.log('   ✅ Success');
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('already defined')) {
          console.log('   ⚠️  Already exists, skipping...');
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          // Continue with next statement instead of failing completely
        }
      }
    }
    
    console.log('\n✅ Migration completed!');
    
    // Show results
    const results = await sql`
      SELECT 
        team_name,
        coach_name,
        coach_role,
        is_primary
      FROM v_teams_with_coaches
      WHERE coach_id IS NOT NULL
      ORDER BY team_name, is_primary DESC
    `;
    
    console.log('\n📊 Team-Coach Assignments:');
    results.forEach(r => {
      console.log(`  ${r.team_name}: ${r.coach_name} (${r.coach_role}${r.is_primary ? ', PRIMARY' : ''})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  }
}

runMigration();