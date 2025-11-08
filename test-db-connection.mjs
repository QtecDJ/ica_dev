#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_d2x8QHsDLzFM@ep-icy-darkness-aga8aesc-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
  console.log('🔍 Teste Datenbankverbindung...\n');
  
  try {
    const sql = neon(DATABASE_URL);
    
    // Test 1: Basis-Verbindung
    console.log('1️⃣ Teste Basis-Verbindung...');
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('   ✅ Verbindung erfolgreich!');
    console.log('   📅 Server Zeit:', result[0].current_time);
    console.log('   🗄️  PostgreSQL:', result[0].pg_version.split(' ')[1]);
    
    // Test 2: Prüfe ob Regelwerk-Tabellen existieren
    console.log('\n2️⃣ Prüfe Regelwerk-Tabellen...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('regelwerk_kategorien', 'regelwerke', 'coach_regelwerk_zuweisungen')
      ORDER BY table_name
    `;
    
    if (tables.length === 3) {
      console.log('   ✅ Alle 3 Regelwerk-Tabellen gefunden:');
      tables.forEach(t => console.log('      -', t.table_name));
    } else {
      console.log('   ⚠️  Nur', tables.length, 'von 3 Tabellen gefunden');
    }
    
    // Test 3: Prüfe Kategorien
    console.log('\n3️⃣ Prüfe Regelwerk-Kategorien...');
    const kategorien = await sql`SELECT COUNT(*) as count FROM regelwerk_kategorien`;
    console.log('   ✅ Kategorien gefunden:', kategorien[0].count);
    
    if (parseInt(kategorien[0].count) > 0) {
      const katList = await sql`SELECT name, color FROM regelwerk_kategorien ORDER BY reihenfolge`;
      katList.forEach(k => console.log('      -', k.name, `(${k.color})`));
    }
    
    // Test 4: Prüfe Users-Tabelle
    console.log('\n4️⃣ Prüfe Users...');
    const users = await sql`SELECT COUNT(*) as count FROM users WHERE roles @> '["coach"]'::jsonb OR role = 'coach'`;
    console.log('   ✅ Coaches gefunden:', users[0].count);
    
    // Test 5: Prüfe Teams-Tabelle
    console.log('\n5️⃣ Prüfe Teams...');
    const teams = await sql`SELECT COUNT(*) as count FROM teams`;
    console.log('   ✅ Teams gefunden:', teams[0].count);
    
    console.log('\n✨ Alle Tests erfolgreich! Die Datenbank ist verbunden und bereit.\n');
    
  } catch (error) {
    console.error('\n❌ Datenbankverbindungs-Fehler:', error);
    console.error('\n💡 Mögliche Lösungen:');
    console.error('   - Prüfe ob die DATABASE_URL in .env.local korrekt ist');
    console.error('   - Prüfe ob die Datenbank erreichbar ist');
    console.error('   - Führe die Migration aus: node migrate-regelwerke.mjs\n');
    process.exit(1);
  }
}

testConnection();
