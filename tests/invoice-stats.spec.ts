import { describe, expect, it } from "vitest";
import type { BillyInvoice } from "../server/billy";
import { computeInvoiceStats } from "../server/utils/invoice-stats";

function inv(partial: Partial<BillyInvoice>): BillyInvoice {
  return {
    id: "id",
    organizationId: "org",
    invoiceNo: "1",
    contactId: "c",
    createdTime: new Date().toISOString(),
    entryDate: new Date().toISOString().slice(0, 10),
    state: "sent",
    sentState: "unsent",
    isPaid: false,
    amount: 100,
    tax: 25,
    grossAmount: 125,
    balance: 125,
    currencyId: "DKK",
    exchangeRate: 1,
    ...partial,
  };
}

describe("computeInvoiceStats", () => {
  it("computes unpaid, overdue and paidThisMonth correctly", () => {
    const now = new Date("2025-11-06T12:00:00Z");
    const year = now.getFullYear();
    const month = now.getMonth();

    const invoices: BillyInvoice[] = [
      // unpaid (not yet due)
      inv({
        balance: 700,
        grossAmount: 700,
        state: "approved",
        entryDate: `${year}-11-03`,
        dueDate: `${year}-12-03`, // Due in future
      }),
      // overdue (dueDate in past, balance > 0)
      inv({
        balance: 700,
        grossAmount: 700,
        state: "approved",
        entryDate: `${year}-10-31`,
        dueDate: `${year}-10-31`, // Due in past
      }),
      // paid this month (balance = 0, entryDate this month)
      inv({
        balance: 0,
        grossAmount: 1000,
        state: "approved",
        entryDate: `${year}-${String(month + 1).padStart(2, "0")}-01`,
      }),
    ];

    const stats = computeInvoiceStats(invoices, { year, now });
    expect(stats.total).toBe(3);
    expect(stats.unpaidCount).toBe(2); // unpaid includes overdue with balance > 0
    expect(stats.overdueCount).toBe(1); // overdue = unpaid with dueDate < now
    expect(stats.unpaidAmount).toBe(1400);
    expect(stats.overdueAmount).toBe(700);
    expect(stats.paidThisMonth).toBe(1000); // paid = balance 0, entryDate this month
  });
});
