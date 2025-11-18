# Database Schema Documentation

**Generated:** 2025-01-28  
**Source:** `drizzle/schema.ts`

This document provides a complete reference for the database schema used in Friday AI Chat.

## Table of Contents

1. [Overview](#overview)
2. [Schema Structure](#schema-structure)
3. [Enums](#enums)
4. [Tables](#tables)
5. [Relationships](#relationships)
6. [Indexes](#indexes)

## Overview

The database uses **PostgreSQL** with **Drizzle ORM** for type-safe database access. The schema is organized in the `friday_ai` PostgreSQL schema.

### Key Features

- **Type Safety:** Full TypeScript type inference from schema
- **Performance:** Strategic indexes on common query patterns
- **Security:** User-scoped data with proper ownership checks
- **Audit Trail:** Comprehensive audit logging for GDPR compliance

## Schema Structure

All tables are defined in the `friday_ai` schema:

```typescript
export const fridayAi = pgSchema("friday_ai");
```

## Enums

The schema defines 25 enums for type safety:

### Core Enums

- `calendar_status`: `"confirmed" | "tentative" | "cancelled"`
- `customer_invoice_status`: `"draft" | "approved" | "sent" | "paid" | "overdue" | "voided"`
- `email_pipeline_stage`: `"needs_action" | "venter_pa_svar" | "i_kalender" | "finance" | "afsluttet"`
- `invoice_status`: `"draft" | "sent" | "paid" | "overdue" | "cancelled"`
- `lead_status`: `"new" | "contacted" | "qualified" | "proposal" | "won" | "lost"`
- `message_role`: `"user" | "assistant" | "system"`
- `task_priority`: `"low" | "medium" | "high" | "urgent"`
- `task_status`: `"todo" | "in_progress" | "done" | "cancelled"`
- `theme`: `"light" | "dark"`
- `user_role`: `"user" | "admin"`

### CRM Enums

- `booking_status`: `"planned" | "in_progress" | "completed" | "cancelled"`
- `service_category`: `"general" | "vinduespolering" | "facaderens" | "tagrens" | "graffiti" | "other"`
- `deal_stage`: `"lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost"`
- `segment_type`: `"manual" | "automatic"`
- `activity_type`: `"call" | "meeting" | "email_sent" | "note" | "task_completed" | "status_change" | "property_added"`
- `customer_status`: `"new" | "active" | "inactive" | "vip" | "at_risk"`

### Subscription Enums

- `subscription_status`: `"active" | "paused" | "cancelled" | "expired"`
- `subscription_plan_type`: `"tier1" | "tier2" | "tier3" | "flex_basis" | "flex_plus"`
- `risk_level`: `"low" | "medium" | "high" | "critical"`

### Document Enums

- `document_sync_status`: Document synchronization status
- `document_conflict_resolution`: Conflict resolution strategies

### Email Intelligence Enums

- `email_category`: Email categorization
- `priority_level`: Email priority levels
- `response_suggestion_type`: AI response suggestion types
- `response_tone`: Response tone options

## Tables

The schema contains **51 tables** organized by feature area:

### Core Tables

1. **users** - User accounts
2. **user_credentials** - OAuth credentials
3. **user_settings** - User preferences
4. **user_preferences** - Additional user preferences
5. **notifications** - User notifications

### Email Tables

6. **emails** - Individual email messages
7. **email_threads** - Email thread grouping
8. **email_attachments** - Email attachments
9. **email_analysis** - AI email analysis
10. **email_categories** - Email categorization
11. **email_priorities** - Email priority scoring
12. **response_suggestions** - AI response suggestions
13. **email_pipeline_state** - Email pipeline tracking
14. **email_pipeline_transitions** - Pipeline state transitions
15. **customer_emails** - Customer-email relationships

### Calendar Tables

16. **calendar_events** - Calendar events

### CRM Tables

17. **customer_profiles** - Customer profiles (main CRM table)
18. **customer_properties** - Customer properties (ejendomme)
19. **customer_notes** - Customer notes
20. **customer_activities** - Customer activity log
21. **customer_health_scores** - Customer health scoring
22. **customer_relationships** - Customer relationship mapping
23. **customer_segments** - Customer segmentation
24. **customer_segment_members** - Segment membership
25. **customer_documents** - Customer document storage
26. **leads** - Sales leads
27. **opportunities** - Sales opportunities/deals
28. **bookings** - Service bookings
29. **service_templates** - Service templates
30. **audit_log** - GDPR audit log

### Subscription Tables

31. **subscriptions** - Active subscriptions
32. **subscription_usage** - Usage tracking
33. **subscription_history** - Subscription history

### Chat Tables

34. **conversations** - Chat conversations
35. **messages** - Chat messages

### Task Tables

36. **tasks** - User tasks

### Invoice Tables

37. **invoices** - Invoices
38. **customer_invoices** - Customer invoice tracking

### Integration Tables

39. **billy_rate_limit** - Billy.dk API rate limiting
40. **billy_api_cache** - Billy.dk API caching

### AI Tables

41. **ai_insights** - AI-generated insights
42. **emails_in_friday_ai** - Email-Friday AI integration

### Analytics Tables

43. **analytics_events** - Event tracking
44. **ab_test_metrics** - A/B test metrics

### Document Tables

45. **documents** - Document storage
46. **document_changes** - Document change history
47. **document_comments** - Document comments
48. **document_conflicts** - Document conflict resolution

### Other Tables

49. **audit_logs** - System audit logs
50. **webhooks** - Webhook configurations
51. **customers** - Legacy customer table (deprecated)

## Relationships

### Customer Profile Relationships

```
customer_profiles
  ├── customer_properties (1:N)
  ├── customer_notes (1:N)
  ├── customer_activities (1:N)
  ├── customer_health_scores (1:1)
  ├── customer_relationships (1:N)
  ├── customer_segment_members (N:M via segments)
  ├── customer_documents (1:N)
  ├── subscriptions (1:N)
  └── opportunities (1:N)
```

### Email Relationships

```
email_threads
  ├── emails (1:N)
  └── customer_emails (N:M with customer_profiles)

emails
  ├── email_attachments (1:N)
  ├── email_analysis (1:1)
  └── tasks (1:N via relatedEmailId)
```

### Lead to Customer Flow

```
leads → customer_profiles (via convertLeadToCustomer)
```

## Indexes

All tables include performance-optimized indexes:

### Common Index Patterns

1. **User-scoped queries:** `idx_{table}_user_id` on `userId`
2. **Date sorting:** Composite indexes on `userId + createdAt/updatedAt`
3. **Foreign keys:** Indexes on foreign key columns
4. **Search fields:** Indexes on email, name, etc.

### Example Index Strategy

```typescript
// Customer profiles - optimized for list queries
index("idx_customer_profiles_user_updated").using(
  "btree",
  customerProfiles.userId.asc(),
  customerProfiles.updatedAt.desc()
)

// Emails - optimized for thread lookups
index("idx_emails_thread_id").using(
  "btree",
  emails.emailThreadId.asc()
)
```

## Type Exports

All tables export TypeScript types:

```typescript
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type InsertCustomerProfile = typeof customerProfiles.$inferInsert;
```

---

For detailed table documentation, see:
- [Tables Detail](./tables.md)
- [Enums Detail](./enums.md)

