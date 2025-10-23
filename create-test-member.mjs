import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

// Load environment variables
config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function createTestMember() {
  try {
    // First, check if member already exists
    const existingMember = await sql`
      SELECT id FROM members WHERE first_name = 'Test' AND last_name = 'Mitglied'
    `;

    let memberId;
    if (existingMember.length > 0) {
      memberId = existingMember[0].id;
      console.log("✅ Test-Mitglied existiert bereits mit ID:", memberId);
    } else {
      // Create a test member entry first
      const memberResult = await sql`
        INSERT INTO members (first_name, last_name, birth_date, email)
        VALUES ('Test', 'Mitglied', '2010-01-01', 'test.mitglied@example.com')
        RETURNING id
      `;
      memberId = memberResult[0].id;
      console.log("✅ Test-Mitglied in members Tabelle erstellt mit ID:", memberId);
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE username = 'testmitglied'
    `;

    if (existingUser.length > 0) {
      console.log("⚠️ Benutzer 'testmitglied' existiert bereits");
      return;
    }

    // Create user with member role
    const hashedPassword = await bcrypt.hash("test123", 10);
    
    const userResult = await sql`
      INSERT INTO users (username, name, password_hash, role, member_id)
      VALUES ('testmitglied', 'Test Mitglied', ${hashedPassword}, 'member', ${memberId})
      RETURNING id, username, role
    `;

    console.log("✅ Test-Mitglied-Benutzer erfolgreich erstellt!");
    console.log("📋 Login-Daten:");
    console.log("   Username: testmitglied");
    console.log("   Password: test123");
    console.log("   Role: member");
    console.log("   Member ID:", memberId);
  } catch (error) {
    console.error("❌ Fehler:", error);
    process.exit(1);
  }
}

createTestMember();
