/**
 * AI Mocking Helper for Tests
 * Intercepts AI requests and returns mock responses
 */

import { Page } from "@playwright/test";

export interface MockAIOptions {
  delay?: number; // Delay in ms before responding
  response?: string; // Custom response text
  shouldFail?: boolean; // Simulate AI failure
}

/**
 * Mock AI responses with Phase 2 features (tools, context)
 */
export async function mockAIResponses(page: Page, options: MockAIOptions = {}) {
  const {
    delay = 500,
    response = "Dette er en mock AI response. Jeg kan hjælpe dig med at administrere emails, kalender, fakturaer og leads. Jeg har adgang til Gmail, Google Kalender og Billy.",
    shouldFail = false,
  } = options;

  await page.route("**/api/trpc/chat.sendMessage*", async route => {
    if (shouldFail) {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "AI fejlede" }),
      });
      return;
    }

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, delay));

    // Return mock response (simulating tools + context processing)
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          data: {
            id: Date.now(),
            conversationId: 1,
            role: "user",
            content: "Mock message",
            createdAt: new Date().toISOString(),
          },
        },
      }),
    });
  });

  // Mock getMessages to include AI response
  await page.route("**/api/trpc/chat.getMessages*", async route => {
    const url = new URL(route.request().url());
    const input = url.searchParams.get("input");

    if (!input) {
      await route.continue();
      return;
    }

    const parsedInput = JSON.parse(input);
    const conversationId = parsedInput.conversationId;

    // Return mock messages
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          data: {
            messages: [
              {
                id: 1,
                conversationId,
                role: "user",
                content: "Test message",
                createdAt: new Date().toISOString(),
              },
              {
                id: 2,
                conversationId,
                role: "assistant",
                content: response,
                createdAt: new Date().toISOString(),
              },
            ],
            hasMore: false,
            nextCursor: undefined,
          },
        },
      }),
    });
  });
}

/**
 * Mock conversation creation
 */
export async function mockConversationCreation(page: Page) {
  await page.route("**/api/trpc/chat.createConversation*", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          data: {
            id: 1,
            userId: 1,
            title: "Friday AI Chat",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      }),
    });
  });
}

/**
 * Enable all mocks for fast testing
 */
export async function enableAllMocks(page: Page, options: MockAIOptions = {}) {
  await mockConversationCreation(page);
  await mockAIResponses(page, options);
}
