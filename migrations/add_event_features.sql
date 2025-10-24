-- Erweitere events Tabelle um Zeit und Notizen
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT false;

-- Erstelle event_participants Tabelle für Zu/Absagen
CREATE TABLE IF NOT EXISTS event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, member_id)
);

-- Erstelle calendar_events Tabelle für zusätzliche Kalender-Ereignisse
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  event_type VARCHAR(50) DEFAULT 'other', -- meeting, holiday, deadline, reminder, other
  color VARCHAR(20) DEFAULT 'blue',
  is_all_day BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_member ON event_participants(member_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- Kommentare für Dokumentation
COMMENT ON TABLE event_participants IS 'Stores member participation status for events';
COMMENT ON TABLE calendar_events IS 'Additional calendar events not related to main events';
COMMENT ON COLUMN events.is_mandatory IS 'If true, all team members must respond';
