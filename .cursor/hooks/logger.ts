/**
 * Hook Logger
 * 
 * Logs hook execution for debugging and monitoring
 */

import type { HookCategory } from "./types";

export interface HookLog {
  hook: string;
  category: HookCategory;
  status: "started" | "completed" | "failed";
  duration?: number;
  error?: string;
  timestamp: string;
}

export interface HookStats {
  completed: number;
  failed: number;
  total: number;
  avgDuration: number;
  totalDuration: number;
}

class HookLogger {
  private logs: HookLog[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  /**
   * Log a hook event
   */
  log(
    hook: string,
    category: HookCategory,
    status: HookLog["status"],
    duration?: number,
    error?: string
  ): void {
    const log: HookLog = {
      hook,
      category,
      status,
      duration,
      error,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(log);

    // Keep only last maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV !== "production") {
      const emoji =
        status === "completed"
          ? "✅"
          : status === "failed"
            ? "❌"
            : "🔄";
      const durationStr = duration ? ` (${duration}ms)` : "";
      console.log(
        `${emoji} [${category}] ${hook}: ${status}${durationStr}`
      );
      if (error) {
        console.error(`   Error: ${error}`);
      }
    }
  }

  /**
   * Get all logs
   */
  getLogs(): HookLog[] {
    return [...this.logs];
  }

  /**
   * Get logs for a specific hook
   */
  getLogsForHook(hookName: string): HookLog[] {
    return this.logs.filter((log) => log.hook === hookName);
  }

  /**
   * Get logs for a specific category
   */
  getLogsForCategory(category: HookCategory): HookLog[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Get execution statistics
   */
  getStats(): HookStats {
    const completed = this.logs.filter((l) => l.status === "completed").length;
    const failed = this.logs.filter((l) => l.status === "failed").length;
    const total = this.logs.length;
    const durations = this.logs
      .filter((l) => l.duration !== undefined)
      .map((l) => l.duration as number);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration =
      durations.length > 0 ? totalDuration / durations.length : 0;

    return {
      completed,
      failed,
      total,
      avgDuration: Math.round(avgDuration),
      totalDuration,
    };
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const hookLogger = new HookLogger();

