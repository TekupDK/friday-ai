/**
 * Thread Grouping Utilities - Phase 2
 * 
 * Functions for grouping emails into threads and managing thread state
 * Optimized for Shortwave-style conversation view
 */

import type { EnhancedEmailMessage } from '@/types/enhanced-email';
import type { EmailThread, ThreadGroupingOptions, ThreadStats } from '@/types/email-thread';

/**
 * Groups emails by threadId into conversation threads
 * 
 * @param emails - Array of enhanced email messages
 * @param options - Optional grouping configuration
 * @returns Array of EmailThread objects
 */
export function groupEmailsByThread(
  emails: EnhancedEmailMessage[],
  options?: ThreadGroupingOptions
): EmailThread[] {
  // Create a map of threadId -> thread data
  const threadsMap = new Map<string, EmailThread>();
  
  // Group emails by threadId
  emails.forEach(email => {
    const threadId = email.threadId;
    
    if (!threadsMap.has(threadId)) {
      // Initialize new thread
      threadsMap.set(threadId, {
        id: threadId,
        messages: [],
        latestMessage: email,
        unreadCount: 0,
        messageCount: 0,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: email.aiAnalysis?.source || null,
        labels: [],
      });
    }
    
    const thread = threadsMap.get(threadId)!;
    
    // Add message to thread
    thread.messages.push(email);
    thread.messageCount++;
    
    // Update unread count
    if (email.unread) {
      thread.unreadCount++;
    }
    
    // Update latest message (most recent)
    const emailDate = new Date(email.internalDate || email.date);
    const latestDate = new Date(thread.latestMessage.internalDate || thread.latestMessage.date);
    if (emailDate > latestDate) {
      thread.latestMessage = email;
      thread.source = email.aiAnalysis?.source || null;
    }
    
    // Update max lead score
    if (email.aiAnalysis?.leadScore) {
      thread.maxLeadScore = Math.max(thread.maxLeadScore, email.aiAnalysis.leadScore);
    }
    
    // Update total estimated value
    if (email.aiAnalysis?.estimatedValue) {
      thread.totalEstimatedValue += email.aiAnalysis.estimatedValue;
    }
    
    // Track participants
    const participant = email.from || email.sender;
    if (participant && !thread.participants.includes(participant)) {
      thread.participants.push(participant);
    }
    
    // Check for attachments
    if (email.hasAttachment) {
      thread.hasAttachments = true;
    }
    
    // Check for starred
    if (email.labels?.includes('starred')) {
      thread.isStarred = true;
    }
    
    // Merge labels
    email.labels?.forEach(label => {
      if (!thread.labels.includes(label)) {
        thread.labels.push(label);
      }
    });
  });
  
  // Convert map to array
  let threads = Array.from(threadsMap.values());
  
  // Sort messages within each thread (oldest first for conversation flow)
  threads.forEach(thread => {
    thread.messages.sort((a, b) => {
      const dateA = new Date(a.internalDate || a.date).getTime();
      const dateB = new Date(b.internalDate || b.date).getTime();
      return dateA - dateB;
    });
  });
  
  // Apply filtering options
  if (options?.unreadOnly) {
    threads = threads.filter(thread => thread.unreadCount > 0);
  }
  
  if (options?.minLeadScore !== undefined) {
    threads = threads.filter(thread => thread.maxLeadScore >= options.minLeadScore!);
  }
  
  // Apply sorting
  threads = sortThreads(threads, options?.sortBy, options?.sortDirection);
  
  return threads;
}

/**
 * Sorts threads by specified criteria
 * 
 * @param threads - Array of threads to sort
 * @param sortBy - Sort criterion
 * @param direction - Sort direction
 * @returns Sorted array of threads
 */
export function sortThreads(
  threads: EmailThread[],
  sortBy: 'date' | 'leadScore' | 'unreadCount' = 'date',
  direction: 'asc' | 'desc' = 'desc'
): EmailThread[] {
  const sorted = [...threads].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date': {
        const dateA = new Date(a.latestMessage.internalDate || a.latestMessage.date).getTime();
        const dateB = new Date(b.latestMessage.internalDate || b.latestMessage.date).getTime();
        comparison = dateB - dateA; // Default: newest first
        break;
      }
      
      case 'leadScore': {
        comparison = b.maxLeadScore - a.maxLeadScore; // Default: highest score first
        break;
      }
      
      case 'unreadCount': {
        comparison = b.unreadCount - a.unreadCount; // Default: most unread first
        break;
      }
    }
    
    return direction === 'asc' ? -comparison : comparison;
  });
  
  return sorted;
}

/**
 * Calculates statistics for a collection of threads
 * 
 * @param threads - Array of threads
 * @returns ThreadStats object
 */
export function calculateThreadStats(threads: EmailThread[]): ThreadStats {
  const stats: ThreadStats = {
    totalThreads: threads.length,
    totalMessages: 0,
    unreadThreads: 0,
    totalUnread: 0,
    hotLeadThreads: 0,
    totalValue: 0,
  };
  
  threads.forEach(thread => {
    stats.totalMessages += thread.messageCount;
    stats.totalUnread += thread.unreadCount;
    stats.totalValue += thread.totalEstimatedValue;
    
    if (thread.unreadCount > 0) {
      stats.unreadThreads++;
    }
    
    if (thread.maxLeadScore >= 70) {
      stats.hotLeadThreads++;
    }
  });
  
  return stats;
}

/**
 * Finds a specific thread by ID
 * 
 * @param threads - Array of threads
 * @param threadId - Thread ID to find
 * @returns Thread if found, undefined otherwise
 */
export function findThreadById(threads: EmailThread[], threadId: string): EmailThread | undefined {
  return threads.find(thread => thread.id === threadId);
}

/**
 * Gets all messages from multiple threads, flattened
 * 
 * @param threads - Array of threads
 * @returns Flattened array of all messages
 */
export function flattenThreadMessages(threads: EmailThread[]): EnhancedEmailMessage[] {
  return threads.flatMap(thread => thread.messages);
}

/**
 * Filters threads by search query
 * 
 * @param threads - Array of threads
 * @param query - Search query string
 * @returns Filtered threads matching the query
 */
export function searchThreads(threads: EmailThread[], query: string): EmailThread[] {
  if (!query || query.trim() === '') {
    return threads;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return threads.filter(thread => {
    // Search in latest message
    const latest = thread.latestMessage;
    
    return (
      latest.subject?.toLowerCase().includes(lowerQuery) ||
      latest.from?.toLowerCase().includes(lowerQuery) ||
      latest.sender?.toLowerCase().includes(lowerQuery) ||
      latest.snippet?.toLowerCase().includes(lowerQuery) ||
      thread.participants.some(p => p.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Gets thread display summary (for collapsed view)
 * 
 * @param thread - Thread to summarize
 * @returns Summary string
 */
export function getThreadSummary(thread: EmailThread): string {
  const { messageCount, unreadCount, maxLeadScore } = thread;
  
  const parts: string[] = [];
  
  if (messageCount > 1) {
    parts.push(`${messageCount} messages`);
  }
  
  if (unreadCount > 0) {
    parts.push(`${unreadCount} unread`);
  }
  
  if (maxLeadScore >= 70) {
    parts.push(`Hot lead (${maxLeadScore})`);
  }
  
  return parts.join(' • ') || 'Single message';
}

/**
 * Checks if a thread matches a specific source filter
 * 
 * @param thread - Thread to check
 * @param source - Source filter
 * @returns True if thread matches the source filter
 */
export function threadMatchesSource(
  thread: EmailThread,
  source: string | 'all'
): boolean {
  if (source === 'all') {
    return true;
  }
  
  return thread.source === source;
}
