-- Migration: Add training attendance tracking system
-- Date: 2025-01-17

-- Training attendance table to track who participates in trainings
CREATE TABLE IF NOT EXISTS training_attendance (
  id SERIAL PRIMARY KEY,
  training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  marked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  UNIQUE(training_id, member_id)
);

-- Training archival table to store metadata for completed trainings
CREATE TABLE IF NOT EXISTS training_archive (
  id SERIAL PRIMARY KEY,
  training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  training_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  description TEXT,
  total_members_invited INTEGER DEFAULT 0,
  total_members_attended INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5,2),
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  archived_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_attendance_training ON training_attendance(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_member ON training_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_attended ON training_attendance(training_id, attended);
CREATE INDEX IF NOT EXISTS idx_training_archive_team ON training_archive(team_id);
CREATE INDEX IF NOT EXISTS idx_training_archive_date ON training_archive(training_date DESC);

-- Comments
COMMENT ON TABLE training_attendance IS 'Tracks attendance of members for each training session';
COMMENT ON COLUMN training_attendance.attended IS 'Whether the member attended the training';
COMMENT ON COLUMN training_attendance.marked_by IS 'Coach or admin who marked the attendance';
COMMENT ON COLUMN training_attendance.notes IS 'Optional notes about attendance (e.g., reason for absence)';

COMMENT ON TABLE training_archive IS 'Stores metadata and statistics for completed/archived trainings';
COMMENT ON COLUMN training_archive.attendance_rate IS 'Percentage of invited members who attended';
COMMENT ON COLUMN training_archive.archived_by IS 'User who archived the training';