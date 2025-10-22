-- Migration: Add users table and training attendance
-- Date: 2025-10-22

-- Users table for authentication and role-based access
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'coach', 'member', 'parent')),
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training attendance table for tracking responses
CREATE TABLE IF NOT EXISTS training_attendance (
  id SERIAL PRIMARY KEY,
  training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('accepted', 'declined', 'pending')),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(training_id, member_id)
);

-- Coach comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  training_id INTEGER REFERENCES trainings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (member_id IS NOT NULL OR training_id IS NOT NULL)
);

-- Parent-child relationships
CREATE TABLE IF NOT EXISTS parent_children (
  id SERIAL PRIMARY KEY,
  parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_user_id, child_member_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_training ON training_attendance(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_member ON training_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_member ON comments(member_id);
CREATE INDEX IF NOT EXISTS idx_comments_training ON comments(training_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child ON parent_children(child_member_id);
