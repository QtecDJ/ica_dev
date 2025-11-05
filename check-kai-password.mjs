/**
 * Script to check Kai's user data
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function checkKaiUser() {
  try {
    console.log('🔍 Searching for user "kai"...\n');

    // Search for kai user
    const users = await sql`
      SELECT *
      FROM users
      WHERE LOWER(name) LIKE '%kai%' OR LOWER(email) LIKE '%kai%'
    `;

    if (users.length === 0) {
      console.log('❌ No user found with name or email containing "kai"');
      return;
    }

    console.log('✅ Found user(s):\n');
    
    users.forEach(user => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`👤 Name: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Role: ${user.role}`);
      console.log(`🆔 ID: ${user.id}`);
      console.log(`🔒 Password Hash: ${user.password_hash || user.password || 'N/A'}`);
      console.log('\n📋 All fields:');
      console.log(JSON.stringify(user, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });

    console.log('ℹ️  Note: The password is hashed (bcrypt). The original password is NOT stored.');
    console.log('ℹ️  If you need to reset the password, use the password reset functionality.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkKaiUser();
