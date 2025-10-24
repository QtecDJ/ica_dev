import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🔍 Verifying Neon Database Content...\n');
console.log('📍 Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...\n');

try {
  const users = await sql`SELECT username, role FROM users ORDER BY role, username`;
  console.log('👤 Users:', users.length);
  users.forEach(u => console.log(`   - ${u.username} (${u.role})`));

  const teams = await sql`SELECT name, level FROM teams ORDER BY name`;
  console.log(`\n🏆 Teams: ${teams.length}`);
  teams.forEach(t => console.log(`   - ${t.name} (${t.level})`));

  const members = await sql`SELECT COUNT(*) as count FROM members`;
  console.log(`\n👥 Members: ${members[0].count}`);

  const events = await sql`SELECT title, event_date, event_type FROM events ORDER BY event_date`;
  console.log(`\n📅 Events: ${events.length}`);
  events.forEach(e => console.log(`   - ${e.title} (${e.event_date.toISOString().split('T')[0]}) [${e.event_type}]`));

  const participants = await sql`SELECT COUNT(*) as count FROM event_participants`;
  console.log(`\n👥 Event Participants: ${participants[0].count}`);

  const trainings = await sql`SELECT COUNT(*) as count FROM trainings`;
  console.log(`💪 Trainings: ${trainings[0].count}`);

  const calendarEvents = await sql`SELECT COUNT(*) as count FROM calendar_events`;
  console.log(`📆 Calendar Events: ${calendarEvents[0].count}`);

  console.log(`\n✅ All data successfully in Neon Database!`);
  console.log(`\n🔐 Login with: qtec / Kai.p0104331780`);

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
