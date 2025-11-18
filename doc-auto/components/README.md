# Component Interfaces Documentation

**Generated:** 2025-01-28  
**Source:** `client/src/components/` and `client/src/pages/`

This document provides a complete reference for React component props and TypeScript interfaces.

## Table of Contents

1. [Overview](#overview)
2. [Component Structure](#component-structure)
3. [Core Components](#core-components)
4. [CRM Components](#crm-components)
5. [Inbox Components](#inbox-components)
6. [Shared Types](#shared-types)

## Overview

All components use **TypeScript** with strict type checking. Props are defined using interfaces, and components follow functional component patterns with hooks.

### Component Patterns

```typescript
// Standard component pattern
interface ComponentProps {
  // Props definition
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Component implementation
}
```

## Component Structure

Components are organized by feature area:

```
client/src/
├── components/
│   ├── crm/          # CRM components
│   ├── inbox/         # Email/inbox components
│   ├── docs/          # Documentation components
│   └── ui/            # shadcn/ui components
└── pages/
    ├── crm/           # CRM pages
    ├── docs/           # Documentation pages
    └── ...            # Other pages
```

## Core Components

### EmailTabV2

**Location:** `client/src/components/inbox/EmailTabV2.tsx`

Main email interface component.

```typescript
interface EmailTabV2Props {
  showAIFeatures?: boolean;
  density?: "comfortable" | "compact";
  maxResults?: number;
  useAIEnhancedList?: boolean;
}
```

### EmailSearchV2

**Location:** `client/src/components/inbox/EmailSearchV2.tsx`

Email search and filtering component.

```typescript
type FolderType = "inbox" | "sent" | "archive" | "starred";

interface EmailSearchV2Props {
  searchQuery: string;
  selectedFolder: FolderType;
  selectedLabels: string[];
  availableLabels?: string[];
  onSearchChange: (query: string) => void;
  onFolderChange: (folder: FolderType) => void;
  onLabelsChange: (labels: string[]) => void;
  isLoading?: boolean;
}
```

### EmailListV2

**Location:** `client/src/components/inbox/EmailListV2.tsx`

Email list with virtual scrolling.

```typescript
export interface EmailMessage {
  id: number;
  subject: string | null;
  fromEmail: string | null;
  snippet: string | null;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  labels?: string[];
  // ... more fields
}
```

## CRM Components

### CustomerList

**Location:** `client/src/pages/crm/CustomerList.tsx`

Customer list page component.

### CustomerDetail

**Location:** `client/src/pages/crm/CustomerDetail.tsx`

Customer detail page with tabs.

```typescript
type Tab =
  | "overview"
  | "properties"
  | "bookings"
  | "invoices"
  | "emails"
  | "notes"
  | "subscriptions"
  | "opportunities"
  | "segments"
  | "documents"
  | "audit"
  | "relationships"
  | "activities";
```

### OpportunityCard

**Location:** `client/src/components/crm/OpportunityCard.tsx`

Opportunity/deal card component.

```typescript
export interface OpportunityCardData {
  id: number;
  customerProfileId: number;
  title: string;
  stage: OpportunityStage;
  value: number | null;
  probability: number | null;
  expectedCloseDate: string | null;
  nextSteps: string | null;
}

interface OpportunityCardProps {
  opportunity: OpportunityCardData;
  onClick?: (opportunity: OpportunityCardData) => void;
}
```

### SegmentCard

**Location:** `client/src/components/crm/SegmentCard.tsx`

Customer segment card component.

```typescript
export interface SegmentData {
  id: number;
  name: string;
  type: "manual" | "automatic";
  criteria: Record<string, any>;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SegmentCardProps {
  segment: SegmentData;
  onEdit: () => void;
  onDelete: () => void;
  onViewMembers: () => void;
}
```

### DocumentCard

**Location:** `client/src/components/crm/DocumentCard.tsx`

Document card component.

```typescript
export interface DocumentData {
  id: number;
  customerProfileId: number;
  filename: string;
  mimeType: string | null;
  size: number | null;
  storageUrl: string | null;
  tags: string[] | null;
  version: number | null;
  uploadedAt: string;
}

interface DocumentCardProps {
  document: DocumentData;
  onDelete?: (id: number) => void;
  onDownload?: (document: DocumentData) => void;
}
```

### RelationshipCard

**Location:** `client/src/components/crm/RelationshipCard.tsx`

Customer relationship card component.

```typescript
export interface RelationshipData {
  id: number;
  customerProfileId: number;
  relatedCustomerId: number;
  relationshipType: string;
  notes: string | null;
  metadata: {
    relatedCustomerName: string | null;
    relatedCustomerEmail: string;
  };
}

interface RelationshipCardProps {
  relationship: RelationshipData;
  onDelete?: (id: number) => void;
}
```

### SubscriptionCard

**Location:** `client/src/components/crm/SubscriptionCard.tsx`

Subscription card component.

```typescript
interface SubscriptionCardProps {
  subscription: {
    id: number;
    planType: string;
    status: string;
    startDate: string;
    endDate: string | null;
    // ... more fields
  };
  showChurnRisk?: boolean;
}
```

### OpportunityForm

**Location:** `client/src/components/crm/OpportunityForm.tsx`

Opportunity form modal.

```typescript
interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: OpportunityCardData | null;
  customers: Array<{ id: number; name: string | null; email: string }>;
  onDelete?: (id: number) => void;
}
```

### SegmentBuilder

**Location:** `client/src/components/crm/SegmentBuilder.tsx`

Segment criteria builder.

```typescript
export interface SegmentRule {
  field: string;
  operator: string;
  value: string | number;
}

interface SegmentBuilderProps {
  rules: Record<string, any>;
  onChange: (rules: Record<string, any>) => void;
}
```

### DocumentUploader

**Location:** `client/src/components/crm/DocumentUploader.tsx`

Document upload component.

```typescript
interface DocumentUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  customerProfileId: number;
}
```

### AuditTimeline

**Location:** `client/src/components/crm/AuditTimeline.tsx`

Audit log timeline component.

```typescript
interface AuditTimelineProps {
  entityType: string;
  entityId: number;
}
```

## Inbox Components

### EmailBulkActionsV2

**Location:** `client/src/components/inbox/EmailBulkActionsV2.tsx`

Bulk email actions component.

```typescript
export type BulkAction =
  | "archive"
  | "delete"
  | "mark_read"
  | "mark_unread"
  | "star"
  | "unstar";
```

### EmailListAI

**Location:** `client/src/components/inbox/EmailListAI.tsx`

AI-enhanced email list component.

### EmailSplits

**Location:** `client/src/components/inbox/EmailSplits.tsx`

Email split view component.

```typescript
export type SplitId = "inbox" | "sent" | "archive";
```

### CreateLeadModal

**Location:** `client/src/components/inbox/CreateLeadModal.tsx`

Modal for creating leads from emails.

## Shared Types

### Enhanced Email Types

**Location:** `client/src/types/enhanced-email.ts`

```typescript
export interface EnhancedEmailMessage {
  id: number;
  subject: string | null;
  fromEmail: string | null;
  // ... enhanced fields with AI data
}
```

### Billy Invoice Types

**Location:** `shared/types.ts`

```typescript
export interface BillyInvoice {
  id: string;
  organizationId: string;
  invoiceNo: string | null;
  contactId: string;
  state: "draft" | "approved" | "sent" | "paid" | "overdue" | "voided";
  amount: number;
  tax: number;
  grossAmount: number;
  balance: number;
  currencyId: string;
  // ... more fields
}
```

---

For detailed component documentation, see:

- [Component Interfaces Detail](./interfaces.md)
