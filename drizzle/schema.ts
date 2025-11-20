import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const fridayAi = pgSchema("friday_ai");
export const calendarStatusInFridayAi = fridayAi.enum("calendar_status", [
  "confirmed",
  "tentative",
  "cancelled",
]);
export const customerInvoiceStatusInFridayAi = fridayAi.enum(
  "customer_invoice_status",
  ["draft", "approved", "sent", "paid", "overdue", "voided"]
);
export const emailPipelineStageInFridayAi = fridayAi.enum(
  "email_pipeline_stage",
  ["needs_action", "venter_pa_svar", "i_kalender", "finance", "afsluttet"]
);
export const invoiceStatusInFridayAi = fridayAi.enum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]);
export const leadStatusInFridayAi = fridayAi.enum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
]);
export const messageRoleInFridayAi = fridayAi.enum("message_role", [
  "user",
  "assistant",
  "system",
]);
export const taskPriorityInFridayAi = fridayAi.enum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);
export const taskStatusInFridayAi = fridayAi.enum("task_status", [
  "todo",
  "in_progress",
  "done",
  "cancelled",
]);
export const themeInFridayAi = fridayAi.enum("theme", ["light", "dark"]);
export const userRoleInFridayAi = fridayAi.enum("user_role", ["user", "admin"]);

// =============================================================================
// CRM: New enums for bookings and service templates
// =============================================================================
export const bookingStatusInFridayAi = fridayAi.enum("booking_status", [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const serviceCategoryInFridayAi = fridayAi.enum("service_category", [
  "general",
  "vinduespolering",
  "facaderens",
  "tagrens",
  "graffiti",
  "other",
]);

export const dealStageInFridayAi = fridayAi.enum("deal_stage", [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

export const segmentTypeInFridayAi = fridayAi.enum("segment_type", [
  "manual",
  "automatic",
]);

export const activityTypeInFridayAi = fridayAi.enum("activity_type", [
  "call",
  "meeting",
  "email_sent",
  "note",
  "task_completed",
  "status_change",
  "property_added",
]);

// =============================================================================
export const riskLevelInFridayAi = fridayAi.enum("risk_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const conversationsInFridayAi = fridayAi.table("conversations", {
  id: serial().primaryKey().notNull(),
  userId: integer().notNull(),
  title: varchar({ length: 255 }),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const messagesInFridayAi = fridayAi.table("messages", {
  id: serial().primaryKey().notNull(),
  conversationId: integer().notNull(),
  role: messageRoleInFridayAi().notNull(),
  content: text().notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const emailAttachmentsInFridayAi = fridayAi.table("email_attachments", {
  id: serial().primaryKey().notNull(),
  emailId: integer().notNull(),
  filename: varchar({ length: 255 }).notNull(),
  mimeType: varchar({ length: 100 }),
  size: integer(),
  attachmentId: varchar({ length: 255 }),
  storageUrl: text(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const calendarEventsInFridayAi = fridayAi.table(
  "calendar_events",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    googleEventId: varchar({ length: 255 }),
    calendarId: varchar({ length: 255 }),
    title: text(),
    description: text(),
    location: text(),
    startTime: timestamp({ mode: "string" }),
    endTime: timestamp({ mode: "string" }),
    isAllDay: boolean().default(false),
    status: calendarStatusInFridayAi().default("confirmed"),
    attendees: jsonb(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [unique("calendar_events_googleEventId_key").on(table.googleEventId)]
);

export const leadsInFridayAi = fridayAi.table(
  "leads",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 320 }),
    phone: varchar({ length: 50 }),
    company: varchar({ length: 255 }),
    status: leadStatusInFridayAi().default("new"),
    source: varchar({ length: 100 }),
    notes: text(),
    lastContactedAt: timestamp({ mode: "string" }),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    score: integer().default(0).notNull(),
    metadata: jsonb(),
  },
  table => [
    // ✅ PERFORMANCE: Index for user-scoped queries
    index("idx_leads_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    // ✅ PERFORMANCE: Index for email lookups
    index("idx_leads_email").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
    // ✅ PERFORMANCE: Index for status filtering
    index("idx_leads_status").using("btree", table.status.asc().nullsLast()),
    // ✅ PERFORMANCE: Composite index for common query pattern (userId + createdAt)
    index("idx_leads_user_created").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.createdAt.desc().nullsLast()
    ),
    // ✅ PERFORMANCE: Composite index for pipeline queries (userId + status + createdAt DESC)
    // Optimizes queries that filter by user and status, sorted by creation date
    // Example: SELECT * FROM leads WHERE userId = ? AND status = ? ORDER BY createdAt DESC
    // This index provides 5-10x faster queries for lead pipeline views
    index("idx_leads_user_status_created").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.status.asc().nullsLast(),
      table.createdAt.desc().nullsLast()
    ),
  ]
);

export const customerInvoicesInFridayAi = fridayAi.table(
  "customer_invoices",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    customerId: integer(),
    billyInvoiceId: varchar({ length: 100 }),
    invoiceNumber: varchar({ length: 50 }),
    amount: numeric({ precision: 10, scale: 2 }),
    paidAmount: numeric({ precision: 10, scale: 2 }).default("0"),
    grossAmount: numeric({ precision: 10, scale: 2 }),
    taxAmount: numeric({ precision: 10, scale: 2 }).default("0"),
    currency: varchar({ length: 3 }).default("DKK"),
    status: customerInvoiceStatusInFridayAi().default("draft"),
    entryDate: timestamp({ mode: "string" }),
    dueDate: timestamp({ mode: "string" }),
    paymentTermsDays: integer(),
    paidAt: timestamp({ mode: "string" }),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    // ✅ PERFORMANCE: Index for user-scoped queries
    index("idx_customer_invoices_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    // ✅ PERFORMANCE: Index for customer lookups
    index("idx_customer_invoices_customer_id").using(
      "btree",
      table.customerId.asc().nullsLast().op("int4_ops")
    ),
    // ✅ PERFORMANCE: Index for entryDate filtering (used in recent invoices queries)
    index("idx_customer_invoices_entry_date").using(
      "btree",
      table.entryDate.desc().nullsLast()
    ),
    // ✅ PERFORMANCE: Composite index for common query pattern (customerId + entryDate)
    index("idx_customer_invoices_customer_entry").using(
      "btree",
      table.customerId.asc().nullsLast().op("int4_ops"),
      table.entryDate.desc().nullsLast()
    ),
  ]
);

export const tasksInFridayAi = fridayAi.table(
  "tasks",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    status: taskStatusInFridayAi().default("todo"),
    priority: taskPriorityInFridayAi().default("medium"),
    orderIndex: integer().default(0).notNull(),
    dueDate: timestamp({ mode: "string" }),
    completedAt: timestamp({ mode: "string" }),
    relatedEmailId: integer(),
    relatedLeadId: integer(),
    relatedCustomerId: integer(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    // ✅ PERFORMANCE: Index for user-scoped queries
    index("idx_tasks_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    // ✅ PERFORMANCE: Composite index for user + status (common query pattern)
    index("idx_tasks_user_status").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.status.asc().nullsLast()
    ),
    // ✅ PERFORMANCE: Index for orderIndex (used in task ordering)
    index("idx_tasks_order_index").using(
      "btree",
      table.orderIndex.asc().nullsLast().op("int4_ops")
    ),
  ]
);

export const emailsInFridayAi = fridayAi.table(
  "emails",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    gmailId: varchar({ length: 255 }),
    threadId: varchar({ length: 255 }),
    subject: text(),
    fromEmail: varchar("from_email", { length: 320 }),
    toEmail: text("to_email"),
    cc: text(),
    bcc: text(),
    body: text(),
    snippet: text(),
    isRead: boolean().default(false),
    isStarred: boolean().default(false),
    labels: text(),
    hasAttachments: boolean().default(false),
    receivedAt: timestamp({ mode: "string" }).notNull(),
    sentAt: timestamp({ mode: "string" }),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    providerId: varchar({ length: 255 }).notNull(),
    threadKey: varchar({ length: 255 }),
    customerId: integer(),
    emailThreadId: integer(),
    text: text(),
    html: text(),
    // AI-generated fields
    aiSummary: text("ai_summary"),
    aiSummaryGeneratedAt: timestamp("ai_summary_generated_at", {
      mode: "string",
    }),
    aiLabelSuggestions: jsonb("ai_label_suggestions"),
    aiLabelsGeneratedAt: timestamp("ai_labels_generated_at", {
      mode: "string",
    }),
  },
  table => [
    unique("emails_gmailId_key").on(table.gmailId),
    unique("emails_providerid_unique").on(table.providerId),
    // ✅ PERFORMANCE: Index for user-scoped queries (most common query pattern)
    index("idx_emails_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    // ✅ PERFORMANCE: Composite index for user + receivedAt (used in list queries)
    index("idx_emails_user_received").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.receivedAt.desc().nullsLast()
    ),
    // ✅ PERFORMANCE: Index for emailThreadId (used in thread lookups)
    index("idx_emails_thread_id").using(
      "btree",
      table.emailThreadId.asc().nullsLast().op("int4_ops")
    ),
    // ✅ PERFORMANCE: Index for threadId (Gmail thread ID lookups)
    index("idx_emails_thread_key").using(
      "btree",
      table.threadId.asc().nullsLast().op("text_ops")
    ),
    // ✅ PERFORMANCE: Index for customerId (used in customer email lookups)
    index("idx_emails_customer_id").using(
      "btree",
      table.customerId.asc().nullsLast().op("int4_ops")
    ),
  ]
);

export const invoicesInFridayAi = fridayAi.table(
  "invoices",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    invoiceNumber: varchar({ length: 50 }),
    customerName: varchar({ length: 255 }),
    customerEmail: varchar({ length: 320 }),
    amount: numeric({ precision: 10, scale: 2 }),
    currency: varchar({ length: 3 }).default("DKK"),
    status: invoiceStatusInFridayAi().default("draft"),
    dueDate: timestamp({ mode: "string" }),
    paidAt: timestamp({ mode: "string" }),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [unique("invoices_invoiceNumber_key").on(table.invoiceNumber)]
);

export const userCredentialsInFridayAi = fridayAi.table(
  "user_credentials",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    provider: varchar({ length: 50 }).notNull(),
    accessToken: text(),
    refreshToken: text(),
    expiresAt: timestamp({ mode: "string" }),
    scope: text(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    unique("user_credentials_userId_provider_key").on(
      table.userId,
      table.provider
    ),
  ]
);

export const billyRateLimitInFridayAi = fridayAi.table(
  "billy_rate_limit",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    requestCount: integer().default(0),
    resetAt: timestamp({ mode: "string" }).notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [unique("billy_rate_limit_userId_key").on(table.userId)]
);

export const billyApiCacheInFridayAi = fridayAi.table(
  "billy_api_cache",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    endpoint: varchar({ length: 255 }).notNull(),
    cacheKey: varchar({ length: 255 }).notNull(),
    data: jsonb().notNull(),
    expiresAt: timestamp({ mode: "string" }).notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    unique("billy_api_cache_userId_cacheKey_key").on(
      table.userId,
      table.cacheKey
    ),
  ]
);

export const aiInsightsInFridayAi = fridayAi.table("ai_insights", {
  id: serial().primaryKey().notNull(),
  userId: integer().notNull(),
  type: varchar({ length: 50 }).notNull(),
  relatedEntityType: varchar({ length: 50 }),
  relatedEntityId: integer(),
  insight: text().notNull(),
  confidence: numeric({ precision: 3, scale: 2 }),
  metadata: jsonb(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const emailAnalysisInFridayAi = fridayAi.table(
  "email_analysis",
  {
    id: serial().primaryKey().notNull(),
    emailId: integer().notNull(),
    sentiment: varchar({ length: 20 }),
    sentimentScore: numeric({ precision: 3, scale: 2 }),
    category: varchar({ length: 50 }),
    keyTopics: text(),
    suggestedActions: jsonb(),
    analyzedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [unique("email_analysis_emailId_key").on(table.emailId)]
);

export const auditLogsInFridayAi = fridayAi.table("audit_logs", {
  id: serial().primaryKey().notNull(),
  userId: integer(),
  action: varchar({ length: 100 }).notNull(),
  entityType: varchar({ length: 50 }),
  entityId: integer(),
  details: jsonb(),
  ipAddress: varchar({ length: 45 }),
  userAgent: text(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const notificationsInFridayAi = fridayAi.table("notifications", {
  id: serial().primaryKey().notNull(),
  userId: integer().notNull(),
  type: varchar({ length: 50 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  message: text(),
  isRead: boolean().default(false),
  actionUrl: text(),
  metadata: jsonb(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const userSettingsInFridayAi = fridayAi.table(
  "user_settings",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    theme: themeInFridayAi().default("light"),
    language: varchar({ length: 10 }).default("da"),
    emailNotifications: boolean().default(true),
    desktopNotifications: boolean().default(true),
    settings: jsonb(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [unique("user_settings_userId_key").on(table.userId)]
);

export const webhooksInFridayAi = fridayAi.table("webhooks", {
  id: serial().primaryKey().notNull(),
  userId: integer().notNull(),
  provider: varchar({ length: 50 }).notNull(),
  eventType: varchar({ length: 100 }).notNull(),
  payload: jsonb().notNull(),
  processedAt: timestamp({ mode: "string" }),
  error: text(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const usersInFridayAi = fridayAi.table(
  "users",
  {
    id: serial().primaryKey().notNull(),
    openId: varchar({ length: 64 }).notNull(),
    name: text(),
    email: varchar({ length: 320 }),
    loginMethod: varchar({ length: 64 }),
    role: userRoleInFridayAi().default("user").notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    lastSignedIn: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [unique("users_openId_key").on(table.openId)]
);

export const customersInFridayAi = fridayAi.table("customers", {
  id: serial().primaryKey().notNull(),
  userId: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 320 }),
  phone: varchar({ length: 50 }),
  company: varchar({ length: 255 }),
  address: text(),
  billyCustomerId: varchar({ length: 100 }),
  metadata: jsonb(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

// =============================================================================
// CRM: Customer Properties (Ejendomme)
// =============================================================================
export const customerPropertiesInFridayAi = fridayAi.table(
  "customer_properties",
  {
    id: serial().primaryKey().notNull(),
    customerProfileId: integer().notNull(),
    address: text().notNull(),
    city: varchar({ length: 120 }),
    postalCode: varchar({ length: 20 }),
    coordinates: jsonb(),
    isPrimary: boolean().default(false).notNull(),
    attributes: jsonb(), // arbitrary property metadata (type, size, access, etc.)
    notes: text(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_customer_properties_profile").using(
      "btree",
      table.customerProfileId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_customer_properties_postal").using(
      "btree",
      table.postalCode.asc().nullsLast().op("text_ops")
    ),
  ]
);

// =============================================================================
// CRM: Service Templates
// =============================================================================
export const serviceTemplatesInFridayAi = fridayAi.table(
  "service_templates",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    category: serviceCategoryInFridayAi().default("general").notNull(),
    durationMinutes: integer().default(60).notNull(),
    priceDkk: integer().default(0).notNull(),
    isActive: boolean().default(true).notNull(),
    metadata: jsonb(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_service_templates_user").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_service_templates_category").using(
      "btree",
      table.category.asc().nullsLast()
    ),
  ]
);

// =============================================================================
// CRM: Bookings
// =============================================================================
export const bookingsInFridayAi = fridayAi.table(
  "bookings",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    customerProfileId: integer().notNull(),
    propertyId: integer(), // optional: target property for service
    serviceTemplateId: integer(),
    title: varchar({ length: 255 }),
    notes: text(),
    scheduledStart: timestamp({ mode: "string" }).notNull(),
    scheduledEnd: timestamp({ mode: "string" }),
    status: bookingStatusInFridayAi().default("planned").notNull(),
    assigneeUserId: integer(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    metadata: jsonb(),
  },
  table => [
    index("idx_bookings_user").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_bookings_customer").using(
      "btree",
      table.customerProfileId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_bookings_start").using(
      "btree",
      table.scheduledStart.asc().nullsLast()
    ),
    index("idx_bookings_status").using("btree", table.status.asc().nullsLast()),
  ]
);

export const emailThreadsInFridayAi = fridayAi.table(
  "email_threads",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    gmailThreadId: varchar({ length: 255 }).notNull(),
    subject: text(),
    participants: jsonb(),
    snippet: text(),
    labels: jsonb(),
    lastMessageAt: timestamp({ mode: "string" }),
    isRead: boolean().default(false).notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [unique("email_threads_gmailThreadId_key").on(table.gmailThreadId)]
);

export const customerEmailsInFridayAi = fridayAi.table(
  "customer_emails",
  {
    id: serial().primaryKey().notNull(),
    customerId: integer().notNull(),
    gmailThreadId: varchar({ length: 255 }).notNull(),
    subject: varchar({ length: 500 }),
    snippet: text(),
    lastMessageDate: timestamp({ mode: "string" }),
    isRead: boolean().default(false).notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_customer_emails_customer_id").using(
      "btree",
      table.customerId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_customer_emails_thread_id").using(
      "btree",
      table.gmailThreadId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const customerConversationsInFridayAi = fridayAi.table(
  "customer_conversations",
  {
    id: serial().primaryKey().notNull(),
    customerId: integer().notNull(),
    conversationId: integer().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    uniqueIndex("idx_customer_conversations_customer").using(
      "btree",
      table.customerId.asc().nullsLast().op("int4_ops")
    ),
  ]
);

export const customerStatusInFridayAi = fridayAi.enum("customer_status", [
  "new",
  "active",
  "inactive",
  "vip",
  "at_risk",
]);

export const customerProfilesInFridayAi = fridayAi.table(
  "customer_profiles",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    leadId: integer(),
    billyCustomerId: varchar({ length: 255 }),
    billyOrganizationId: varchar({ length: 255 }),
    email: varchar({ length: 320 }).notNull(),
    name: varchar({ length: 255 }),
    phone: varchar({ length: 32 }),
    status: customerStatusInFridayAi().default("new").notNull(),
    tags: text().array().default([]).notNull(),
    customerType: varchar({ length: 20 }).default("private").notNull(),
    totalInvoiced: integer().default(0).notNull(),
    totalPaid: integer().default(0).notNull(),
    balance: integer().default(0).notNull(),
    invoiceCount: integer().default(0).notNull(),
    emailCount: integer().default(0).notNull(),
    aiResume: text(),
    lastContactDate: timestamp({ mode: "string" }),
    lastSyncDate: timestamp({ mode: "string" }),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_customer_profiles_email").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
    index("idx_customer_profiles_lead_id").using(
      "btree",
      table.leadId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_customer_profiles_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
  ]
);

export const customerNotesInFridayAi = fridayAi.table(
  "customer_notes",
  {
    id: serial().primaryKey().notNull(),
    customerId: integer().notNull(),
    userId: integer().notNull(),
    note: text().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_customer_notes_customer").using(
      "btree",
      table.customerId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_customer_notes_user").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
  ]
);

// =============================================================================
// CRM: Customer Activities - Track all customer interactions
// =============================================================================
export const customerActivitiesInFridayAi = fridayAi.table(
  "customer_activities",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    customerProfileId: integer().notNull(),
    activityType: activityTypeInFridayAi().notNull(),
    subject: varchar({ length: 255 }).notNull(),
    description: text(),
    durationMinutes: integer(),
    outcome: varchar({ length: 255 }),
    nextSteps: text(),
    relatedEmailId: integer(),
    relatedTaskId: integer(),
    relatedBookingId: integer(),
    metadata: jsonb(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_customer_activities_customer").using(
      "btree",
      table.customerProfileId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_customer_activities_user").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_customer_activities_type").using(
      "btree",
      table.activityType.asc().nullsLast()
    ),
  ]
);

// =============================================================================
// CRM: Customer Health Scores - Track customer engagement and risk
// =============================================================================
export const customerHealthScoresInFridayAi = fridayAi.table(
  "customer_health_scores",
  {
    id: serial().primaryKey().notNull(),
    customerProfileId: integer().notNull().unique(),
    score: integer().notNull(), // 0-100
    riskLevel: riskLevelInFridayAi().notNull(),
    churnProbability: integer(), // 0-100 percentage
    factors: jsonb().notNull(), // { email_engagement: 80, payment_speed: 90, booking_frequency: 60 }
    lastCalculatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_health_scores_customer").using(
      "btree",
      table.customerProfileId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_health_scores_risk").using(
      "btree",
      table.riskLevel.asc().nullsLast()
    ),
  ]
);

// =============================================================================
// CRM: Opportunities/Deals - Sales pipeline management
// =============================================================================
export const opportunitiesInFridayAi = fridayAi.table(
  "opportunities",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    customerProfileId: integer().notNull(),
    title: text().notNull(),
    description: text(),
    stage: dealStageInFridayAi().notNull().default("lead"),
    value: integer(), // Expected revenue in DKK
    probability: integer(), // Win probability 0-100
    expectedCloseDate: timestamp({ mode: "string" }),
    actualCloseDate: timestamp({ mode: "string" }),
    wonReason: text(),
    lostReason: text(),
    nextSteps: text(),
    metadata: jsonb(), // Custom fields, tags, etc.
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_opportunities_customer").using(
      "btree",
      table.customerProfileId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_opportunities_stage").using(
      "btree",
      table.stage.asc().nullsLast()
    ),
    index("idx_opportunities_user").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
  ]
);

// =============================================================================
// CRM: Customer Segments - Smart lists and segmentation
// =============================================================================
export const customerSegmentsInFridayAi = fridayAi.table(
  "customer_segments",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    name: text().notNull(),
    description: text(),
    type: segmentTypeInFridayAi().notNull().default("manual"),
    rules: jsonb(), // For automatic segments: { healthScore: { lt: 50 }, revenue: { gte: 10000 } }
    color: text(), // UI color for visual distinction
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_segments_user").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
  ]
);

export const customerSegmentMembersInFridayAi = fridayAi.table(
  "customer_segment_members",
  {
    id: serial().primaryKey().notNull(),
    segmentId: integer().notNull(),
    customerProfileId: integer().notNull(),
    addedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_segment_members_segment").using(
      "btree",
      table.segmentId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_segment_members_customer").using(
      "btree",
      table.customerProfileId.asc().nullsLast().op("int4_ops")
    ),
  ]
);

// =============================================================================
// CRM: Customer Documents - File management
// =============================================================================
export const customerDocumentsInFridayAi = fridayAi.table(
  "customer_documents",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    customerProfileId: integer().notNull(),
    filename: text().notNull(),
    filesize: integer(), // bytes
    mimeType: text(),
    storageUrl: text().notNull(), // Supabase Storage URL
    category: text(), // contract, invoice, photo, other
    description: text(),
    tags: jsonb(), // Array of tags for search
    version: integer().default(1),
    uploadedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_documents_customer").using(
      "btree",
      table.customerProfileId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_documents_user").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
  ]
);

// =============================================================================
// CRM: Audit Log - GDPR compliance and change tracking
// =============================================================================
export const auditLogInFridayAi = fridayAi.table(
  "audit_log",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    entityType: text().notNull(), // customer, opportunity, document, etc.
    entityId: integer().notNull(),
    action: text().notNull(), // created, updated, deleted, exported, consent_given, consent_revoked
    changes: jsonb(), // { field: { old: "value1", new: "value2" } }
    ipAddress: text(),
    userAgent: text(),
    timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_audit_log_entity").using(
      "btree",
      table.entityType.asc().nullsLast().op("text_ops"),
      table.entityId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_audit_log_user").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_audit_log_timestamp").using(
      "btree",
      table.timestamp.desc().nullsLast()
    ),
  ]
);

// =============================================================================
// CRM: Customer Relationships - Network mapping
// =============================================================================
export const customerRelationshipsInFridayAi = fridayAi.table(
  "customer_relationships",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    customerProfileId: integer().notNull(), // Main customer
    relatedCustomerProfileId: integer().notNull(), // Related customer
    relationshipType: text().notNull(), // parent_company, subsidiary, referrer, referred_by, partner, competitor
    description: text(),
    strength: integer(), // 1-10 relationship strength
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_relationships_customer").using(
      "btree",
      table.customerProfileId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_relationships_related").using(
      "btree",
      table.relatedCustomerProfileId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_relationships_type").using(
      "btree",
      table.relationshipType.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const emailPipelineStateInFridayAi = fridayAi.table(
  "email_pipeline_state",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    threadId: varchar({ length: 255 }).notNull(),
    stage: emailPipelineStageInFridayAi().notNull(),
    transitionedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    unique("email_pipeline_state_threadId_userId_key").on(
      table.threadId,
      table.userId
    ),
    index("idx_pipeline_state_stage_user").using(
      "btree",
      table.stage.asc().nullsLast(),
      table.userId.asc().nullsLast()
    ),
  ]
);

export const emailPipelineTransitionsInFridayAi = fridayAi.table(
  "email_pipeline_transitions",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    threadId: varchar({ length: 255 }).notNull(),
    fromStage: emailPipelineStageInFridayAi(),
    toStage: emailPipelineStageInFridayAi().notNull(),
    transitionedBy: varchar({ length: 255 }),
    reason: text(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_pipeline_transitions_thread_user").using(
      "btree",
      table.threadId.asc().nullsLast().op("text_ops"),
      table.userId.asc().nullsLast().op("int4_ops")
    ),
  ]
);

export const analyticsEventsInFridayAi = fridayAi.table(
  "analytics_events",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    eventType: varchar({ length: 100 }).notNull(),
    eventData: jsonb(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_analytics_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_analytics_event_type").using(
      "btree",
      table.eventType.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const userPreferencesInFridayAi = fridayAi.table(
  "user_preferences",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    theme: themeInFridayAi().default("dark").notNull(),
    emailNotifications: boolean().default(true).notNull(),
    desktopNotifications: boolean().default(true).notNull(),
    preferences: jsonb(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [unique("user_preferences_userId_key").on(table.userId)]
);

// Backward compatibility aliases for db.ts imports
export const emailPipelineState = emailPipelineStateInFridayAi;
export const emailPipelineTransitions = emailPipelineTransitionsInFridayAi;
export const analyticsEvents = analyticsEventsInFridayAi;
export const userPreferences = userPreferencesInFridayAi;
export const emailThreads = emailThreadsInFridayAi;
export const users = usersInFridayAi;
export const conversations = conversationsInFridayAi;
export const messages = messagesInFridayAi;
export const calendarEvents = calendarEventsInFridayAi;
export const leads = leadsInFridayAi;
export const invoices = invoicesInFridayAi;
export const tasks = tasksInFridayAi;
export const emails = emailsInFridayAi;
export const customerConversations = customerConversationsInFridayAi;
export const customerEmails = customerEmailsInFridayAi;
export const customerInvoices = customerInvoicesInFridayAi;
export const customerProfiles = customerProfilesInFridayAi;
export const emailAttachments = emailAttachmentsInFridayAi;
export const attachments = emailAttachmentsInFridayAi; // Alias for backward compatibility
export const userCredentials = userCredentialsInFridayAi;
export const billyRateLimit = billyRateLimitInFridayAi;
export const billyApiCache = billyApiCacheInFridayAi;
export const aiInsights = aiInsightsInFridayAi;
export const emailAnalysis = emailAnalysisInFridayAi;
export const auditLogs = auditLogsInFridayAi;
export const notifications = notificationsInFridayAi;
export const userSettings = userSettingsInFridayAi;
export const webhooks = webhooksInFridayAi;
export const customers = customersInFridayAi;
export const customerProperties = customerPropertiesInFridayAi;
export const serviceTemplates = serviceTemplatesInFridayAi;
export const bookings = bookingsInFridayAi;
export const customerActivities = customerActivitiesInFridayAi;
export const customerHealthScores = customerHealthScoresInFridayAi;
export const customerNotes = customerNotesInFridayAi;
export const opportunities = opportunitiesInFridayAi;
export const customerSegments = customerSegmentsInFridayAi;
export const customerSegmentMembers = customerSegmentMembersInFridayAi;
export const customerDocuments = customerDocumentsInFridayAi;
export const auditLog = auditLogInFridayAi;
export const customerRelationships = customerRelationshipsInFridayAi;

// =============================================================================
// TYPE ALIASES
// =============================================================================
export type EmailPipelineState =
  typeof emailPipelineStateInFridayAi.$inferSelect;
export type InsertEmailPipelineState =
  typeof emailPipelineStateInFridayAi.$inferInsert;
export type EmailPipelineTransition =
  typeof emailPipelineTransitionsInFridayAi.$inferSelect;
export type InsertEmailPipelineTransition =
  typeof emailPipelineTransitionsInFridayAi.$inferInsert;
export type AnalyticsEvent = typeof analyticsEventsInFridayAi.$inferSelect;
export type InsertAnalyticsEvent =
  typeof analyticsEventsInFridayAi.$inferInsert;
export type UserPreferences = typeof userPreferencesInFridayAi.$inferSelect;
export type InsertUserPreferences =
  typeof userPreferencesInFridayAi.$inferInsert;
export type EmailThread = typeof emailThreadsInFridayAi.$inferSelect;
export type InsertEmailThread = typeof emailThreadsInFridayAi.$inferInsert;
export type User = typeof usersInFridayAi.$inferSelect;
export type InsertUser = typeof usersInFridayAi.$inferInsert;
export type Conversation = typeof conversationsInFridayAi.$inferSelect;
export type InsertConversation = typeof conversationsInFridayAi.$inferInsert;
export type Message = typeof messagesInFridayAi.$inferSelect;
export type InsertMessage = typeof messagesInFridayAi.$inferInsert;
export type CalendarEvent = typeof calendarEventsInFridayAi.$inferSelect;
export type InsertCalendarEvent = typeof calendarEventsInFridayAi.$inferInsert;
export type Lead = typeof leadsInFridayAi.$inferSelect;
export type InsertLead = typeof leadsInFridayAi.$inferInsert;
export type Invoice = typeof invoicesInFridayAi.$inferSelect;
export type InsertInvoice = typeof invoicesInFridayAi.$inferInsert;
export type Task = typeof tasksInFridayAi.$inferSelect;
export type InsertTask = typeof tasksInFridayAi.$inferInsert;
export type CustomerConversation =
  typeof customerConversationsInFridayAi.$inferSelect;
export type InsertCustomerConversation =
  typeof customerConversationsInFridayAi.$inferInsert;
export type CustomerEmail = typeof customerEmailsInFridayAi.$inferSelect;
export type InsertCustomerEmail = typeof customerEmailsInFridayAi.$inferInsert;
export type CustomerInvoice = typeof customerInvoicesInFridayAi.$inferSelect;
export type InsertCustomerInvoice =
  typeof customerInvoicesInFridayAi.$inferInsert;
export type CustomerProfile = typeof customerProfilesInFridayAi.$inferSelect;
export type InsertCustomerProfile =
  typeof customerProfilesInFridayAi.$inferInsert;
export type CustomerNote = typeof customerNotesInFridayAi.$inferSelect;
export type InsertCustomerNote = typeof customerNotesInFridayAi.$inferInsert;
export type CustomerProperty = typeof customerPropertiesInFridayAi.$inferSelect;
export type InsertCustomerProperty =
  typeof customerPropertiesInFridayAi.$inferInsert;
export type ServiceTemplate = typeof serviceTemplatesInFridayAi.$inferSelect;
export type InsertServiceTemplate =
  typeof serviceTemplatesInFridayAi.$inferInsert;
export type Booking = typeof bookingsInFridayAi.$inferSelect;
export type InsertBooking = typeof bookingsInFridayAi.$inferInsert;
export type CustomerActivity = typeof customerActivitiesInFridayAi.$inferSelect;
export type InsertCustomerActivity =
  typeof customerActivitiesInFridayAi.$inferInsert;
export type CustomerHealthScore =
  typeof customerHealthScoresInFridayAi.$inferSelect;
export type InsertCustomerHealthScore =
  typeof customerHealthScoresInFridayAi.$inferInsert;

// Email Intelligence Enums
export const emailCategoryInFridayAi = fridayAi.enum("email_category", [
  "work",
  "personal",
  "finance",
  "marketing",
  "important",
  "other",
]);

export const priorityLevelInFridayAi = fridayAi.enum("priority_level", [
  "urgent",
  "high",
  "normal",
  "low",
]);

export const responseSuggestionTypeInFridayAi = fridayAi.enum(
  "response_suggestion_type",
  ["quick_reply", "detailed", "forward", "schedule"]
);

export const responseToneInFridayAi = fridayAi.enum("response_tone", [
  "professional",
  "friendly",
  "formal",
]);

// Email Intelligence Tables
export const emailCategoriesInFridayAi = fridayAi.table("email_categories", {
  id: serial().primaryKey().notNull(),
  threadId: varchar({ length: 255 }).notNull(),
  category: emailCategoryInFridayAi().notNull(),
  subcategory: varchar({ length: 100 }),
  confidence: numeric({ precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  reasoning: text(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const emailPrioritiesInFridayAi = fridayAi.table("email_priorities", {
  id: serial().primaryKey().notNull(),
  threadId: varchar({ length: 255 }).notNull(),
  priorityScore: integer().notNull(), // 0-100
  priorityLevel: priorityLevelInFridayAi().notNull(),
  senderImportance: numeric({ precision: 3, scale: 2 }), // 0.00 to 1.00
  contentUrgency: numeric({ precision: 3, scale: 2 }), // 0.00 to 1.00
  deadlineMentioned: boolean().default(false),
  requiresAction: boolean().default(false),
  timeSensitive: boolean().default(false),
  reasoning: text(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const responseSuggestionsInFridayAi = fridayAi.table(
  "response_suggestions",
  {
    id: serial().primaryKey().notNull(),
    threadId: varchar({ length: 255 }).notNull(),
    suggestionText: text().notNull(),
    suggestionType: responseSuggestionTypeInFridayAi().notNull(),
    tone: responseToneInFridayAi().notNull(),
    confidence: numeric({ precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
    reasoning: text(),
    used: boolean().default(false),
    usedAt: timestamp({ mode: "string" }),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  }
);

// Email Intelligence Types
export type EmailCategory = typeof emailCategoriesInFridayAi.$inferSelect;
export type InsertEmailCategory = typeof emailCategoriesInFridayAi.$inferInsert;
export type EmailPriority = typeof emailPrioritiesInFridayAi.$inferSelect;
export type InsertEmailPriority = typeof emailPrioritiesInFridayAi.$inferInsert;
export type ResponseSuggestion =
  typeof responseSuggestionsInFridayAi.$inferSelect;
export type InsertResponseSuggestion =
  typeof responseSuggestionsInFridayAi.$inferInsert;

// CRM Phase 2-6 Types
export type Opportunity = typeof opportunitiesInFridayAi.$inferSelect;
export type InsertOpportunity = typeof opportunitiesInFridayAi.$inferInsert;
export type CustomerSegment = typeof customerSegmentsInFridayAi.$inferSelect;
export type InsertCustomerSegment =
  typeof customerSegmentsInFridayAi.$inferInsert;
export type CustomerSegmentMember =
  typeof customerSegmentMembersInFridayAi.$inferSelect;
export type InsertCustomerSegmentMember =
  typeof customerSegmentMembersInFridayAi.$inferInsert;
export type CustomerDocument = typeof customerDocumentsInFridayAi.$inferSelect;
export type InsertCustomerDocument =
  typeof customerDocumentsInFridayAi.$inferInsert;
export type AuditLog = typeof auditLogInFridayAi.$inferSelect;
export type InsertAuditLog = typeof auditLogInFridayAi.$inferInsert;
export type CustomerRelationship =
  typeof customerRelationshipsInFridayAi.$inferSelect;
export type InsertCustomerRelationship =
  typeof customerRelationshipsInFridayAi.$inferInsert;
