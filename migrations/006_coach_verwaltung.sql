-- Coach Media Tabelle (Fotos mit OCR Text)
CREATE TABLE IF NOT EXISTS coach_media (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Pfad zur Datei oder Base64
  file_type VARCHAR(50) DEFAULT 'image/jpeg',
  file_size INTEGER, -- in Bytes
  ocr_text TEXT, -- Erkannter Text aus dem Foto
  ocr_language VARCHAR(10) DEFAULT 'deu', -- Sprache für OCR (deu, eng, etc.)
  ocr_confidence DECIMAL(5,2), -- OCR Genauigkeit in %
  notes TEXT, -- Notizen zum Foto
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coach Music Tabelle (Google Drive Links)
CREATE TABLE IF NOT EXISTS coach_music (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL, -- Titel des Songs
  artist VARCHAR(255), -- Künstler/Interpret
  gdrive_link TEXT NOT NULL, -- Öffentlicher Google Drive Link
  gdrive_file_id VARCHAR(255), -- Extrahierte File ID aus dem Link
  duration INTEGER, -- Dauer in Sekunden (optional)
  playlist_order INTEGER DEFAULT 0, -- Reihenfolge in Playlist
  tags TEXT, -- Komma-getrennte Tags (z.B. "warm-up,cool-down,choreo")
  notes TEXT, -- Notizen zum Song
  play_count INTEGER DEFAULT 0, -- Wie oft abgespielt
  last_played_at TIMESTAMP, -- Letztes Abspielen
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coach Notes Tabelle (Allgemeine Notizen)
CREATE TABLE IF NOT EXISTS coach_notes (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50), -- z.B. "training", "choreografie", "organisation"
  color VARCHAR(20) DEFAULT 'gray', -- Farbe für visuelle Kennzeichnung
  is_pinned BOOLEAN DEFAULT FALSE, -- Wichtige Notizen anheften
  tags TEXT, -- Komma-getrennte Tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coach Playlists Tabelle (Gruppierung von Songs)
CREATE TABLE IF NOT EXISTS coach_playlists (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT 'blue',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verknüpfung: Songs zu Playlists
CREATE TABLE IF NOT EXISTS coach_playlist_songs (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER NOT NULL REFERENCES coach_playlists(id) ON DELETE CASCADE,
  music_id INTEGER NOT NULL REFERENCES coach_music(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0, -- Position in der Playlist
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(playlist_id, music_id)
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_coach_media_coach_id ON coach_media(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_media_team_id ON coach_media(team_id);
CREATE INDEX IF NOT EXISTS idx_coach_media_created_at ON coach_media(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_music_coach_id ON coach_music(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_music_team_id ON coach_music(team_id);
CREATE INDEX IF NOT EXISTS idx_coach_music_playlist_order ON coach_music(playlist_order);

CREATE INDEX IF NOT EXISTS idx_coach_notes_coach_id ON coach_notes(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_notes_team_id ON coach_notes(team_id);
CREATE INDEX IF NOT EXISTS idx_coach_notes_is_pinned ON coach_notes(is_pinned);

CREATE INDEX IF NOT EXISTS idx_coach_playlists_coach_id ON coach_playlists(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_playlist_songs_playlist_id ON coach_playlist_songs(playlist_id);

-- Full Text Search für OCR Text
CREATE INDEX IF NOT EXISTS idx_coach_media_ocr_text_fts ON coach_media USING gin(to_tsvector('german', ocr_text));

-- Full Text Search für Notizen
CREATE INDEX IF NOT EXISTS idx_coach_notes_content_fts ON coach_notes USING gin(to_tsvector('german', content));

COMMENT ON TABLE coach_media IS 'Speichert Fotos und erkannten OCR-Text für Coaches';
COMMENT ON TABLE coach_music IS 'Speichert Google Drive Links zu Musik für Coaches';
COMMENT ON TABLE coach_notes IS 'Allgemeine Notizen für Coaches';
COMMENT ON TABLE coach_playlists IS 'Playlists für organisierte Musik-Verwaltung';
COMMENT ON TABLE coach_playlist_songs IS 'Verknüpfung zwischen Playlists und Songs';
