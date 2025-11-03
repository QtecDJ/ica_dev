-- Migration: Add message completion and deletion support
-- Date: 2025-01-17

-- Add completion and deletion tracking columns to messages table
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS completed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_by_recipient BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sender_deleted_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS recipient_deleted_at TIMESTAMP NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_completed ON messages(is_completed) WHERE is_completed = true;
CREATE INDEX IF NOT EXISTS idx_messages_sender_deleted ON messages(sender_id, deleted_by_sender) WHERE deleted_by_sender = false;
CREATE INDEX IF NOT EXISTS idx_messages_recipient_deleted ON messages(recipient_id, deleted_by_recipient) WHERE deleted_by_recipient = false;

-- Comments
COMMENT ON COLUMN messages.is_completed IS 'Whether the message conversation is marked as completed/resolved';
COMMENT ON COLUMN messages.completed_at IS 'When the message was marked as completed';
COMMENT ON COLUMN messages.completed_by IS 'User who marked the message as completed';
COMMENT ON COLUMN messages.deleted_by_sender IS 'Whether the sender has deleted this message';
COMMENT ON COLUMN messages.deleted_by_recipient IS 'Whether the recipient has deleted this message';
COMMENT ON COLUMN messages.sender_deleted_at IS 'When the sender deleted the message';
COMMENT ON COLUMN messages.recipient_deleted_at IS 'When the recipient deleted the message';