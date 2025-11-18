import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withTransaction, withRetryableTransaction, isDatabaseAvailable } from "../db/transaction-utils";
import { getDb } from "../db";

// Mock the database module
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

// Mock the logger
vi.mock("../_core/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("Transaction Utils", () => {
  let mockDb: any;
  let mockTransaction: any;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create a mock transaction function
    mockTransaction = vi.fn();

    // Create a mock database instance
    mockDb = {
      transaction: mockTransaction,
    };

    // Setup getDb to return our mock
    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("withTransaction", () => {
    it("should execute operation within a transaction", async () => {
      const mockResult = { id: "123", success: true };
      const mockOperation = vi.fn().mockResolvedValue(mockResult);

      // Mock transaction to call the operation
      mockTransaction.mockImplementation(async (callback: Function) => {
        return await callback(mockDb);
      });

      const result = await withTransaction(mockOperation, "Test Operation");

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockOperation).toHaveBeenCalledWith(mockDb);
      expect(result).toEqual(mockResult);
    });

    it("should commit transaction on success", async () => {
      const mockResult = { success: true };
      mockTransaction.mockImplementation(async (callback: Function) => {
        return await callback(mockDb);
      });

      const result = await withTransaction(
        async (tx) => mockResult,
        "Test Commit"
      );

      expect(result).toEqual(mockResult);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it("should rollback transaction on error", async () => {
      const testError = new Error("Test error");
      mockTransaction.mockImplementation(async (callback: Function) => {
        throw testError;
      });

      await expect(
        withTransaction(
          async (tx) => {
            throw testError;
          },
          "Test Rollback"
        )
      ).rejects.toThrow("Test error");

      expect(mockTransaction).toHaveBeenCalled();
    });

    it("should throw error if database not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      await expect(
        withTransaction(
          async (tx) => ({ success: true }),
          "No DB Test"
        )
      ).rejects.toThrow("Database not available");
    });

    it("should log operation duration on success", async () => {
      const { logger } = await import("../_core/logger");

      mockTransaction.mockImplementation(async (callback: Function) => {
        return await callback(mockDb);
      });

      await withTransaction(
        async (tx) => ({ success: true }),
        "Test Logging"
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operationName: "Test Logging",
          duration: expect.any(Number),
        }),
        expect.stringContaining("completed")
      );
    });

    it("should log error on failure", async () => {
      const { logger } = await import("../_core/logger");
      const testError = new Error("Test failure");

      mockTransaction.mockImplementation(async (callback: Function) => {
        throw testError;
      });

      await expect(
        withTransaction(
          async (tx) => {
            throw testError;
          },
          "Test Error Logging"
        )
      ).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          operationName: "Test Error Logging",
          duration: expect.any(Number),
          error: "Test failure",
        }),
        expect.stringContaining("failed")
      );
    });
  });

  describe("withRetryableTransaction", () => {
    it("should succeed on first attempt", async () => {
      const mockResult = { success: true };

      mockTransaction.mockImplementation(async (callback: Function) => {
        return await callback(mockDb);
      });

      const result = await withRetryableTransaction(
        async (tx) => mockResult,
        { operationName: "Test Retry Success" }
      );

      expect(result).toEqual(mockResult);
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it("should retry on database errors", async () => {
      const { logger } = await import("../_core/logger");
      let attempts = 0;
      const mockResult = { success: true };

      mockTransaction.mockImplementation(async (callback: Function) => {
        attempts++;
        if (attempts < 3) {
          throw new Error("ECONNREFUSED: Connection refused");
        }
        return await callback(mockDb);
      });

      const result = await withRetryableTransaction(
        async (tx) => mockResult,
        { maxRetries: 3, retryDelay: 10, operationName: "Test Retry" }
      );

      expect(attempts).toBe(3);
      expect(result).toEqual(mockResult);
      expect(logger.warn).toHaveBeenCalledTimes(2); // Warns on retry attempts 1 & 2
    });

    it("should not retry on application errors", async () => {
      const appError = new Error("Invalid input");

      mockTransaction.mockImplementation(async (callback: Function) => {
        throw appError;
      });

      await expect(
        withRetryableTransaction(
          async (tx) => {
            throw appError;
          },
          { maxRetries: 3, operationName: "Test No Retry" }
        )
      ).rejects.toThrow("Invalid input");

      expect(mockTransaction).toHaveBeenCalledTimes(1); // Only one attempt
    });

    it("should use exponential backoff", async () => {
      const { logger } = await import("../_core/logger");
      let attempts = 0;

      mockTransaction.mockImplementation(async (callback: Function) => {
        attempts++;
        if (attempts <= 3) {
          throw new Error("ETIMEDOUT: Connection timeout");
        }
        return { success: true };
      });

      await expect(
        withRetryableTransaction(
          async (tx) => ({ success: true }),
          { maxRetries: 3, retryDelay: 100 }
        )
      ).rejects.toThrow();

      expect(logger.warn).toHaveBeenCalledTimes(2);

      // Check exponential backoff: 100ms, 200ms
      const warnCalls = vi.mocked(logger.warn).mock.calls;
      expect(warnCalls[0][0]).toMatchObject({ nextRetryIn: 100 });
      expect(warnCalls[1][0]).toMatchObject({ nextRetryIn: 200 });
    });

    it("should throw last error after max retries", async () => {
      const dbError = new Error("ECONNREFUSED: Connection refused");

      mockTransaction.mockImplementation(async (callback: Function) => {
        throw dbError;
      });

      await expect(
        withRetryableTransaction(
          async (tx) => ({ success: true }),
          { maxRetries: 2, retryDelay: 10 }
        )
      ).rejects.toThrow("ECONNREFUSED");

      expect(mockTransaction).toHaveBeenCalledTimes(2);
    });

    it("should identify database errors correctly", async () => {
      const dbErrors = [
        new Error("ECONNREFUSED"),
        new Error("ETIMEDOUT"),
        new Error("ENOTFOUND"),
        new Error("40001"), // PostgreSQL serialization failure
        new Error("40P01"), // PostgreSQL deadlock
      ];

      for (const error of dbErrors) {
        let attempts = 0;

        mockTransaction.mockImplementation(async (callback: Function) => {
          attempts++;
          if (attempts < 2) {
            throw error;
          }
          return { success: true };
        });

        const result = await withRetryableTransaction(
          async (tx) => ({ success: true }),
          { maxRetries: 3, retryDelay: 1 }
        );

        expect(attempts).toBeGreaterThan(1);
        expect(result).toEqual({ success: true });
      }
    });
  });

  describe("isDatabaseAvailable", () => {
    it("should return true when database is available", async () => {
      vi.mocked(getDb).mockResolvedValue(mockDb);

      const available = await isDatabaseAvailable();

      expect(available).toBe(true);
    });

    it("should return false when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const available = await isDatabaseAvailable();

      expect(available).toBe(false);
    });

    it("should return false when getDb throws error", async () => {
      vi.mocked(getDb).mockRejectedValue(new Error("Connection failed"));

      const available = await isDatabaseAvailable();

      expect(available).toBe(false);
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle multi-step delete operations atomically", async () => {
      const mockSegmentId = "seg-123";
      const deletedMembers: string[] = [];
      const deletedSegments: string[] = [];

      mockTransaction.mockImplementation(async (callback: Function) => {
        const txMock = {
          delete: vi.fn((table: any) => ({
            where: vi.fn(() => {
              if (table === "customerSegmentMembers") {
                deletedMembers.push(mockSegmentId);
              } else if (table === "customerSegments") {
                deletedSegments.push(mockSegmentId);
              }
              return Promise.resolve();
            }),
          })),
        };
        return await callback(txMock);
      });

      await withTransaction(async (tx: any) => {
        await tx.delete("customerSegmentMembers").where();
        await tx.delete("customerSegments").where();
      }, "Delete Segment");

      expect(deletedMembers).toContain(mockSegmentId);
      expect(deletedSegments).toContain(mockSegmentId);
    });

    it("should rollback all operations if one fails", async () => {
      const operations: string[] = [];

      mockTransaction.mockImplementation(async (callback: Function) => {
        const txMock = {
          insert: vi.fn(() => {
            operations.push("insert");
            return Promise.resolve();
          }),
          update: vi.fn(() => {
            operations.push("update");
            throw new Error("Update failed");
          }),
        };

        try {
          await callback(txMock);
        } catch (error) {
          // Rollback - clear operations
          operations.length = 0;
          throw error;
        }
      });

      await expect(
        withTransaction(async (tx: any) => {
          await tx.insert();
          await tx.update(); // This will fail
        }, "Multi-Step Operation")
      ).rejects.toThrow("Update failed");

      // Operations should be rolled back
      expect(operations).toHaveLength(0);
    });
  });
});
