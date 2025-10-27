-- Simplified Multi-Coach Migration
-- Date: 2025-10-27

-- 1. Create team_coaches junction table
CREATE TABLE IF NOT EXISTS team_coaches (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'coach',
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, coach_id)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_team_coaches_team ON team_coaches(team_id);
CREATE INDEX IF NOT EXISTS idx_team_coaches_coach ON team_coaches(coach_id);

-- 3. Migrate existing coach assignments
INSERT INTO team_coaches (team_id, coach_id, role, is_primary)
SELECT 
  t.id as team_id,
  t.coach_id as coach_id,
  'head_coach' as role,
  true as is_primary
FROM teams t
WHERE t.coach_id IS NOT NULL
ON CONFLICT (team_id, coach_id) DO NOTHING;

-- 4. Create simple view for teams with coaches
CREATE OR REPLACE VIEW v_teams_with_coaches AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  t.level as team_level,
  tc.coach_id,
  tc.role as coach_role,
  tc.is_primary,
  u.name as coach_name,
  u.email as coach_email
FROM teams t
LEFT JOIN team_coaches tc ON t.id = tc.team_id
LEFT JOIN users u ON tc.coach_id = u.id AND u.role IN ('coach', 'admin')
ORDER BY t.name, tc.is_primary DESC, u.name;