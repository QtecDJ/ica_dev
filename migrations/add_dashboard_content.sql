-- Dashboard Content Management System
-- Ermöglicht Admin-Verwaltung von Dashboard-Inhalten (Willkommensnachrichten, Livestreams, etc.)

CREATE TABLE IF NOT EXISTS dashboard_content (
  id SERIAL PRIMARY KEY,
  
  -- Content Metadata
  content_type VARCHAR(50) NOT NULL, -- 'welcome', 'announcement', 'livestream', 'alert', 'info'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- Rich text content (HTML)
  
  -- Visibility Settings
  is_active BOOLEAN DEFAULT true,
  target_role VARCHAR(50), -- 'parent', 'member', 'coach', 'admin', NULL = alle
  priority INTEGER DEFAULT 0, -- Sortierung (höher = weiter oben)
  
  -- Livestream specific
  livestream_url VARCHAR(500), -- YouTube/Twitch embed URL
  livestream_platform VARCHAR(50), -- 'youtube', 'twitch', 'vimeo', etc.
  event_date TIMESTAMP, -- Für zeitgebundene Inhalte
  expires_at TIMESTAMP, -- Auto-deaktivieren nach diesem Datum
  
  -- Style Options
  background_color VARCHAR(20) DEFAULT 'default', -- 'default', 'blue', 'red', 'green', 'yellow', 'purple'
  icon VARCHAR(50), -- Lucide icon name
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_dashboard_content_active ON dashboard_content(is_active);
CREATE INDEX IF NOT EXISTS idx_dashboard_content_type ON dashboard_content(content_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_content_role ON dashboard_content(target_role);
CREATE INDEX IF NOT EXISTS idx_dashboard_content_priority ON dashboard_content(priority DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_content_expires ON dashboard_content(expires_at);

-- Standard-Willkommensnachricht für Eltern einfügen
INSERT INTO dashboard_content (
  content_type,
  title,
  content,
  target_role,
  priority,
  background_color,
  icon,
  is_active
) VALUES (
  'welcome',
  '👋 Herzlich willkommen im Elternbereich!',
  '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  </div>',
  'parent',
  100,
  'red',
  'Heart',
  true
) ON CONFLICT DO NOTHING;

-- Beispiel: Livestream-Ankündigung (inaktiv)
INSERT INTO dashboard_content (
  content_type,
  title,
  content,
  target_role,
  priority,
  background_color,
  icon,
  livestream_url,
  livestream_platform,
  event_date,
  is_active
) VALUES (
  'livestream',
  '🔴 LIVE: Deutsche Meisterschaft 2025',
  '<p class="mb-3">Verfolgt unsere Teams live bei der Deutschen Meisterschaft in München!</p>
   <p class="text-sm">📅 Samstag, 15. November 2025 • 14:00 Uhr</p>
   <p class="text-sm">📍 Olympiahalle München</p>',
  NULL, -- Alle Rollen
  200, -- Hohe Priorität
  'purple',
  'Video',
  'https://www.youtube.com/embed/LIVE_STREAM_ID',
  'youtube',
  '2025-11-15 14:00:00',
  false -- Noch nicht aktiv, Admin aktiviert am Event-Tag
) ON CONFLICT DO NOTHING;

-- Beispiel: Wichtige Ankündigung
INSERT INTO dashboard_content (
  content_type,
  title,
  content,
  target_role,
  priority,
  background_color,
  icon,
  expires_at,
  is_active
) VALUES (
  'announcement',
  '📣 Wichtig: Neue Trainingszeiten ab November',
  '<p class="mb-2">Ab dem 1. November 2025 gelten neue Trainingszeiten für alle Teams:</p>
   <ul class="list-disc list-inside space-y-1 mb-3">
     <li>Sparkles: Montag & Mittwoch 16:00 - 18:00 Uhr</li>
     <li>Princesses: Dienstag & Donnerstag 17:00 - 19:00 Uhr</li>
   </ul>
   <p class="text-sm">Bitte beachtet die Änderungen in der Kalenderansicht!</p>',
  NULL,
  150,
  'blue',
  'Bell',
  '2025-11-30 23:59:59', -- Automatisch deaktiviert nach Ende November
  false -- Noch nicht aktiv
) ON CONFLICT DO NOTHING;

-- Kommentar
COMMENT ON TABLE dashboard_content IS 'CMS für Dashboard-Inhalte: Willkommensnachrichten, Livestreams, Ankündigungen, etc.';
COMMENT ON COLUMN dashboard_content.content_type IS 'Art des Inhalts: welcome, announcement, livestream, alert, info';
COMMENT ON COLUMN dashboard_content.target_role IS 'Zielgruppe: parent, member, coach, admin oder NULL für alle';
COMMENT ON COLUMN dashboard_content.priority IS 'Sortierung: höhere Werte werden oben angezeigt';
COMMENT ON COLUMN dashboard_content.livestream_url IS 'Embed-URL für YouTube/Twitch/Vimeo Livestreams';
COMMENT ON COLUMN dashboard_content.expires_at IS 'Automatische Deaktivierung nach diesem Zeitpunkt';
