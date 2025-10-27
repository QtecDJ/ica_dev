-- Migration: Add Multi-Coach Support to Teams
-- Date: 2025-10-27
-- Description: Allow teams to have multiple coaches instead of just one

-- ============================================
-- 1. CREATE TEAM_COACHES JUNCTION TABLE
-- ============================================

-- Junction table for many-to-many relationship between teams and coaches
CREATE TABLE IF NOT EXISTS team_coaches (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'coach', -- 'head_coach', 'assistant_coach', 'coach'
  is_primary BOOLEAN DEFAULT false, -- One primary coach per team for backwards compatibility
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent duplicate assignments
  UNIQUE(team_id, coach_id)
);

-- ============================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_team_coaches_team ON team_coaches(team_id);
CREATE INDEX IF NOT EXISTS idx_team_coaches_coach ON team_coaches(coach_id);
CREATE INDEX IF NOT EXISTS idx_team_coaches_primary ON team_coaches(team_id, is_primary) WHERE is_primary = true;

-- ============================================
-- 3. MIGRATE EXISTING COACH ASSIGNMENTS
-- ============================================

-- Migrate existing coach_id assignments to team_coaches table
INSERT INTO team_coaches (team_id, coach_id, role, is_primary)
SELECT 
  t.id as team_id,
  t.coach_id as coach_id,
  'head_coach' as role,
  true as is_primary
FROM teams t
WHERE t.coach_id IS NOT NULL
ON CONFLICT (team_id, coach_id) DO NOTHING;

-- ============================================
-- 4. CREATE VIEWS FOR EASIER QUERYING
-- ============================================

-- View: Teams with all their coaches
CREATE OR REPLACE VIEW v_teams_with_coaches AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  t.level as team_level,
  t.color as team_color,
  t.active as team_active,
  t.created_at as team_created_at,
  
  -- Coach information
  tc.coach_id,
  tc.role as coach_role,
  tc.is_primary,
  u.name as coach_name,
  u.email as coach_email,
  u.active as coach_active
  
FROM teams t
LEFT JOIN team_coaches tc ON t.id = tc.team_id
LEFT JOIN users u ON tc.coach_id = u.id AND u.role IN ('coach', 'admin')
ORDER BY t.name, tc.is_primary DESC, u.name;

-- View: Primary coaches only (for backwards compatibility)
CREATE OR REPLACE VIEW v_teams_primary_coaches AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  t.level as team_level,
  t.color as team_color,
  u.id as coach_id,
  u.name as coach_name,
  u.email as coach_email
FROM teams t
LEFT JOIN team_coaches tc ON t.id = tc.team_id AND tc.is_primary = true
LEFT JOIN users u ON tc.coach_id = u.id
ORDER BY t.name;

-- View: All coaches with their teams (for coach dashboard)
CREATE OR REPLACE VIEW v_coaches_with_teams AS
SELECT 
  u.id as coach_id,
  u.name as coach_name,
  u.email as coach_email,
  
  -- Team information
  t.id as team_id,
  t.name as team_name,
  t.level as team_level,
  tc.role as coach_role,
  tc.is_primary,
  tc.assigned_at,
  
  -- Team member count
  (SELECT COUNT(*) FROM members m WHERE m.team_id = t.id AND m.active = true) as member_count
  
FROM users u
JOIN team_coaches tc ON u.id = tc.coach_id
JOIN teams t ON tc.team_id = t.id
WHERE u.role IN ('coach', 'admin') AND u.active = true
ORDER BY u.name, tc.is_primary DESC, t.name;

-- ============================================
-- 5. FUNCTIONS FOR COMMON OPERATIONS
-- ============================================

-- Function: Get all coaches for a team
CREATE OR REPLACE FUNCTION get_team_coaches(team_id_param INTEGER)
RETURNS TABLE (
  coach_id INTEGER,
  coach_name VARCHAR(255),
  coach_email VARCHAR(255),
  coach_role VARCHAR(50),
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    tc.role,
    tc.is_primary
  FROM team_coaches tc
  JOIN users u ON tc.coach_id = u.id
  WHERE tc.team_id = team_id_param
    AND u.active = true
  ORDER BY tc.is_primary DESC, u.name;
END;
$$ LANGUAGE plpgsql;

-- Function: Get all teams for a coach
CREATE OR REPLACE FUNCTION get_coach_teams(coach_id_param INTEGER)
RETURNS TABLE (
  team_id INTEGER,
  team_name VARCHAR(255),
  team_level VARCHAR(100),
  coach_role VARCHAR(50),
  is_primary BOOLEAN,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.level,
    tc.role,
    tc.is_primary,
    (SELECT COUNT(*) FROM members m WHERE m.team_id = t.id AND m.active = true)
  FROM team_coaches tc
  JOIN teams t ON tc.team_id = t.id
  WHERE tc.coach_id = coach_id_param
    AND t.active = true
  ORDER BY tc.is_primary DESC, t.name;
END;
$$ LANGUAGE plpgsql;

-- Function: Assign coach to team
CREATE OR REPLACE FUNCTION assign_coach_to_team(
  team_id_param INTEGER,
  coach_id_param INTEGER,
  role_param VARCHAR(50) DEFAULT 'coach',
  is_primary_param BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
  -- If setting as primary, unset other primary coaches
  IF is_primary_param THEN
    UPDATE team_coaches 
    SET is_primary = false 
    WHERE team_id = team_id_param AND is_primary = true;
  END IF;
  
  -- Insert or update the assignment
  INSERT INTO team_coaches (team_id, coach_id, role, is_primary)
  VALUES (team_id_param, coach_id_param, role_param, is_primary_param)
  ON CONFLICT (team_id, coach_id) 
  DO UPDATE SET 
    role = role_param,
    is_primary = is_primary_param,
    assigned_at = CURRENT_TIMESTAMP;
    
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function: Remove coach from team
CREATE OR REPLACE FUNCTION remove_coach_from_team(
  team_id_param INTEGER,
  coach_id_param INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM team_coaches 
  WHERE team_id = team_id_param AND coach_id = coach_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CONSTRAINTS AND VALIDATION
-- ============================================

-- Ensure only users with coach/admin role can be assigned to teams
ALTER TABLE team_coaches ADD CONSTRAINT chk_team_coaches_role
CHECK (
  coach_id IN (
    SELECT id FROM users WHERE role IN ('coach', 'admin')
  )
);

-- Only one primary coach per team
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_coaches_one_primary 
ON team_coaches(team_id) 
WHERE is_primary = true;

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Trigger: Update teams.coach_id for backwards compatibility
CREATE OR REPLACE FUNCTION sync_team_primary_coach()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update teams.coach_id with primary coach
    IF NEW.is_primary THEN
      UPDATE teams 
      SET coach_id = NEW.coach_id 
      WHERE id = NEW.team_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- If primary coach was deleted, clear teams.coach_id
    IF OLD.is_primary THEN
      UPDATE teams 
      SET coach_id = NULL 
      WHERE id = OLD.team_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS tr_sync_team_primary_coach ON team_coaches;
CREATE TRIGGER tr_sync_team_primary_coach
  AFTER INSERT OR UPDATE OR DELETE ON team_coaches
  FOR EACH ROW
  EXECUTE FUNCTION sync_team_primary_coach();

-- ============================================
-- 8. ADMIN CONTACT SUPPORT
-- ============================================

-- Add admin contact option for messages
-- This will be handled in the application layer, but we can create a view
CREATE OR REPLACE VIEW v_admin_contacts AS
SELECT 
  id as admin_id,
  name as admin_name,
  email as admin_email,
  'admin' as contact_type
FROM users 
WHERE role = 'admin' AND active = true
ORDER BY name;

-- ============================================
-- 9. VERIFICATION QUERIES
-- ============================================

-- Verify migration results
SELECT 
  'Teams with coaches' as description,
  COUNT(*) as count
FROM v_teams_with_coaches
WHERE coach_id IS NOT NULL

UNION ALL

SELECT 
  'Primary coach assignments' as description,
  COUNT(*) as count
FROM team_coaches
WHERE is_primary = true

UNION ALL

SELECT 
  'Total coach assignments' as description,
  COUNT(*) as count
FROM team_coaches;

-- Show teams and their coaches
SELECT 
  team_name,
  coach_name,
  coach_role,
  is_primary,
  coach_email
FROM v_teams_with_coaches
WHERE coach_id IS NOT NULL
ORDER BY team_name, is_primary DESC;

-- ============================================
-- 10. CLEANUP COMMENTS
-- ============================================

COMMENT ON TABLE team_coaches IS 'Many-to-many relationship between teams and coaches';
COMMENT ON COLUMN team_coaches.role IS 'Coach role: head_coach, assistant_coach, coach';
COMMENT ON COLUMN team_coaches.is_primary IS 'One primary coach per team for backwards compatibility';
COMMENT ON VIEW v_teams_with_coaches IS 'Teams with all their assigned coaches';
COMMENT ON VIEW v_coaches_with_teams IS 'Coaches with all their assigned teams';
COMMENT ON FUNCTION get_team_coaches(INTEGER) IS 'Get all coaches for a specific team';
COMMENT ON FUNCTION get_coach_teams(INTEGER) IS 'Get all teams for a specific coach';