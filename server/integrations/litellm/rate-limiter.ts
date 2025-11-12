/**
 * Smart Rate Limiter for LiteLLM
 * Handles FREE tier limits (16 requests/minute) intelligently
 */

interface QueuedRequest {
  id: string;
  fn: () => Promise<any>;
  priority: "high" | "medium" | "low";
  timestamp: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxConcurrent: number;
  retryAttempts: number;
  backoffMultiplier: number;
}

export class LiteLLMRateLimiter {
  private queue: QueuedRequest[] = [];
  private requestTimestamps: number[] = [];
  private processing = false;
  private concurrent = 0;

  private config: RateLimitConfig = {
    maxRequestsPerMinute: 12, // VERY Conservative for tool calls (limit is 16, we use 12)
    maxConcurrent: 2, // Max 2 parallel requests (tool calls can spawn multiple)
    retryAttempts: 3,
    backoffMultiplier: 2,
  };

  /**
   * Add request to queue with priority
   */
  async enqueue<T>(
    fn: () => Promise<T>,
    priority: "high" | "medium" | "low" = "medium"
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `req_${Date.now()}_${Math.random()}`,
        fn,
        priority,
        timestamp: Date.now(),
        resolve,
        reject,
      };

      // Insert by priority
      if (priority === "high") {
        this.queue.unshift(request);
      } else if (priority === "low") {
        this.queue.push(request);
      } else {
        // Medium priority: insert in middle
        const mediumIndex = this.queue.findIndex(r => r.priority === "low");
        if (mediumIndex === -1) {
          this.queue.push(request);
        } else {
          this.queue.splice(mediumIndex, 0, request);
        }
      }

      this.processQueue();
    });
  }

  /**
   * Process queue with rate limiting
   */
  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      // Check if we can make a request
      if (!this.canMakeRequest()) {
        const waitTime = this.getWaitTime();
        console.log(
          `⏳ [RateLimiter] Waiting ${waitTime}ms before next request`
        );
        await this.sleep(waitTime);
        continue;
      }

      // Check concurrent limit
      if (this.concurrent >= this.config.maxConcurrent) {
        await this.sleep(100);
        continue;
      }

      // Get next request
      const request = this.queue.shift();
      if (!request) break;

      // Execute with retry logic
      this.executeWithRetry(request);
    }

    this.processing = false;
  }

  /**
   * Execute request with exponential backoff retry
   */
  private async executeWithRetry(request: QueuedRequest) {
    this.concurrent++;
    this.recordRequest();

    let lastError: any;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const result = await request.fn();
        this.concurrent--;
        request.resolve(result);
        return;
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          const backoffTime = this.calculateBackoff(attempt);
          console.warn(
            `⚠️ [RateLimiter] Rate limit hit. Retry ${attempt}/${this.config.retryAttempts} in ${backoffTime}ms`
          );

          if (attempt < this.config.retryAttempts) {
            await this.sleep(backoffTime);
            continue;
          }
        } else {
          // Non rate-limit error, fail immediately
          break;
        }
      }
    }

    this.concurrent--;
    request.reject(lastError);
  }

  /**
   * Check if we can make a request now
   */
  private canMakeRequest(): boolean {
    this.cleanupOldTimestamps();
    return this.requestTimestamps.length < this.config.maxRequestsPerMinute;
  }

  /**
   * Get time to wait before next request
   */
  private getWaitTime(): number {
    if (this.requestTimestamps.length === 0) return 0;

    const oldestRequest = this.requestTimestamps[0];
    const timeSinceOldest = Date.now() - oldestRequest;
    const timeToWait = 60000 - timeSinceOldest; // 60 seconds

    return Math.max(timeToWait, 0);
  }

  /**
   * Calculate exponential backoff time
   */
  private calculateBackoff(attempt: number): number {
    const baseDelay = 1000; // 1 second
    return baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
  }

  /**
   * Record request timestamp
   */
  private recordRequest() {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Clean up timestamps older than 1 minute
   */
  private cleanupOldTimestamps() {
    const oneMinuteAgo = Date.now() - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(
      ts => ts > oneMinuteAgo
    );
  }

  /**
   * Check if error is rate limit error
   */
  private isRateLimitError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || "";
    return (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("429") ||
      error?.statusCode === 429
    );
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      requestsInLastMinute: this.requestTimestamps.length,
      maxPerMinute: this.config.maxRequestsPerMinute,
      concurrent: this.concurrent,
      maxConcurrent: this.config.maxConcurrent,
      availableSlots:
        this.config.maxRequestsPerMinute - this.requestTimestamps.length,
    };
  }
}

// Singleton instance
export const rateLimiter = new LiteLLMRateLimiter();
