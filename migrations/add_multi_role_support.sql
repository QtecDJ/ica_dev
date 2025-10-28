-- Migration: Add multi-role support to users table
-- Date: 2025-10-28

-- Schritt 1: Füge roles JSON-Feld hinzu
ALTER TABLE users 
ADD COLUMN roles JSONB DEFAULT '[]'::jsonb;

-- Schritt 2: Befülle roles mit aktuellen single role values
UPDATE users 
SET roles = jsonb_build_array(role);

-- Schritt 3: Entferne die alte CHECK constraint vom role Feld (falls vorhanden)
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- Schritt 4: Mache role optional für Rückwärtskompatibilität
ALTER TABLE users 
ALTER COLUMN role DROP NOT NULL;

-- Schritt 5: Erstelle Index für bessere Performance bei Rollen-Queries
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN (roles);

-- Schritt 6: Funktion für primäre Rolle (erste Rolle im Array)
CREATE OR REPLACE FUNCTION get_primary_role(user_roles JSONB) 
RETURNS TEXT AS $$
BEGIN
    IF jsonb_array_length(user_roles) > 0 THEN
        RETURN user_roles->>0;
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Schritt 7: Aktualisiere role Feld basierend auf erstem Element in roles
UPDATE users 
SET role = get_primary_role(roles)
WHERE roles IS NOT NULL;