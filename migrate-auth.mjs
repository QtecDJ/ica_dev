import { neon } from "@neondatabase/serverless";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log("🚀 Running migration: add_auth_system.sql");
    
    // Create users table
    console.log("Creating users table...");
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'coach', 'member', 'parent')),
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create training_attendance table
    console.log("Creating training_attendance table...");
    await sql`
      CREATE TABLE IF NOT EXISTS training_attendance (
        id SERIAL PRIMARY KEY,
        training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
        member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('accepted', 'declined', 'pending')),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(training_id, member_id)
      )
    `;
    
    // Create comments table
    console.log("Creating comments table...");
    await sql`
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
      )
    `;
    
    // Create parent_children table
    console.log("Creating parent_children table...");
    await sql`
      CREATE TABLE IF NOT EXISTS parent_children (
        id SERIAL PRIMARY KEY,
        parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        child_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parent_user_id, child_member_id)
      )
    `;
    
    // Create indexes
    console.log("Creating indexes...");
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_training_attendance_training ON training_attendance(training_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_training_attendance_member ON training_attendance(member_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_member ON comments(member_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_training ON comments(training_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_parent_children_child ON parent_children(child_member_id)`;
    
    console.log("✅ Migration completed successfully!");
    
    // Create default admin user
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('admin@infinitycheer.com', ${hashedPassword}, 'Admin', 'admin')
      ON CONFLICT (email) DO NOTHING
    `;
    
    console.log("✅ Default admin user created!");
    console.log("   Email: admin@infinitycheer.com");
    console.log("   Password: admin123");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
