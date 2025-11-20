/**
 * Tests for Follow-up Reminders Feature
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { getDb } from "../db";
import {
  createFollowupReminder,
  listFollowupReminders,
  markFollowupComplete,
  shouldCreateFollowup,
  autoCreateFollowups,
} from "../email-intelligence/followup-reminders";
import { emailFollowups, emails } from "../../drizzle/schema";

// Mock dependencies
vi.mock("../db");
vi.mock("../google-api");
vi.mock("../_core/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Follow-up Reminders", () => {
  const mockUserId = 1;
  const mockThreadId = "thread-123";
  const mockEmailId = 100;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("shouldCreateFollowup", () => {
    it("should return true for emails with questions", async () => {
      const { getGmailThread } = await import("../google-api");
      vi.mocked(getGmailThread).mockResolvedValue({
        id: mockThreadId,
        subject: "Test Email",
        messages: [
          {
            id: "msg-1",
            threadId: mockThreadId,
            from: "test@example.com",
            to: "user@example.com",
            subject: "Test",
            body: "Hej, hvornår kan du levere?",
            date: new Date().toISOString(),
          },
        ],
      } as any);

      const db = await getDb();
      if (db) {
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any);
      }

      const result = await shouldCreateFollowup(
        mockThreadId,
        mockUserId,
        "Test Email",
        "Hej, hvornår kan du levere?"
      );

      expect(result).toBe(true);
    });

    it("should return false if user sent last message", async () => {
      const { getGmailThread } = await import("../google-api");
      vi.mocked(getGmailThread).mockResolvedValue({
        id: mockThreadId,
        subject: "Test Email",
        messages: [
          {
            id: "msg-1",
            threadId: mockThreadId,
            from: "user@example.com", // User's email
            to: "test@example.com",
            subject: "Test",
            body: "Tak for din mail",
            date: new Date().toISOString(),
          },
        ],
      } as any);

      const db = await getDb();
      if (db) {
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any);
      }

      const result = await shouldCreateFollowup(
        mockThreadId,
        mockUserId,
        "Test Email",
        "Tak for din mail"
      );

      expect(result).toBe(false);
    });
  });

  describe("createFollowupReminder", () => {
    it("should create a follow-up reminder", async () => {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 3);

      const db = await getDb();
      if (db) {
        const mockInsert = vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                id: 1,
                userId: mockUserId,
                threadId: mockThreadId,
                reminderDate: reminderDate.toISOString(),
                status: "pending",
                priority: "normal",
                sentAt: new Date().toISOString(),
                autoCreated: false,
              },
            ]),
          }),
        });

        vi.mocked(db.insert).mockReturnValue(mockInsert as any);

        const { getGmailThread } = await import("../google-api");
        vi.mocked(getGmailThread).mockResolvedValue({
          id: mockThreadId,
          subject: "Test Email",
          messages: [
            {
              id: "msg-1",
              threadId: mockThreadId,
              from: "test@example.com",
              to: "user@example.com",
              subject: "Test",
              body: "Test body",
              date: new Date().toISOString(),
            },
          ],
        } as any);
      }

      const result = await createFollowupReminder(mockUserId, {
        threadId: mockThreadId,
        emailId: mockEmailId,
        reminderDate: reminderDate.toISOString(),
        priority: "normal",
      });

      expect(result).toBeDefined();
      expect(result.threadId).toBe(mockThreadId);
      expect(result.status).toBe("pending");
    });
  });

  describe("listFollowupReminders", () => {
    it("should list pending reminders", async () => {
      const db = await getDb();
      if (db) {
        const mockReminders = [
          {
            id: 1,
            userId: mockUserId,
            threadId: mockThreadId,
            reminderDate: new Date().toISOString(),
            status: "pending",
            priority: "normal",
            sentAt: new Date().toISOString(),
            autoCreated: false,
          },
        ];

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockReminders),
            }),
          }),
        } as any);
      }

      const result = await listFollowupReminders(mockUserId, {
        status: "pending",
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("markFollowupComplete", () => {
    it("should mark reminder as completed", async () => {
      const db = await getDb();
      if (db) {
        const mockUpdate = vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: mockUserId,
                  threadId: mockThreadId,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                },
              ]),
            }),
          }),
        });

        vi.mocked(db.update).mockReturnValue(mockUpdate as any);
      }

      const result = await markFollowupComplete(mockUserId, 1);

      expect(result).toBeDefined();
      expect(result.status).toBe("completed");
      expect(result.completedAt).toBeDefined();
    });
  });
});
