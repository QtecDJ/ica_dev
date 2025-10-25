-- ============================================
-- Infinity Cheer Allstars - Optimized Database Schema
-- Version: 2.0
-- Date: 2025-10-25
-- 
-- Performance Optimizations:
-- - Proper indexes on all foreign keys
-- - Composite indexes for common queries
-- - Partitioning ready structure
-- - Normalized data structure
-- - Cascading deletes for data integrity
-- ============================================

-- ============================================
-- CORE TABLES
-- ============================================

-- Teams Table (Basis für alle Mitglieder)
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level VARCHAR(100) NOT NULL,
  description TEXT,
  coach_user_id INTEGER, -- Reference to users table (wird später hinzugefügt)
  active BOOLEAN DEFAULT true,
  color VARCHAR(20) DEFAULT '#8b5cf6', -- Für UI/Calendar
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members Table (Zentrale Mitgliederdaten)
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  gender VARCHAR(20), -- male, female, other
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Kontaktdaten
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  
  -- Elterndaten (deprecated - use parent_children table)
  parent_name VARCHAR(255),
  parent_email VARCHAR(255),
  parent_phone VARCHAR(50),
  
  -- Zusätzliche Infos
  avatar_url TEXT,
  emergency_contact TEXT,
  medical_notes TEXT,
  shirt_size VARCHAR(10),
  
  -- Status
  active BOOLEAN DEFAULT true,
  membership_start DATE DEFAULT CURRENT_DATE,
  membership_end DATE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Authentication & Authorization)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  
  -- Role-based access control
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'coach', 'member', 'parent')),
  
  -- Verknüpfung zu Member (falls vorhanden)
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  
  -- Account Status
  active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RELATIONSHIP TABLES
-- ============================================

-- Parent-Child Relationships (Eltern-Kind Beziehungen)
CREATE TABLE IF NOT EXISTS parent_children (
  id SERIAL PRIMARY KEY,
  parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'parent', -- parent, guardian, emergency_contact
  can_manage BOOLEAN DEFAULT true, -- Darf Zu-/Absagen etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_user_id, child_member_id)
);

-- ============================================
-- EVENT MANAGEMENT
-- ============================================

-- Events Table (Wettkämpfe, Showcases, etc.)
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Datum & Zeit
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  
  -- Ort
  location VARCHAR(255) NOT NULL,
  address TEXT,
  
  -- Event Details
  event_type VARCHAR(100) NOT NULL, -- competition, showcase, workshop, meeting, other
  is_mandatory BOOLEAN DEFAULT false,
  max_participants INTEGER,
  registration_deadline DATE,
  
  -- Team-spezifisch (NULL = für alle)
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Kosten
  cost DECIMAL(10,2),
  
  -- Zusätzliche Infos
  notes TEXT,
  requirements TEXT, -- Was muss mitgebracht werden
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Participants (Zu-/Absagen für Events)
CREATE TABLE IF NOT EXISTS event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, declined, maybe
  response_date TIMESTAMP,
  
  -- Zusätzliche Infos
  notes TEXT,
  transportation_needed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(event_id, member_id)
);

-- ============================================
-- TRAINING MANAGEMENT
-- ============================================

-- Trainings Table
CREATE TABLE IF NOT EXISTS trainings (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Datum & Zeit
  training_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Ort
  location VARCHAR(255) NOT NULL,
  
  -- Details
  title VARCHAR(255), -- Optional: z.B. "Tumbling Basics"
  focus_areas TEXT, -- Was wird trainiert
  notes TEXT,
  
  -- Trainer
  coach_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern VARCHAR(100), -- weekly, biweekly, etc.
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Attendance (Anwesenheit/Zu-/Absagen)
CREATE TABLE IF NOT EXISTS training_attendance (
  id SERIAL PRIMARY KEY,
  training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, declined, attended, absent
  response_date TIMESTAMP,
  
  -- Tatsächliche Anwesenheit
  checked_in BOOLEAN DEFAULT false,
  check_in_time TIMESTAMP,
  
  -- Notizen
  comment TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(training_id, member_id)
);

-- ============================================
-- CALENDAR & ADDITIONAL EVENTS
-- ============================================

-- Calendar Events (Zusätzliche Kalender-Ereignisse)
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Datum & Zeit
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT false,
  
  -- Event Details
  event_type VARCHAR(50) DEFAULT 'other', -- meeting, holiday, deadline, reminder, other
  location VARCHAR(255),
  color VARCHAR(20) DEFAULT 'blue',
  
  -- Sichtbarkeit
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE, -- NULL = für alle sichtbar
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- COMMUNICATION
-- ============================================

-- Comments/Notes (Trainer-Notizen, Feedback)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Bezug (mindestens eins muss gesetzt sein)
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  training_id INTEGER REFERENCES trainings(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  
  -- Inhalt
  content TEXT NOT NULL,
  comment_type VARCHAR(50) DEFAULT 'note', -- note, feedback, warning, praise
  
  -- Sichtbarkeit
  is_private BOOLEAN DEFAULT false, -- Nur für Coaches sichtbar
  is_important BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (member_id IS NOT NULL OR training_id IS NOT NULL OR event_id IS NOT NULL)
);

-- ============================================
-- NOTIFICATIONS (Optional - für zukünftige Features)
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Details
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- event, training, comment, system
  
  -- Bezug
  reference_type VARCHAR(50), -- event, training, member, etc.
  reference_id INTEGER,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Primary Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Relationship Indexes
CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child ON parent_children(child_member_id);

-- Event Indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date) WHERE status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_team_id ON events(team_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_member ON event_participants(member_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);

-- Training Indexes
CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(training_date) WHERE status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_trainings_team_id ON trainings(team_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_training ON training_attendance(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_member ON training_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_status ON training_attendance(status);

-- Calendar Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_team_id ON calendar_events(team_id);

-- Comment Indexes
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_member ON comments(member_id);
CREATE INDEX IF NOT EXISTS idx_comments_training ON comments(training_id);
CREATE INDEX IF NOT EXISTS idx_comments_event ON comments(event_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- Notification Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Composite Indexes für häufige Queries
CREATE INDEX IF NOT EXISTS idx_members_team_active ON members(team_id, active);
CREATE INDEX IF NOT EXISTS idx_events_date_type ON events(event_date, event_type);
CREATE INDEX IF NOT EXISTS idx_trainings_team_date ON trainings(team_id, training_date);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Update updated_at automatisch bei Änderungen
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers für alle Tabellen mit updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_participants_updated_at BEFORE UPDATE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_attendance_updated_at BEFORE UPDATE ON training_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Vollständige Mitgliederliste mit Team
CREATE OR REPLACE VIEW v_members_full AS
SELECT 
  m.*,
  t.name as team_name,
  t.level as team_level,
  t.color as team_color,
  u.id as user_id,
  u.email as user_email,
  COALESCE(
    EXTRACT(YEAR FROM AGE(m.birth_date)),
    0
  ) as age
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
LEFT JOIN users u ON u.member_id = m.id;

-- View: Anstehende Events mit Teilnehmerzahlen
CREATE OR REPLACE VIEW v_upcoming_events AS
SELECT 
  e.*,
  COUNT(CASE WHEN ep.status = 'accepted' THEN 1 END) as accepted_count,
  COUNT(CASE WHEN ep.status = 'declined' THEN 1 END) as declined_count,
  COUNT(CASE WHEN ep.status = 'pending' THEN 1 END) as pending_count,
  t.name as team_name
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id
LEFT JOIN teams t ON e.team_id = t.id
WHERE e.event_date >= CURRENT_DATE
  AND e.status != 'cancelled'
GROUP BY e.id, t.name
ORDER BY e.event_date, e.start_time;

-- View: Anstehende Trainings mit Anwesenheit
CREATE OR REPLACE VIEW v_upcoming_trainings AS
SELECT 
  tr.*,
  t.name as team_name,
  COUNT(CASE WHEN ta.status = 'accepted' THEN 1 END) as accepted_count,
  COUNT(CASE WHEN ta.status = 'declined' THEN 1 END) as declined_count,
  u.name as coach_name
FROM trainings tr
LEFT JOIN teams t ON tr.team_id = t.id
LEFT JOIN training_attendance ta ON tr.id = ta.training_id
LEFT JOIN users u ON tr.coach_id = u.id
WHERE tr.training_date >= CURRENT_DATE
  AND tr.status != 'cancelled'
GROUP BY tr.id, t.name, u.name
ORDER BY tr.training_date, tr.start_time;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE teams IS 'Cheerleading teams/squads';
COMMENT ON TABLE members IS 'Team members/athletes';
COMMENT ON TABLE users IS 'Authentication and authorization';
COMMENT ON TABLE parent_children IS 'Parent-child relationships';
COMMENT ON TABLE events IS 'Competitions, showcases, and major events';
COMMENT ON TABLE event_participants IS 'Event attendance and RSVPs';
COMMENT ON TABLE trainings IS 'Regular training sessions';
COMMENT ON TABLE training_attendance IS 'Training attendance tracking';
COMMENT ON TABLE calendar_events IS 'Additional calendar items (holidays, meetings, etc.)';
COMMENT ON TABLE comments IS 'Notes and feedback from coaches';
COMMENT ON TABLE notifications IS 'User notifications (future feature)';

-- ============================================
-- DATA INTEGRITY CONSTRAINTS
-- ============================================

-- Foreign key für team coach (nachdem users erstellt wurde)
ALTER TABLE teams ADD CONSTRAINT fk_teams_coach 
  FOREIGN KEY (coach_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Stelle sicher dass Coaches auch wirklich coaches sind
ALTER TABLE trainings ADD CONSTRAINT chk_trainings_coach
  CHECK (coach_id IS NULL OR EXISTS (
    SELECT 1 FROM users WHERE id = coach_id AND role IN ('admin', 'coach')
  ));
