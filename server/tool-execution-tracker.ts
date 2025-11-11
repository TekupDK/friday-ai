/**
 * Tool Execution Tracker
 * Tracker Friday AI's tool execution i real-time
 * Bruges til at vise progress i frontend via tRPC subscriptions
 */

import { EventEmitter } from 'events';

export interface ToolSubtask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface ToolExecution {
  id: string;
  name: string;
  displayName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  subtasks: ToolSubtask[];
  startTime: Date;
  endTime?: Date;
  error?: string;
  userId: number;
  conversationId: number;
}

// In-memory store (i produktion: brug Redis for multi-instance support)
const activeExecutions = new Map<string, ToolExecution>();
const eventEmitter = new EventEmitter();

// Define subtasks for each tool type
const TOOL_SUBTASKS: Record<string, string[]> = {
  create_lead: [
    'Validerer email format',
    'Tjekker for duplikater',
    'Indsætter i database',
    'Opretter lead entry'
  ],
  create_task: [
    'Parser dato og tid',
    'Validerer prioritet',
    'Indsætter i database'
  ],
  book_meeting: [
    'Tjekker kalender for konflikter',
    'Opretter Google Calendar event',
    'Bekræfter booking'
  ],
  create_invoice: [
    'Henter kunde data fra Billy',
    'Beregner total pris',
    'Opretter faktura draft i Billy',
    'Gemmer i database'
  ],
  search_email: [
    'Forbinder til Gmail API',
    'Søger i threads',
    'Filtrerer resultater'
  ],
  check_calendar: [
    'Forbinder til Google Calendar',
    'Henter begivenheder',
    'Formaterer svar'
  ],
  request_flytter_photos: [
    'Validerer kunde info',
    'Opretter photo request',
    'Blokerer quote generation'
  ],
  job_completion: [
    'Validerer 6-step checklist',
    'Markerer job som færdigt',
    'Opdaterer kunde status'
  ]
};

// Display names in Danish
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  create_lead: 'Opretter lead',
  create_task: 'Opretter opgave',
  book_meeting: 'Booker møde',
  create_invoice: 'Opretter faktura',
  search_email: 'Søger i emails',
  check_calendar: 'Tjekker kalender',
  request_flytter_photos: 'Anmoder om billeder',
  job_completion: 'Afslutter job'
};

/**
 * Start tracking a tool execution
 */
export function startToolExecution(
  toolName: string,
  userId: number,
  conversationId: number
): string {
  const executionId = `${toolName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const subtasks = (TOOL_SUBTASKS[toolName] || ['Udfører handling']).map((name, idx) => ({
    id: `${executionId}-subtask-${idx}`,
    name,
    status: 'pending' as const,
  }));

  const execution: ToolExecution = {
    id: executionId,
    name: toolName,
    displayName: TOOL_DISPLAY_NAMES[toolName] || toolName,
    status: 'running',
    progress: 0,
    subtasks,
    startTime: new Date(),
    userId,
    conversationId,
  };

  activeExecutions.set(executionId, execution);
  
  // Emit start event
  emitUpdate(execution);

  console.log(`[ToolTracker] Started execution: ${executionId} (${toolName})`);
  
  return executionId;
}

/**
 * Update subtask status
 */
export function updateSubtask(
  executionId: string,
  subtaskIndex: number,
  status: ToolSubtask['status'],
  error?: string
) {
  const execution = activeExecutions.get(executionId);
  if (!execution) return;

  const subtask = execution.subtasks[subtaskIndex];
  if (!subtask) return;

  // Update subtask
  subtask.status = status;
  if (status === 'running' && !subtask.startTime) {
    subtask.startTime = new Date();
  }
  if (status === 'completed' || status === 'failed') {
    subtask.endTime = new Date();
  }
  if (error) {
    subtask.error = error;
  }

  // Calculate progress
  const completedCount = execution.subtasks.filter(st => st.status === 'completed').length;
  execution.progress = Math.round((completedCount / execution.subtasks.length) * 100);

  // Emit update
  emitUpdate(execution);

  console.log(`[ToolTracker] Updated ${executionId} subtask ${subtaskIndex}: ${status} (${execution.progress}%)`);
}

/**
 * Complete tool execution
 */
export function completeToolExecution(
  executionId: string,
  success: boolean,
  error?: string
) {
  const execution = activeExecutions.get(executionId);
  if (!execution) return;

  execution.status = success ? 'completed' : 'failed';
  execution.endTime = new Date();
  execution.progress = 100;
  if (error) {
    execution.error = error;
  }

  // Mark remaining subtasks
  execution.subtasks.forEach(subtask => {
    if (subtask.status === 'pending' || subtask.status === 'running') {
      subtask.status = success ? 'completed' : 'failed';
      subtask.endTime = new Date();
    }
  });

  // Emit final update
  emitUpdate(execution);

  console.log(`[ToolTracker] Completed ${executionId}: ${success ? 'SUCCESS' : 'FAILED'}`);

  // Cleanup after 30 seconds
  setTimeout(() => {
    activeExecutions.delete(executionId);
    console.log(`[ToolTracker] Cleaned up ${executionId}`);
  }, 30000);
}

/**
 * Cancel tool execution
 */
export function cancelToolExecution(executionId: string) {
  const execution = activeExecutions.get(executionId);
  if (!execution) return;

  execution.status = 'cancelled';
  execution.endTime = new Date();

  // Mark remaining subtasks as cancelled
  execution.subtasks.forEach(subtask => {
    if (subtask.status === 'pending' || subtask.status === 'running') {
      subtask.status = 'failed';
      subtask.endTime = new Date();
    }
  });

  emitUpdate(execution);

  console.log(`[ToolTracker] Cancelled ${executionId}`);

  // Cleanup
  setTimeout(() => activeExecutions.delete(executionId), 5000);
}

/**
 * Get active execution
 */
export function getToolExecution(executionId: string): ToolExecution | null {
  return activeExecutions.get(executionId) || null;
}

/**
 * Get all active executions for a user
 */
export function getUserExecutions(userId: number): ToolExecution[] {
  return Array.from(activeExecutions.values()).filter(ex => ex.userId === userId);
}

/**
 * Subscribe to execution updates
 */
export function subscribeToExecutions(
  userId: number,
  callback: (execution: ToolExecution) => void
): () => void {
  const handler = (execution: ToolExecution) => {
    if (execution.userId === userId) {
      callback(execution);
    }
  };

  eventEmitter.on('execution-update', handler);

  // Return unsubscribe function
  return () => {
    eventEmitter.off('execution-update', handler);
  };
}

/**
 * Emit update event
 */
function emitUpdate(execution: ToolExecution) {
  eventEmitter.emit('execution-update', execution);
}

/**
 * Helper: Execute tool with automatic tracking
 */
export async function executeWithTracking<T>(
  toolName: string,
  userId: number,
  conversationId: number,
  executor: (tracker: {
    updateProgress: (subtaskIndex: number) => void;
    fail: (error: string) => void;
  }) => Promise<T>
): Promise<T> {
  const executionId = startToolExecution(toolName, userId, conversationId);

  try {
    const result = await executor({
      updateProgress: (subtaskIndex: number) => {
        updateSubtask(executionId, subtaskIndex, 'running');
        updateSubtask(executionId, subtaskIndex, 'completed');
      },
      fail: (error: string) => {
        throw new Error(error);
      }
    });

    completeToolExecution(executionId, true);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    completeToolExecution(executionId, false, errorMessage);
    throw error;
  }
}
