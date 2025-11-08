import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkAvatars() {
  try {
    console.log('Checking avatar_url in members table...\n');
    
    const members = await sql`
      SELECT m.id, m.first_name, m.last_name, m.avatar_url, u.username, u.name as user_name
      FROM members m
      LEFT JOIN users u ON u.member_id = m.id
      LIMIT 10
    `;
    
    console.log('Members with their avatar URLs:');
    console.table(members);
    
    const withAvatar = members.filter(m => m.avatar_url);
    const withoutAvatar = members.filter(m => !m.avatar_url);
    
    console.log(`\nSummary:`);
    console.log(`- ${withAvatar.length} members have avatar_url set`);
    console.log(`- ${withoutAvatar.length} members have NO avatar_url`);
    
    if (withAvatar.length > 0) {
      console.log('\nExample avatar URLs:');
      withAvatar.slice(0, 3).forEach(m => {
        console.log(`  ${m.first_name} ${m.last_name}: ${m.avatar_url}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAvatars();
