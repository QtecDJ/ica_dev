#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_d2x8QHsDLzFM@ep-icy-darkness-aga8aesc-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function runMigration() {
  console.log('🚀 Starte Regelwerk-Migration...\n');
  
  try {
    const sql = neon(DATABASE_URL);
    
    console.log('📝 Erstelle Tabelle: regelwerk_kategorien...');
    await sql`
      CREATE TABLE IF NOT EXISTS regelwerk_kategorien (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        beschreibung TEXT,
        icon VARCHAR(100) DEFAULT 'book-open',
        color VARCHAR(20) DEFAULT '#8b5cf6',
        reihenfolge INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('📝 Erstelle Tabelle: regelwerke...');
    await sql`
      CREATE TABLE IF NOT EXISTS regelwerke (
        id SERIAL PRIMARY KEY,
        titel VARCHAR(255) NOT NULL,
        beschreibung TEXT,
        inhalt TEXT NOT NULL,
        kategorie_id INTEGER REFERENCES regelwerk_kategorien(id) ON DELETE SET NULL,
        team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        version VARCHAR(50) DEFAULT '1.0',
        gueltig_ab DATE DEFAULT CURRENT_DATE,
        gueltig_bis DATE,
        ist_aktiv BOOLEAN DEFAULT true,
        erstellt_von INTEGER REFERENCES users(id) ON DELETE SET NULL,
        aktualisiert_von INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('📝 Erstelle Tabelle: coach_regelwerk_zuweisungen...');
    await sql`
      CREATE TABLE IF NOT EXISTS coach_regelwerk_zuweisungen (
        id SERIAL PRIMARY KEY,
        coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        regelwerk_id INTEGER NOT NULL REFERENCES regelwerke(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        zugewiesen_von INTEGER REFERENCES users(id) ON DELETE SET NULL,
        zugewiesen_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        gelesen BOOLEAN DEFAULT false,
        gelesen_am TIMESTAMP,
        UNIQUE(coach_id, regelwerk_id, team_id)
      )
    `;
    
    console.log('📝 Erstelle Indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_regelwerke_kategorie ON regelwerke(kategorie_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_regelwerke_team ON regelwerke(team_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_regelwerke_aktiv ON regelwerke(ist_aktiv) WHERE ist_aktiv = true`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coach_regelwerk_coach ON coach_regelwerk_zuweisungen(coach_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coach_regelwerk_regelwerk ON coach_regelwerk_zuweisungen(regelwerk_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coach_regelwerk_team ON coach_regelwerk_zuweisungen(team_id)`;
    
    console.log('📝 Erstelle Triggers...');
    try {
      await sql`
        CREATE TRIGGER update_regelwerk_kategorien_updated_at BEFORE UPDATE ON regelwerk_kategorien
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `;
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }
    
    try {
      await sql`
        CREATE TRIGGER update_regelwerke_updated_at BEFORE UPDATE ON regelwerke
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `;
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }
    
    console.log('📝 Füge Standard-Kategorien hinzu...');
    await sql`
      INSERT INTO regelwerk_kategorien (name, beschreibung, icon, color, reihenfolge) VALUES
      ('Allgemeine Regeln', 'Grundlegende Verhaltensregeln und Richtlinien', 'book-open', '#3b82f6', 1),
      ('Trainingsregeln', 'Regeln für Training und Übungsabläufe', 'dumbbell', '#8b5cf6', 2),
      ('Sicherheit', 'Sicherheitsvorschriften und Notfallprozeduren', 'shield-check', '#ef4444', 3),
      ('Wettkampfregeln', 'Regeln für Wettkämpfe und Competitions', 'trophy', '#f59e0b', 4),
      ('Technik & Stunts', 'Technische Ausführung und Stunt-Richtlinien', 'zap', '#10b981', 5),
      ('Verhalten & Ethik', 'Verhaltenskodex und ethische Richtlinien', 'heart', '#ec4899', 6)
      ON CONFLICT (name) DO NOTHING
    `;
    
    console.log('\n✅ Migration erfolgreich abgeschlossen!\n');
    console.log('Folgende Tabellen wurden erstellt:');
    console.log('  - regelwerk_kategorien');
    console.log('  - regelwerke');
    console.log('  - coach_regelwerk_zuweisungen');
    console.log('\n6 Standard-Kategorien wurden angelegt.\n');
    
  } catch (error) {
    console.error('❌ Fehler bei der Migration:', error);
    process.exit(1);
  }
}

runMigration();
