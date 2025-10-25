-- Quick Migration Script for Production
-- Copy & Paste this into Neon SQL Editor (console.neon.tech)

-- 1. Add coach_id column (safe to run multiple times)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS coach_id INTEGER;

-- 2. Add Foreign Key constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_teams_coach'
  ) THEN
    ALTER TABLE teams 
    ADD CONSTRAINT fk_teams_coach 
    FOREIGN KEY (coach_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Migrate existing data (match coach names)
UPDATE teams 
SET coach_id = (
  SELECT u.id 
  FROM users u 
  WHERE u.role IN ('coach', 'admin')
    AND (
      u.name ILIKE '%' || teams.coach || '%'
      OR teams.coach ILIKE '%' || u.name || '%'
    )
  LIMIT 1
)
WHERE teams.coach IS NOT NULL
  AND teams.coach_id IS NULL;

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_teams_coach_id ON teams(coach_id);

-- 5. Verification - Check results
SELECT 
  t.id,
  t.name as team_name,
  t.coach as old_coach_name,
  t.coach_id,
  u.name as new_coach_name,
  u.email as coach_email
FROM teams t
LEFT JOIN users u ON t.coach_id = u.id
ORDER BY t.id;

-- 6. If needed: Manual coach assignments
-- UPDATE teams SET coach_id = <user_id> WHERE name = '<team_name>';

-- Example:
-- UPDATE teams SET coach_id = 91 WHERE name = 'Sparkles';
-- UPDATE teams SET coach_id = 67 WHERE name = 'Princesses';
