-- Migration: Update training attendance table to match requirements
-- Date: 2025-01-17

-- Add missing columns to existing training_attendance table
ALTER TABLE training_attendance 
  ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS marked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing records to set attended based on status
UPDATE training_attendance 
SET attended = CASE 
  WHEN status = 'present' OR status = 'attended' THEN true 
  ELSE false 
END
WHERE attended IS NULL;

-- Copy comment to notes if notes is empty
UPDATE training_attendance 
SET notes = comment 
WHERE notes IS NULL AND comment IS NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_attendance_attended ON training_attendance(training_id, attended);
CREATE INDEX IF NOT EXISTS idx_training_attendance_marked_by ON training_attendance(marked_by);

-- Comments
COMMENT ON COLUMN training_attendance.attended IS 'Whether the member attended the training';
COMMENT ON COLUMN training_attendance.marked_by IS 'Coach or admin who marked the attendance';
COMMENT ON COLUMN training_attendance.notes IS 'Optional notes about attendance (e.g., reason for absence)';