import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log("🚀 Migrating users table to use username instead of email...");
    
    // Add username column
    console.log("Adding username column...");
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE
    `;
    
    // Update existing users: use name as username if no username exists
    console.log("Updating existing users...");
    await sql`
      UPDATE users 
      SET username = LOWER(REPLACE(name, ' ', '_'))
      WHERE username IS NULL
    `;
    
    // Make username NOT NULL
    await sql`
      ALTER TABLE users 
      ALTER COLUMN username SET NOT NULL
    `;
    
    // email is now optional
    await sql`
      ALTER TABLE users 
      ALTER COLUMN email DROP NOT NULL
    `;
    
    // Remove unique constraint from email
    await sql`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_email_key
    `;
    
    console.log("✅ Migration completed successfully!");
    console.log("   - Username column added");
    console.log("   - Email is now optional");
    console.log("   - Existing users updated with username");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
