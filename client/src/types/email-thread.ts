/**
 * Email Thread Types - Phase 2
 *
 * Type definitions for thread grouping and conversation management
 * Extends EnhancedEmailMessage for Shortwave-style thread conversations
 */

import type { EnhancedEmailMessage } from "./enhanced-email";

/**
 * EmailThread - Represents a conversation thread
 * Groups multiple emails by threadId for conversation view
 */
export interface EmailThread {
  /** Unique thread identifier (same as Gmail's threadId) */
  id: string;

  /** All messages in this thread, sorted by date (oldest first) */
  messages: EnhancedEmailMessage[];

  /** The most recent message in the thread (for preview) */
  latestMessage: EnhancedEmailMessage;

  /** Number of unread messages in this thread */
  unreadCount: number;

  /** Total number of messages in thread */
  messageCount: number;

  /** Highest lead score among all messages in thread */
  maxLeadScore: number;

  /** Combined estimated value from all messages */
  totalEstimatedValue: number;

  /** All unique participants in the thread */
  participants: string[];

  /** Whether any message in thread has attachments */
  hasAttachments: boolean;

  /** Whether any message in thread is starred */
  isStarred: boolean;

  /** Primary source of the thread (from latest message) */
  source: string | null;

  /** All labels from all messages combined */
  labels: string[];
}

/**
 * ThreadGroupingOptions - Configuration for thread grouping
 */
export interface ThreadGroupingOptions {
  /** Sort threads by date, lead score, or unread count */
  sortBy?: "date" | "leadScore" | "unreadCount";

  /** Sort direction */
  sortDirection?: "asc" | "desc";

  /** Filter threads by unread status */
  unreadOnly?: boolean;

  /** Minimum lead score threshold */
  minLeadScore?: number;
}

/**
 * ThreadExpansionState - Manages which threads are expanded
 */
export interface ThreadExpansionState {
  /** Set of expanded thread IDs */
  expandedThreads: Set<string>;

  /** Toggle a thread's expansion state */
  toggleThread: (threadId: string) => void;

  /** Expand a specific thread */
  expandThread: (threadId: string) => void;

  /** Collapse a specific thread */
  collapseThread: (threadId: string) => void;

  /** Collapse all threads */
  collapseAll: () => void;

  /** Expand all threads */
  expandAll: () => void;
}

/**
 * ThreadStats - Statistics for a collection of threads
 */
export interface ThreadStats {
  /** Total number of threads */
  totalThreads: number;

  /** Total number of messages across all threads */
  totalMessages: number;

  /** Number of threads with unread messages */
  unreadThreads: number;

  /** Total unread messages */
  totalUnread: number;

  /** Number of hot lead threads (score >= 70) */
  hotLeadThreads: number;

  /** Combined estimated value of all threads */
  totalValue: number;
}
