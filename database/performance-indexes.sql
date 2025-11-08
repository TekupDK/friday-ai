-- Performance Indexes for Friday AI Chat System
-- Optimizes message loading and pagination

-- Primary index for message pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON friday_ai.messages (conversation_id, created_at DESC);

-- Secondary index for cursor-based pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id 
ON friday_ai.messages (conversation_id);

-- Index for message counting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_count 
ON friday_ai.messages (conversation_id);

-- Composite index for conversation lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_created 
ON friday_ai.conversations (user_id, created_at DESC);

-- Index for conversation message count optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_message_count 
ON friday_ai.conversations (id, last_message_at DESC);

-- Analyze tables for query planner optimization
ANALYZE friday_ai.messages;
ANALYZE friday_ai.conversations;
