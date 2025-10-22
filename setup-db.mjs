// Database setup script
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function setupDatabase() {
  try {
    console.log("🚀 Starte Datenbank-Setup für Infinity Cheer Allstars...\n");

    const sql = neon(process.env.DATABASE_URL);

    // Create tables
    console.log("Erstelle Teams-Tabelle...");
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        level VARCHAR(100) NOT NULL,
        coach VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Erstelle Members-Tabelle...");
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        birth_date DATE NOT NULL,
        team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        parent_name VARCHAR(255),
        parent_email VARCHAR(255),
        parent_phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Erstelle Events-Tabelle...");
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        location VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Erstelle Trainings-Tabelle...");
    await sql`
      CREATE TABLE IF NOT EXISTS trainings (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        training_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Erstelle Indexes...");
    await sql`CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_trainings_team_id ON trainings(team_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(training_date)`;

    console.log("\n✅ Datenbank-Schema erfolgreich erstellt!");
    console.log("\n📊 Folgende Tabellen wurden erstellt:");
    console.log("   - teams");
    console.log("   - members");
    console.log("   - events");
    console.log("   - trainings");
    console.log("\n🎉 Setup abgeschlossen! Du kannst jetzt mit 'npm run dev' starten.");

  } catch (error) {
    console.error("❌ Fehler beim Datenbank-Setup:", error);
    process.exit(1);
  }
}

setupDatabase();
