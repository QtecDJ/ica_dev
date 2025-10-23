import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function createAdmin() {
  try {
    const username = "qtec";
    const name = "Qtec";
    const password = "Kai.p0104331780";
    const role = "admin";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existingUser.length > 0) {
      console.log("❌ Benutzer existiert bereits!");
      console.log("Aktualisiere Passwort...");
      
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, name = ${name}, role = ${role}
        WHERE username = ${username}
      `;
      
      console.log("✅ Passwort wurde aktualisiert!");
    } else {
      // Create new admin user
      await sql`
        INSERT INTO users (username, name, password_hash, role, member_id)
        VALUES (${username}, ${name}, ${hashedPassword}, ${role}, NULL)
      `;
      
      console.log("✅ Admin-Benutzer erfolgreich erstellt!");
    }

    console.log("\n📝 Login-Daten:");
    console.log("   Benutzername: " + username);
    console.log("   Passwort: " + password);
    console.log("   Rolle: " + role);
    
  } catch (error) {
    console.error("❌ Fehler:", error);
  }
}

createAdmin();
