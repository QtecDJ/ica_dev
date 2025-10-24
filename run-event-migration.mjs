import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🔄 Running event features migration...');

const migration = fs.readFileSync('./migrations/add_event_features.sql', 'utf-8');
const statements = migration
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

for (const statement of statements) {
  if (statement) {
    try {
      await sql([statement]);
      console.log('✅ Executed:', statement.substring(0, 50) + '...');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Already exists, skipping');
      } else {
        console.error('❌ Error:', error.message);
      }
    }
  }
}

console.log('✨ Migration complete!');
