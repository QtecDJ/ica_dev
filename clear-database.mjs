import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function clearDatabase() {
  console.log('🗑️  Lösche Datenbankeinträge (außer Qtec)...\n');

  try {
    // 1. Lösche Trainingsanwesenheit
    const attendance = await sql`DELETE FROM training_attendance RETURNING id`;
    console.log(`✅ ${attendance.length} Trainingsanwesenheiten gelöscht`);

    // 2. Lösche Kommentare
    const comments = await sql`DELETE FROM comments RETURNING id`;
    console.log(`✅ ${comments.length} Kommentare gelöscht`);

    // 3. Lösche Parent-Children Beziehungen
    const parentChildren = await sql`DELETE FROM parent_children RETURNING id`;
    console.log(`✅ ${parentChildren.length} Eltern-Kind-Beziehungen gelöscht`);

    // 4. Lösche Trainings
    const trainings = await sql`DELETE FROM trainings RETURNING id`;
    console.log(`✅ ${trainings.length} Trainings gelöscht`);

    // 5. Lösche Events
    const events = await sql`DELETE FROM events RETURNING id`;
    console.log(`✅ ${events.length} Events gelöscht`);

    // 6. Lösche Mitglieder
    const members = await sql`DELETE FROM members RETURNING id`;
    console.log(`✅ ${members.length} Mitglieder gelöscht`);

    // 7. Lösche Teams
    const teams = await sql`DELETE FROM teams RETURNING id`;
    console.log(`✅ ${teams.length} Teams gelöscht`);

    // 8. Lösche alle Benutzer AUSSER Qtec
    const users = await sql`
      DELETE FROM users 
      WHERE username != 'qtec' 
      RETURNING id, username
    `;
    console.log(`✅ ${users.length} Benutzer gelöscht (Qtec bleibt erhalten)`);

    console.log('\n🎉 Datenbank erfolgreich geleert!');
    console.log('🔐 Qtec-Benutzer wurde beibehalten');

  } catch (error) {
    console.error('❌ Fehler beim Löschen:', error.message);
    process.exit(1);
  }
}

clearDatabase();
