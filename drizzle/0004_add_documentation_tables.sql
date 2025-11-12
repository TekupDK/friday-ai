-- Migration: Add Documentation System Tables
-- Created: 2025-11-08
-- Description: Adds tables for documentation management with Git sync

-- Create enums for document sync status and conflict resolution
DO $$ BEGIN
  CREATE TYPE "friday_ai"."document_sync_status" AS ENUM('idle', 'syncing', 'conflict', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "friday_ai"."document_conflict_resolution" AS ENUM('accept_local', 'accept_remote', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create documents table
CREATE TABLE IF NOT EXISTS "friday_ai"."documents" (
  "id" text PRIMARY KEY NOT NULL,
  "path" text NOT NULL,
  "title" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "category" varchar(100) NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "author" varchar(255) NOT NULL,
  "gitHash" varchar(40),
  "version" integer DEFAULT 1 NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for documents table
CREATE INDEX IF NOT EXISTS "documents_path_idx" ON "friday_ai"."documents"("path");
CREATE INDEX IF NOT EXISTS "documents_category_idx" ON "friday_ai"."documents"("category");
CREATE INDEX IF NOT EXISTS "documents_author_idx" ON "friday_ai"."documents"("author");

-- Create document_changes table (audit log)
CREATE TABLE IF NOT EXISTS "friday_ai"."document_changes" (
  "id" text PRIMARY KEY NOT NULL,
  "documentId" text NOT NULL,
  "userId" varchar(255) NOT NULL,
  "operation" varchar(20) NOT NULL,
  "diff" text NOT NULL,
  "gitHash" varchar(40),
  "timestamp" timestamp DEFAULT now() NOT NULL
);

-- Create document_comments table
CREATE TABLE IF NOT EXISTS "friday_ai"."document_comments" (
  "id" text PRIMARY KEY NOT NULL,
  "documentId" text NOT NULL,
  "userId" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "lineNumber" integer,
  "resolved" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp
);

-- Create indexes for document_comments
CREATE INDEX IF NOT EXISTS "document_comments_doc_idx" ON "friday_ai"."document_comments"("documentId");
CREATE INDEX IF NOT EXISTS "document_comments_user_idx" ON "friday_ai"."document_comments"("userId");

-- Create document_conflicts table
CREATE TABLE IF NOT EXISTS "friday_ai"."document_conflicts" (
  "id" text PRIMARY KEY NOT NULL,
  "documentId" text NOT NULL,
  "path" text NOT NULL,
  "localContent" text NOT NULL,
  "remoteContent" text NOT NULL,
  "baseContent" text,
  "conflictMarkers" text NOT NULL,
  "resolution" "friday_ai"."document_conflict_resolution",
  "mergedContent" text,
  "resolvedAt" timestamp,
  "resolvedBy" varchar(255),
  "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Add comments on tables for documentation
COMMENT ON TABLE "friday_ai"."documents" IS 'Documentation files with Git integration and version control';
COMMENT ON TABLE "friday_ai"."document_changes" IS 'Audit log of all document changes for version history';
COMMENT ON TABLE "friday_ai"."document_comments" IS 'Comments and annotations on documentation with line number support';
COMMENT ON TABLE "friday_ai"."document_conflicts" IS 'Git merge conflicts awaiting resolution';
