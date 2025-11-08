import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function setTestAvatar() {
  try {
    // Finde einen Benutzer mit dem wir testen können
    const users = await sql`
      SELECT u.id, u.username, u.name, u.member_id, m.first_name, m.last_name
      FROM users u
      LEFT JOIN members m ON u.member_id = m.id
      WHERE u.member_id IS NOT NULL
      LIMIT 1
    `;
    
    if (users.length === 0) {
      console.log('Kein Benutzer mit member_id gefunden!');
      return;
    }
    
    const user = users[0];
    console.log('Setze Test-Avatar für:');
    console.log(`  User: ${user.name} (${user.username})`);
    console.log(`  Member ID: ${user.member_id}`);
    
    // Setze einen Test-Avatar URL (Placeholder Image)
    const testAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + '+' + user.last_name)}&size=200&background=ef4444&color=fff&bold=true`;
    
    await sql`
      UPDATE members
      SET avatar_url = ${testAvatarUrl}
      WHERE id = ${user.member_id}
    `;
    
    console.log(`\n✅ Avatar URL gesetzt!`);
    console.log(`   URL: ${testAvatarUrl}`);
    
    // Überprüfung
    const check = await sql`
      SELECT avatar_url
      FROM members
      WHERE id = ${user.member_id}
    `;
    
    console.log('\n✅ Überprüfung:');
    console.log(`   Gespeicherter Wert: ${check[0].avatar_url}`);
    
    console.log('\n💡 Tipp: Logge dich jetzt mit diesem Benutzer ein um das Bild zu sehen!');
    console.log(`   Username: ${user.username}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

setTestAvatar();
