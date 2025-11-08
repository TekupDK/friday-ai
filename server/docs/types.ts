/**
 * Documentation System Types
 * Shared types for the real-time documentation system
 */

import { z } from 'zod';

// ============================================================================
// Core Document Types
// ============================================================================

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  path: z.string(),
  title: z.string().min(1).max(255),
  content: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  author: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  git_hash: z.string().optional(),
  version: z.number().int().positive(),
});

export type Document = z.infer<typeof DocumentSchema>;

export const CreateDocumentSchema = DocumentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  version: true,
});

export type CreateDocument = z.infer<typeof CreateDocumentSchema>;

export const UpdateDocumentSchema = DocumentSchema.partial().required({ id: true });

export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;

// ============================================================================
// Document Change Tracking
// ============================================================================

export const DocumentChangeSchema = z.object({
  id: z.string().uuid(),
  document_id: z.string().uuid(),
  user_id: z.string(),
  operation: z.enum(['create', 'update', 'delete']),
  diff: z.string(),
  git_hash: z.string().optional(),
  timestamp: z.date(),
});

export type DocumentChange = z.infer<typeof DocumentChangeSchema>;

// ============================================================================
// Comments & Annotations
// ============================================================================

export const CommentSchema = z.object({
  id: z.string().uuid(),
  document_id: z.string().uuid(),
  user_id: z.string(),
  content: z.string().min(1),
  line_number: z.number().int().positive().optional(),
  resolved: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

export type Comment = z.infer<typeof CommentSchema>;

export const CreateCommentSchema = CommentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateComment = z.infer<typeof CreateCommentSchema>;

// ============================================================================
// Real-time Collaboration
// ============================================================================

export const PresenceSchema = z.object({
  user_id: z.string(),
  document_id: z.string().uuid(),
  cursor_position: z.number().int().nonnegative().optional(),
  last_seen: z.date(),
});

export type Presence = z.infer<typeof PresenceSchema>;

// ============================================================================
// Git Sync Types
// ============================================================================

export const SyncStatusSchema = z.object({
  status: z.enum(['idle', 'syncing', 'conflict', 'error']),
  last_sync: z.date().optional(),
  pending_changes: z.number().int().nonnegative(),
  conflicts: z.array(z.string()),
  error: z.string().optional(),
});

export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const ConflictSchema = z.object({
  document_id: z.string().uuid(),
  path: z.string(),
  local_content: z.string(),
  remote_content: z.string(),
  base_content: z.string().optional(),
  conflict_markers: z.string(),
});

export type Conflict = z.infer<typeof ConflictSchema>;

export const ConflictResolutionSchema = z.object({
  document_id: z.string().uuid(),
  resolution: z.enum(['accept_local', 'accept_remote', 'manual']),
  merged_content: z.string().optional(),
});

export type ConflictResolution = z.infer<typeof ConflictResolutionSchema>;

// ============================================================================
// WebSocket Event Types
// ============================================================================

export type WSClientEvent =
  | { type: 'doc:subscribe'; document_id: string }
  | { type: 'doc:unsubscribe'; document_id: string }
  | { type: 'doc:edit'; document_id: string; user_id: string }
  | { type: 'comment:add'; comment: CreateComment }
  | { type: 'presence:update'; presence: Presence };

export type WSServerEvent =
  | { type: 'doc:updated'; document: Document }
  | { type: 'doc:conflict'; conflict: Conflict }
  | { type: 'comment:new'; comment: Comment }
  | { type: 'presence:joined'; user_id: string; document_id: string }
  | { type: 'presence:left'; user_id: string; document_id: string }
  | { type: 'sync:status'; status: SyncStatus };

// ============================================================================
// Search Types
// ============================================================================

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  date_from: z.date().optional(),
  date_to: z.date().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SearchResultSchema = z.object({
  documents: z.array(DocumentSchema),
  total: z.number().int().nonnegative(),
  facets: z.object({
    categories: z.record(z.number()),
    tags: z.record(z.number()),
    authors: z.record(z.number()),
  }),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// ============================================================================
// AI Operations Types
// ============================================================================

export const AIGenerateRequestSchema = z.object({
  prompt: z.string().min(1),
  context_files: z.array(z.string()).optional(),
  template: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type AIGenerateRequest = z.infer<typeof AIGenerateRequestSchema>;

export const AIImproveRequestSchema = z.object({
  document_id: z.string().uuid(),
  focus_areas: z.array(z.enum(['clarity', 'completeness', 'examples', 'structure'])).optional(),
});

export type AIImproveRequest = z.infer<typeof AIImproveRequestSchema>;

export const AISummarizeRequestSchema = z.object({
  document_id: z.string().uuid(),
  max_length: z.number().int().positive().default(500),
});

export type AISummarizeRequest = z.infer<typeof AISummarizeRequestSchema>;

export const AIResponseSchema = z.object({
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

// ============================================================================
// CLI Types
// ============================================================================

export const CLICommandSchema = z.object({
  command: z.enum([
    'list',
    'create',
    'edit',
    'delete',
    'search',
    'view',
    'sync',
    'push',
    'pull',
    'status',
    'resolve',
  ]),
  args: z.array(z.string()),
  options: z.record(z.any()),
});

export type CLICommand = z.infer<typeof CLICommandSchema>;

// ============================================================================
// Batch Operations
// ============================================================================

export const BatchCreateRequestSchema = z.object({
  documents: z.array(CreateDocumentSchema),
});

export type BatchCreateRequest = z.infer<typeof BatchCreateRequestSchema>;

export const BatchUpdateRequestSchema = z.object({
  updates: z.array(UpdateDocumentSchema),
});

export type BatchUpdateRequest = z.infer<typeof BatchUpdateRequestSchema>;

export const BatchOperationResultSchema = z.object({
  success: z.array(z.string().uuid()),
  failed: z.array(
    z.object({
      id: z.string().optional(),
      error: z.string(),
    })
  ),
});

export type BatchOperationResult = z.infer<typeof BatchOperationResultSchema>;

// ============================================================================
// Export Configuration
// ============================================================================

export const ExportConfigSchema = z.object({
  format: z.enum(['markdown', 'html', 'pdf']),
  documents: z.array(z.string().uuid()).optional(),
  category: z.string().optional(),
  include_toc: z.boolean().default(true),
  include_metadata: z.boolean().default(true),
});

export type ExportConfig = z.infer<typeof ExportConfigSchema>;
