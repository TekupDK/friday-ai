import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Billy API calls used by executeCreateInvoice
const createInvoiceMock = vi.fn(async () => ({
  id: "inv_test_1",
  organizationId: "org_1",
  invoiceNo: null,
  contactId: "cust_1",
  createdTime: new Date().toISOString(),
  entryDate: new Date().toISOString().split("T")[0],
  state: "draft",
  sentState: "unsent",
  isPaid: false,
  amount: 0,
  tax: 0,
  grossAmount: 0,
  balance: 0,
  currencyId: "DKK",
  exchangeRate: 1,
})) as any;

vi.mock("../billy", () => {
  return {
    getCustomers: vi.fn(async () => [
      { id: "cust_1", name: "Acme A/S", organizationId: "org_1" },
    ]),
    createInvoice: createInvoiceMock,
  };
});

describe("invoice idempotency", () => {
  beforeEach(() => {
    createInvoiceMock.mockClear();
  });

  it("prevents duplicate invoice creation for same user/customer/date/lines", async () => {
    const { executeAction } = await import("../intent-actions");

    const intent = {
      intent: "create_invoice" as const,
      params: { customerName: "Acme", description: "Fast rengøring 2 arbejdstimer" },
      confidence: 1.0,
    };

    // First call should create invoice (mock called once)
    const res1 = await executeAction(intent, 42, { correlationId: "test-corr-1" });
    expect(res1.success).toBe(true);
    expect(createInvoiceMock).toHaveBeenCalledTimes(1);

    // Second call with same params on same day should be idempotent (no extra API call)
    const res2 = await executeAction(intent, 42, { correlationId: "test-corr-2" });
    expect(res2.success).toBe(true);
    expect(createInvoiceMock).toHaveBeenCalledTimes(1);
  });
});
