-- Documentation System Tables Migration
-- Created: 2025-11-08
-- Description: Add tables for real-time documentation system with Git sync and collaboration

-- Create enums
CREATE TYPE friday_ai.document_sync_status AS ENUM ('idle', 'syncing', 'conflict', 'error');
CREATE TYPE friday_ai.document_conflict_resolution AS ENUM ('accept_local', 'accept_remote', 'manual');

-- Documents table
CREATE TABLE friday_ai.documents (
  id TEXT PRIMARY KEY NOT NULL,
  path TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags JSONB DEFAULT '[]'::JSONB NOT NULL,
  author VARCHAR(255) NOT NULL,
  "gitHash" VARCHAR(40),
  version INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for documents
CREATE INDEX documents_path_idx ON friday_ai.documents(path);
CREATE INDEX documents_category_idx ON friday_ai.documents(category);
CREATE INDEX documents_author_idx ON friday_ai.documents(author);

-- Document changes (audit log)
CREATE TABLE friday_ai.document_changes (
  id TEXT PRIMARY KEY NOT NULL,
  "documentId" TEXT NOT NULL,
  "userId" VARCHAR(255) NOT NULL,
  operation VARCHAR(20) NOT NULL,
  diff TEXT NOT NULL,
  "gitHash" VARCHAR(40),
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Document comments
CREATE TABLE friday_ai.document_comments (
  id TEXT PRIMARY KEY NOT NULL,
  "documentId" TEXT NOT NULL,
  "userId" VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  "lineNumber" INTEGER,
  resolved BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP
);

-- Indexes for comments
CREATE INDEX document_comments_doc_idx ON friday_ai.document_comments("documentId");
CREATE INDEX document_comments_user_idx ON friday_ai.document_comments("userId");

-- Document conflicts
CREATE TABLE friday_ai.document_conflicts (
  id TEXT PRIMARY KEY NOT NULL,
  "documentId" TEXT NOT NULL,
  path TEXT NOT NULL,
  "localContent" TEXT NOT NULL,
  "remoteContent" TEXT NOT NULL,
  "baseContent" TEXT,
  "conflictMarkers" TEXT NOT NULL,
  resolution friday_ai.document_conflict_resolution,
  "mergedContent" TEXT,
  "resolvedAt" TIMESTAMP,
  "resolvedBy" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Comments
COMMENT ON TABLE friday_ai.documents IS 'Documentation files with Git integration';
COMMENT ON TABLE friday_ai.document_changes IS 'Audit log of all document changes';
COMMENT ON TABLE friday_ai.document_comments IS 'Comments and annotations on documents';
COMMENT ON TABLE friday_ai.document_conflicts IS 'Git merge conflicts awaiting resolution';
