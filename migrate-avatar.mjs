// Database migration script for avatars
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function migrateDatabase() {
  try {
    console.log("🔄 Starte Migration: Avatar-Feld hinzufügen...\n");

    const sql = neon(process.env.DATABASE_URL);

    console.log("Füge avatar_url Spalte zur members Tabelle hinzu...");
    await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS avatar_url TEXT`;

    console.log("\n✅ Migration erfolgreich abgeschlossen!");
    console.log("   - avatar_url Feld wurde zur members Tabelle hinzugefügt");

  } catch (error) {
    console.error("❌ Fehler bei der Migration:", error);
    process.exit(1);
  }
}

migrateDatabase();
