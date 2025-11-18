-- Performance Indexes for Friday AI Chat System
-- Optimizes message loading and pagination
-- ✅ UPDATED: Added indexes for CRM tables and frequently queried tables

-- =============================================================================
-- CHAT SYSTEM INDEXES
-- =============================================================================

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

-- =============================================================================
-- CRM SYSTEM INDEXES (Added January 28, 2025)
-- =============================================================================

-- Leads indexes (already defined in schema.ts, but listed here for reference)
-- idx_leads_user_id, idx_leads_email, idx_leads_status, idx_leads_user_created

-- Customer Invoices indexes
-- idx_customer_invoices_user_id, idx_customer_invoices_customer_id
-- idx_customer_invoices_entry_date, idx_customer_invoices_customer_entry

-- Emails indexes
-- idx_emails_user_id, idx_emails_user_received, idx_emails_thread_id
-- idx_emails_thread_key, idx_emails_customer_id

-- Tasks indexes
-- idx_tasks_user_id, idx_tasks_user_status, idx_tasks_order_index

-- Note: Indexes are defined in drizzle/schema.ts and will be created via migrations
-- This file is kept for reference and manual index creation if needed

-- Analyze tables for query planner optimization
ANALYZE friday_ai.messages;
ANALYZE friday_ai.conversations;
ANALYZE friday_ai.leads;
ANALYZE friday_ai.customer_invoices;
ANALYZE friday_ai.emails;
ANALYZE friday_ai.tasks;
ANALYZE friday_ai.customer_profiles;
ANALYZE friday_ai.bookings;
ANALYZE friday_ai.customer_activities;
