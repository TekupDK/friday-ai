import { getDb } from "./db";
import { logger } from "./logger";

interface EventMetrics {
  eventType: string;
  count: number;
  lastEventAt: Date;
  firstEventAt: Date;
}

interface SystemMetrics {
  totalEvents: number;
  eventsByType: Record<string, EventMetrics>;
  lastUpdated: Date;
}

export class MetricsService {
  private metrics: SystemMetrics = {
    totalEvents: 0,
    eventsByType: {},
    lastUpdated: new Date(),
  };

  private log = logger;

  /**
   * Track an event and update metrics
   */
  async trackEvent(
    eventType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const now = new Date();

      if (!this.metrics.eventsByType[eventType]) {
        this.metrics.eventsByType[eventType] = {
          eventType,
          count: 0,
          lastEventAt: now,
          firstEventAt: now,
        };
      }

      this.metrics.eventsByType[eventType].count++;
      this.metrics.eventsByType[eventType].lastEventAt = now;
      this.metrics.totalEvents++;
      this.metrics.lastUpdated = now;

      this.log.info("Event tracked", {
        eventType,
        count: this.metrics.eventsByType[eventType].count,
        metadata,
      });
    } catch (error) {
      this.log.error("Error tracking event", {
        eventType,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): SystemMetrics {
    return {
      ...this.metrics,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get metrics for a specific event type
   */
  getEventMetrics(eventType: string): EventMetrics | null {
    return this.metrics.eventsByType[eventType] || null;
  }

  /**
   * Get top event types by count
   */
  getTopEvents(limit: number = 10): EventMetrics[] {
    return Object.values(this.metrics.eventsByType)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Reset metrics for a specific event type
   */
  resetEventMetrics(eventType: string): void {
    if (this.metrics.eventsByType[eventType]) {
      const oldCount = this.metrics.eventsByType[eventType].count;
      this.metrics.totalEvents -= oldCount;
      delete this.metrics.eventsByType[eventType];

      this.log.info("Event metrics reset", {
        eventType,
        oldCount,
      });
    }
  }

  /**
   * Reset all metrics
   */
  resetAllMetrics(): void {
    const oldTotal = this.metrics.totalEvents;
    this.metrics = {
      totalEvents: 0,
      eventsByType: {},
      lastUpdated: new Date(),
    };

    this.log.info("All metrics reset", {
      oldTotal,
    });
  }

  /**
   * Get database metrics (if available)
   */
  async getDatabaseMetrics(): Promise<Record<string, any>> {
    try {
      const db = await getDb();
      if (!db) {
        return { error: "Database not available" };
      }

      // Get table counts
      const tables = ["leads", "tasks", "conversations", "email_threads"];
      const counts: Record<string, number> = {};

      for (const table of tables) {
        try {
          const result = await db.execute(
            `SELECT COUNT(*) as count FROM ${table}`
          );
          counts[table] = Number(result[0]?.count) || 0;
        } catch (error) {
          this.log.warn("Could not get table count", { table, error });
          counts[table] = 0;
        }
      }

      return {
        tableCounts: counts,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.log.error("Error getting database metrics", { error });
      return { error: "Failed to get database metrics" };
    }
  }
}

// Singleton instance
export const metricsService = new MetricsService();
