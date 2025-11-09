/**
 * AI Generation Queue System
 * 
 * Manages batch processing and queuing of AI doc generation:
 * - Prevent concurrent overload
 * - Queue management
 * - Progress tracking
 * - Error handling
 */

import { logger } from "../../_core/logger";
import { autoCreateLeadDoc } from "./auto-create";
import { logAIGeneration } from "./analytics";

export interface QueueJob {
  id: string;
  leadId: number;
  leadName?: string;
  status: "pending" | "processing" | "completed" | "failed";
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  docId?: string;
  retries?: number;
}

class AIGenerationQueue {
  private queue: QueueJob[] = [];
  private processing = false;
  private maxConcurrent = 1; // Process one at a time to avoid rate limits
  private currentJob: QueueJob | null = null;

  /**
   * Add job to queue
   */
  addJob(leadId: number, leadName?: string): QueueJob {
    const job: QueueJob = {
      id: `job_${Date.now()}_${leadId}`,
      leadId,
      leadName,
      status: "pending",
    };

    this.queue.push(job);
    logger.info({ jobId: job.id, leadId }, "[AI Queue] Job added to queue");

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return job;
  }

  /**
   * Add multiple jobs (bulk)
   */
  addBulkJobs(leads: Array<{ id: number; name?: string }>): QueueJob[] {
    const jobs = leads.map((lead) => ({
      id: `job_${Date.now()}_${lead.id}_${Math.random().toString(36).substring(7)}`,
      leadId: lead.id,
      leadName: lead.name,
      status: "pending" as const,
    }));

    this.queue.push(...jobs);
    logger.info({ count: jobs.length }, "[AI Queue] Bulk jobs added");

    if (!this.processing) {
      this.processQueue();
    }

    return jobs;
  }

  /**
   * Process queue
   */
  private async processQueue() {
    if (this.processing) {
      return;
    }

    this.processing = true;
    logger.info({ queueSize: this.queue.length }, "[AI Queue] Starting queue processing");

    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      this.currentJob = job;

      logger.info(
        { jobId: job.id, leadId: job.leadId, remaining: this.queue.length },
        "[AI Queue] Processing job"
      );

      job.status = "processing";
      job.startedAt = new Date();

      const startTime = Date.now();

      try {
        const result = await autoCreateLeadDoc(job.leadId);

        if (result.success) {
          job.status = "completed";
          job.docId = result.docId;
          job.retries = result.retries;
          job.completedAt = new Date();

          logger.info(
            { jobId: job.id, docId: result.docId },
            "[AI Queue] Job completed successfully"
          );

          // Log analytics
          await logAIGeneration({
            docId: result.docId!,
            leadId: job.leadId,
            generationType: "lead",
            success: true,
            duration: Date.now() - startTime,
            retries: result.retries,
          });
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error: any) {
        job.status = "failed";
        job.error = error.message;
        job.completedAt = new Date();

        logger.error(
          { jobId: job.id, leadId: job.leadId, error: error.message },
          "[AI Queue] Job failed"
        );

        // Log analytics
        await logAIGeneration({
          docId: `failed_${job.id}`,
          leadId: job.leadId,
          generationType: "lead",
          success: false,
          duration: Date.now() - startTime,
          error: error.message,
        });
      }

      this.currentJob = null;

      // Small delay between jobs to avoid hammering the API
      if (this.queue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    this.processing = false;
    logger.info("[AI Queue] Queue processing completed");
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queueLength: number;
    processing: boolean;
    currentJob: QueueJob | null;
  } {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      currentJob: this.currentJob,
    };
  }

  /**
   * Clear queue
   */
  clearQueue() {
    const count = this.queue.length;
    this.queue = [];
    logger.info({ count }, "[AI Queue] Queue cleared");
    return count;
  }

  /**
   * Get all pending jobs
   */
  getPendingJobs(): QueueJob[] {
    return this.queue.filter((job) => job.status === "pending");
  }
}

// Singleton instance
export const aiQueue = new AIGenerationQueue();

/**
 * Helper: Add lead to generation queue
 */
export async function queueLeadDocGeneration(leadId: number, leadName?: string) {
  return aiQueue.addJob(leadId, leadName);
}

/**
 * Helper: Queue multiple leads
 */
export async function queueBulkLeadDocs(leads: Array<{ id: number; name?: string }>) {
  return aiQueue.addBulkJobs(leads);
}

/**
 * Helper: Get queue status
 */
export function getQueueStatus() {
  return aiQueue.getStatus();
}
