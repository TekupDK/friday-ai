/**
 * Invoice Creation Tests
 * Tests critical business logic for invoice creation via Billy API
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInvoice, type BillyInvoice } from "../billy";

// Mock fetch for Billy API calls
const fetchMock = vi.fn();

describe("Invoice Creation - Billy API Integration", () => {
  beforeEach(() => {
    fetchMock.mockClear();
    global.fetch = fetchMock as any;
  });

  it("should create invoice with required fields", async () => {
    const mockInvoice: BillyInvoice = {
      id: "inv_123",
      organizationId: "org_1",
      invoiceNo: "INV-2025-001",
      contactId: "cust_1",
      createdTime: new Date().toISOString(),
      entryDate: "2025-01-28",
      state: "draft",
      sentState: "unsent",
      isPaid: false,
      amount: 1000,
      tax: 250,
      grossAmount: 1250,
      balance: 1250,
      currencyId: "DKK",
      exchangeRate: 1,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoice: mockInvoice }),
    });

    const result = await createInvoice({
      contactId: "cust_1",
      entryDate: "2025-01-28",
      lines: [
        {
          description: "Fast rengøring",
          quantity: 2,
          unitPrice: 500,
        },
      ],
    });

    expect(result).toEqual(mockInvoice);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/invoices"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("contactId"),
      })
    );
  });

  it("should include payment terms when provided", async () => {
    const mockInvoice: BillyInvoice = {
      id: "inv_123",
      organizationId: "org_1",
      invoiceNo: null,
      contactId: "cust_1",
      createdTime: new Date().toISOString(),
      entryDate: "2025-01-28",
      state: "draft",
      sentState: "unsent",
      isPaid: false,
      amount: 1000,
      tax: 250,
      grossAmount: 1250,
      balance: 1250,
      currencyId: "DKK",
      exchangeRate: 1,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoice: mockInvoice }),
    });

    await createInvoice({
      contactId: "cust_1",
      entryDate: "2025-01-28",
      paymentTermsDays: 30,
      lines: [
        {
          description: "Service",
          quantity: 1,
          unitPrice: 1000,
        },
      ],
    });

    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(callBody.invoice.paymentTermsDays).toBe(30);
  });

  it("should default payment terms to 14 days when not provided", async () => {
    const mockInvoice: BillyInvoice = {
      id: "inv_123",
      organizationId: "org_1",
      invoiceNo: null,
      contactId: "cust_1",
      createdTime: new Date().toISOString(),
      entryDate: "2025-01-28",
      state: "draft",
      sentState: "unsent",
      isPaid: false,
      amount: 1000,
      tax: 250,
      grossAmount: 1250,
      balance: 1250,
      currencyId: "DKK",
      exchangeRate: 1,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoice: mockInvoice }),
    });

    await createInvoice({
      contactId: "cust_1",
      entryDate: "2025-01-28",
      lines: [
        {
          description: "Service",
          quantity: 1,
          unitPrice: 1000,
        },
      ],
    });

    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(callBody.invoice.paymentTermsDays).toBe(14);
  });

  it("should handle API errors gracefully", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Invalid contact ID",
    });

    await expect(
      createInvoice({
        contactId: "invalid",
        entryDate: "2025-01-28",
        lines: [
          {
            description: "Service",
            quantity: 1,
            unitPrice: 1000,
          },
        ],
      })
    ).rejects.toThrow("Billy API error");
  });

  it("should include correlation ID when provided", async () => {
    const mockInvoice: BillyInvoice = {
      id: "inv_123",
      organizationId: "org_1",
      invoiceNo: null,
      contactId: "cust_1",
      createdTime: new Date().toISOString(),
      entryDate: "2025-01-28",
      state: "draft",
      sentState: "unsent",
      isPaid: false,
      amount: 1000,
      tax: 250,
      grossAmount: 1250,
      balance: 1250,
      currencyId: "DKK",
      exchangeRate: 1,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoice: mockInvoice }),
    });

    await createInvoice(
      {
        contactId: "cust_1",
        entryDate: "2025-01-28",
        lines: [
          {
            description: "Service",
            quantity: 1,
            unitPrice: 1000,
          },
        ],
      },
      { correlationId: "test-correlation-123" }
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Correlation-ID": "test-correlation-123",
        }),
      })
    );
  });
});

