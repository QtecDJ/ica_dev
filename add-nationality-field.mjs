import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addNationalityField() {
  try {
    console.log('🔄 Adding nationality field to members table...');
    
    await sql`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS nationality VARCHAR(100)
    `;
    
    console.log('✅ Nationality field added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding nationality field:', error);
    process.exit(1);
  }
}

addNationalityField();
