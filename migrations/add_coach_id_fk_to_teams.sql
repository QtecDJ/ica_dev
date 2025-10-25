-- Migration: Add coach_id Foreign Key to teams table
-- This replaces the VARCHAR coach column with an INTEGER coach_id that references users.id

-- Step 1: Add new coach_id column
ALTER TABLE teams ADD COLUMN coach_id INTEGER;

-- Step 2: Add Foreign Key constraint
ALTER TABLE teams 
  ADD CONSTRAINT fk_teams_coach 
  FOREIGN KEY (coach_id) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

-- Step 3: Try to migrate data from coach VARCHAR to coach_id
-- This will match coach names with user names
UPDATE teams 
SET coach_id = (
  SELECT u.id 
  FROM users u 
  WHERE u.name = teams.coach 
    AND u.role IN ('coach', 'admin')
  LIMIT 1
)
WHERE teams.coach IS NOT NULL;

-- Step 4: Remove old coach VARCHAR column (optional - keep for safety)
-- ALTER TABLE teams DROP COLUMN coach;

-- Step 5: Create index for better query performance
CREATE INDEX idx_teams_coach_id ON teams(coach_id);

-- Verification
SELECT 
  t.id,
  t.name as team_name,
  t.coach as old_coach_name,
  t.coach_id,
  u.name as new_coach_name
FROM teams t
LEFT JOIN users u ON t.coach_id = u.id;
