import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

console.log('🚀 Dashboard Content Migration\n');

try {
  // Erstelle Tabelle
  await sql`
    CREATE TABLE IF NOT EXISTS dashboard_content (
      id SERIAL PRIMARY KEY,
      content_type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      target_role VARCHAR(50),
      priority INTEGER DEFAULT 0,
      livestream_url VARCHAR(500),
      livestream_platform VARCHAR(50),
      event_date TIMESTAMP,
      expires_at TIMESTAMP,
      background_color VARCHAR(20) DEFAULT 'default',
      icon VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    )
  `;
  console.log('✅ Tabelle erstellt');

  // Erstelle Indizes
  await sql`CREATE INDEX IF NOT EXISTS idx_dashboard_content_active ON dashboard_content(is_active)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dashboard_content_type ON dashboard_content(content_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dashboard_content_role ON dashboard_content(target_role)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dashboard_content_priority ON dashboard_content(priority DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dashboard_content_expires ON dashboard_content(expires_at)`;
  console.log('✅ Indizes erstellt');

  // Füge Standard-Willkommensnachricht ein
  const welcomeContent = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <h4 class="font-medium mb-2">Verfügbare Funktionen</h4>
      <ul class="space-y-1">
        <li>• 📅 Events - Alle Vereinsveranstaltungen einsehen</li>
        <li>• 📆 Kalender - Termine im Überblick</li>
        <li>• 🏋️ Trainings - Trainingszeiten aller Teams</li>
        <li>• 👨‍👩‍👧‍👦 Meine Kinder - Informationen zu den Kindern</li>
        <li>• 💬 Nachrichten - Direkter Kontakt zum Coach</li>
      </ul>
    </div>
    <div>
      <h4 class="font-medium mb-2">Hinweise</h4>
      <ul class="space-y-1">
        <li>• Als Elternteil haben Sie Lesezugriff auf alle Informationen</li>
        <li>• Für Fragen wenden Sie sich an den jeweiligen Trainer</li>
        <li>• Wichtige Änderungen werden per E-Mail mitgeteilt</li>
      </ul>
    </div>
  </div>`;

  await sql`
    INSERT INTO dashboard_content (
      content_type, title, content, target_role, priority,
      background_color, icon, is_active
    ) VALUES (
      'welcome',
      '👋 Herzlich willkommen im Elternbereich!',
      ${welcomeContent},
      'parent',
      100,
      'red',
      'Heart',
      true
    )
    ON CONFLICT DO NOTHING
  `;
  console.log('✅ Willkommensnachricht eingefügt');

  // Beispiel Livestream (inaktiv)
  const livestreamContent = `<p class="mb-3">Verfolgt unsere Teams live bei der Deutschen Meisterschaft in München!</p>
   <p class="text-sm">📅 Samstag, 15. November 2025 • 14:00 Uhr</p>
   <p class="text-sm">📍 Olympiahalle München</p>`;

  await sql`
    INSERT INTO dashboard_content (
      content_type, title, content, target_role, priority,
      background_color, icon, livestream_url, livestream_platform,
      event_date, is_active
    ) VALUES (
      'livestream',
      '🔴 LIVE: Deutsche Meisterschaft 2025',
      ${livestreamContent},
      NULL,
      200,
      'purple',
      'Video',
      'https://www.youtube.com/embed/LIVE_STREAM_ID',
      'youtube',
      '2025-11-15 14:00:00',
      false
    )
    ON CONFLICT DO NOTHING
  `;
  console.log('✅ Livestream-Beispiel eingefügt');

  // Prüfe Ergebnis
  const contents = await sql`
    SELECT id, title, content_type, is_active, target_role, priority
    FROM dashboard_content
    ORDER BY priority DESC
  `;

  console.log('\n📝 Dashboard-Inhalte:');
  contents.forEach(c => {
    const role = c.target_role || 'Alle';
    const status = c.is_active ? '✓ Aktiv' : '○ Inaktiv';
    console.log(`  [${status}] ${c.title}`);
    console.log(`      Type: ${c.content_type} | Rolle: ${role} | Priorität: ${c.priority}`);
  });

  console.log('\n✅ Migration abgeschlossen!');
  
} catch (error) {
  console.error('❌ Fehler:', error);
  process.exit(1);
}
