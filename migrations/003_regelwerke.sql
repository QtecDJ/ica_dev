-- ============================================
-- Regelwerk System - Migration
-- Erstellt am: 08.11.2025
-- ============================================

-- Kategorien für Regelwerke (z.B. Technik, Sicherheit, Wettkampfregeln)
CREATE TABLE IF NOT EXISTS regelwerk_kategorien (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  beschreibung TEXT,
  icon VARCHAR(100) DEFAULT 'book-open', -- Lucide icon name
  color VARCHAR(20) DEFAULT '#8b5cf6', -- Hex color für UI
  reihenfolge INTEGER DEFAULT 0, -- Sortierung
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regelwerke (die eigentlichen Dokumente/Texte)
CREATE TABLE IF NOT EXISTS regelwerke (
  id SERIAL PRIMARY KEY,
  titel VARCHAR(255) NOT NULL,
  beschreibung TEXT,
  inhalt TEXT NOT NULL, -- Der eigentliche Regelwerk-Inhalt
  kategorie_id INTEGER REFERENCES regelwerk_kategorien(id) ON DELETE SET NULL,
  
  -- Optional: Für teamspezifische Regelwerke
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Metadaten
  version VARCHAR(50) DEFAULT '1.0',
  gueltig_ab DATE DEFAULT CURRENT_DATE,
  gueltig_bis DATE,
  ist_aktiv BOOLEAN DEFAULT true,
  
  -- Autor/Editor
  erstellt_von INTEGER REFERENCES users(id) ON DELETE SET NULL,
  aktualisiert_von INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coach-Regelwerk Zuweisungen (welche Coaches sehen welche Regelwerke)
CREATE TABLE IF NOT EXISTS coach_regelwerk_zuweisungen (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  regelwerk_id INTEGER NOT NULL REFERENCES regelwerke(id) ON DELETE CASCADE,
  
  -- Optional: Team-spezifische Zuweisung
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Zugewiesen von (Admin)
  zugewiesen_von INTEGER REFERENCES users(id) ON DELETE SET NULL,
  zugewiesen_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  gelesen BOOLEAN DEFAULT false,
  gelesen_am TIMESTAMP,
  
  UNIQUE(coach_id, regelwerk_id, team_id)
);

-- ============================================
-- INDEXES für Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_regelwerke_kategorie ON regelwerke(kategorie_id);
CREATE INDEX IF NOT EXISTS idx_regelwerke_team ON regelwerke(team_id);
CREATE INDEX IF NOT EXISTS idx_regelwerke_aktiv ON regelwerke(ist_aktiv) WHERE ist_aktiv = true;
CREATE INDEX IF NOT EXISTS idx_coach_regelwerk_coach ON coach_regelwerk_zuweisungen(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_regelwerk_regelwerk ON coach_regelwerk_zuweisungen(regelwerk_id);
CREATE INDEX IF NOT EXISTS idx_coach_regelwerk_team ON coach_regelwerk_zuweisungen(team_id);

-- ============================================
-- TRIGGERS für updated_at
-- ============================================

CREATE TRIGGER update_regelwerk_kategorien_updated_at BEFORE UPDATE ON regelwerk_kategorien
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regelwerke_updated_at BEFORE UPDATE ON regelwerke
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA - Standard Kategorien
-- ============================================

INSERT INTO regelwerk_kategorien (name, beschreibung, icon, color, reihenfolge) VALUES
('Allgemeine Regeln', 'Grundlegende Verhaltensregeln und Richtlinien', 'book-open', '#3b82f6', 1),
('Trainingsregeln', 'Regeln für Training und Übungsabläufe', 'dumbbell', '#8b5cf6', 2),
('Sicherheit', 'Sicherheitsvorschriften und Notfallprozeduren', 'shield-check', '#ef4444', 3),
('Wettkampfregeln', 'Regeln für Wettkämpfe und Competitions', 'trophy', '#f59e0b', 4),
('Technik & Stunts', 'Technische Ausführung und Stunt-Richtlinien', 'zap', '#10b981', 5),
('Verhalten & Ethik', 'Verhaltenskodex und ethische Richtlinien', 'heart', '#ec4899', 6)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VIEWS für einfache Abfragen
-- ============================================

CREATE OR REPLACE VIEW v_regelwerke_mit_kategorie AS
SELECT 
  r.*,
  k.name as kategorie_name,
  k.icon as kategorie_icon,
  k.color as kategorie_color,
  u1.name as erstellt_von_name,
  u2.name as aktualisiert_von_name,
  t.name as team_name
FROM regelwerke r
LEFT JOIN regelwerk_kategorien k ON r.kategorie_id = k.id
LEFT JOIN users u1 ON r.erstellt_von = u1.id
LEFT JOIN users u2 ON r.aktualisiert_von = u2.id
LEFT JOIN teams t ON r.team_id = t.id
WHERE r.ist_aktiv = true;

CREATE OR REPLACE VIEW v_coach_regelwerke AS
SELECT 
  crz.*,
  r.titel as regelwerk_titel,
  r.beschreibung as regelwerk_beschreibung,
  r.kategorie_id,
  k.name as kategorie_name,
  k.icon as kategorie_icon,
  k.color as kategorie_color,
  u.name as coach_name,
  t.name as team_name
FROM coach_regelwerk_zuweisungen crz
JOIN regelwerke r ON crz.regelwerk_id = r.id
LEFT JOIN regelwerk_kategorien k ON r.kategorie_id = k.id
LEFT JOIN users u ON crz.coach_id = u.id
LEFT JOIN teams t ON crz.team_id = t.id
WHERE r.ist_aktiv = true;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE regelwerk_kategorien IS 'Kategorien für Regelwerke (z.B. Sicherheit, Technik)';
COMMENT ON TABLE regelwerke IS 'Regelwerke/Dokumentationen für Teams und Coaches';
COMMENT ON TABLE coach_regelwerk_zuweisungen IS 'Zuweisungen von Regelwerken zu Coaches';
