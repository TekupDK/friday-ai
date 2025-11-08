import type { BillyInvoice } from "../billy";

export interface InvoiceStats {
  total: number;
  unpaidCount: number;
  unpaidAmount: number;
  overdueCount: number;
  overdueAmount: number;
  paidThisMonth: number;
}

export function computeInvoiceStats(
  invoices: BillyInvoice[],
  opts?: { year?: number; now?: Date }
): InvoiceStats {
  const now = opts?.now ?? new Date();
  const thisMonth = now.getMonth();
  const thisYear = opts?.year ?? now.getFullYear();

  const inYear = invoices.filter(inv => {
    const d = inv.entryDate ? new Date(inv.entryDate) : null;
    return !!d && d.getFullYear() === thisYear;
  });
  const data = inYear.length > 0 ? inYear : invoices;

  const total = data.length;
  const unpaid = data.filter(
    inv =>
      (inv.balance || 0) > 0 && inv.state !== "voided" && inv.state !== "draft"
  );
  const unpaidCount = unpaid.length;
  const unpaidAmount = unpaid.reduce((sum, inv) => sum + (inv.balance || 0), 0);

  // Calculate overdue by comparing dueDate with current date
  // Billy API returns state="approved" for unpaid invoices, not state="overdue"
  const overdue = unpaid.filter(inv => {
    if (!inv.dueDate) return false;
    const dueDate = new Date(inv.dueDate);
    return dueDate < now;
  });
  const overdueCount = overdue.length;
  const overdueAmount = overdue.reduce(
    (sum, inv) => sum + (inv.balance || 0),
    0
  );

  // Calculate paid this month by checking balance=0 (since Billy doesn't return state="paid")
  // Use entryDate to determine when invoice was created/entered
  const paidThisMonth = data
    .filter(
      inv =>
        (inv.balance || 0) === 0 &&
        inv.state !== "voided" &&
        inv.state !== "draft"
    )
    .filter(inv => {
      const d = inv.entryDate ? new Date(inv.entryDate) : null;
      return !!d && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, inv) => sum + (inv.grossAmount || 0), 0);

  return {
    total,
    unpaidCount,
    unpaidAmount,
    overdueCount,
    overdueAmount,
    paidThisMonth,
  };
}
