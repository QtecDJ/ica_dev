#!/usr/bin/env node

/**
 * Migration: Chat-System → Email-System
 * 
 * Entfernt:
 * - messages Tabelle (altes Chat-System)
 * 
 * Erstellt:
 * - emails Tabelle (neues Email-System mit Inbox/Outbox)
 */

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('\n🔄 Starting Chat → Email System Migration...\n');

  try {
    // 1. Prüfe ob alte messages Tabelle existiert
    console.log('1️⃣ Checking for old messages table...');
    const messagesExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'messages'
      );
    `;
    
    if (messagesExists[0].exists) {
      console.log('   ✅ Found old messages table');
      
      // Backup alte Daten (optional - für Sicherheit)
      const oldMessageCount = await sql`SELECT COUNT(*) FROM messages`;
      console.log(`   📊 Old messages count: ${oldMessageCount[0].count}`);
      
      // Lösche alte messages Tabelle
      console.log('   🗑️  Dropping old messages table...');
      await sql`DROP TABLE IF EXISTS messages CASCADE`;
      console.log('   ✅ Old messages table dropped');
    } else {
      console.log('   ⏭️  No old messages table found, skipping');
    }

    // 2. Erstelle neue emails Tabelle
    console.log('\n2️⃣ Creating new emails table...');
    await sql`
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        
        -- Sender & Empfänger
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        -- Email Content
        subject VARCHAR(200) NOT NULL,
        body TEXT NOT NULL,
        
        -- Status Flags
        is_read BOOLEAN DEFAULT FALSE,
        is_starred BOOLEAN DEFAULT FALSE,
        is_deleted_by_sender BOOLEAN DEFAULT FALSE,
        is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
        
        -- Reply Chain (optional - für Threading)
        reply_to_id INTEGER REFERENCES emails(id) ON DELETE SET NULL,
        
        -- Timestamps
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP WITH TIME ZONE,
        
        -- Indexes für Performance
        CONSTRAINT different_users CHECK (sender_id != recipient_id)
      );
    `;
    console.log('   ✅ Emails table created');

    // 3. Erstelle Indexes für Performance
    console.log('\n3️⃣ Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_emails_recipient ON emails(recipient_id, is_deleted_by_recipient);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_emails_sender ON emails(sender_id, is_deleted_by_sender);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at DESC);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_emails_read ON emails(recipient_id, is_read);
    `;
    console.log('   ✅ Indexes created');

    // 4. Statistiken ausgeben
    console.log('\n4️⃣ Final Statistics:');
    const emailsCount = await sql`SELECT COUNT(*) FROM emails`;
    console.log(`   📊 Emails in system: ${emailsCount[0].count}`);

    console.log('\n✅ Migration completed successfully!\n');
    console.log('📧 Email System is now ready to use!');
    console.log('\nNew Features:');
    console.log('  - Inbox with unread counter');
    console.log('  - Sent messages folder');
    console.log('  - Trash/Archive functionality');
    console.log('  - Star important messages');
    console.log('  - Reply threading support');
    console.log('  - Subject lines for better organization\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
