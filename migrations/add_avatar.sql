-- Add avatar_url column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create a public directory structure for avatars
-- Avatars will be stored in /public/avatars/
