import { getInvoices, type BillyInvoice } from "./server/billy";

async function testBillyApi() {
  try {
    console.log("[Test] Fetching Billy invoices...");
    const invoices = await getInvoices();

    console.log(`[Test] Total invoices: ${invoices.length}`);

    if (invoices.length > 0) {
      const sample = invoices.slice(0, 5).map((inv: BillyInvoice) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        amount: inv.amount,
        balance: inv.balance,
        grossAmount: inv.grossAmount,
        state: inv.state,
        entryDate: inv.entryDate,
      }));

      console.log("\n[Test] Sample invoices:");
      console.log(JSON.stringify(sample, null, 2));

      // Check stats calculation
      const { computeInvoiceStats } = await import(
        "./server/utils/invoice-stats"
      );
      const stats = computeInvoiceStats(invoices);

      console.log("\n[Test] Computed stats:");
      console.log(JSON.stringify(stats, null, 2));

      // Check for overdue invoices
      const overdueInvoices = invoices.filter(inv => inv.state === "overdue");
      console.log(`\n[Test] Overdue invoices: ${overdueInvoices.length}`);

      // Check all unique states
      const states = [...new Set(invoices.map(inv => inv.state))];
      console.log(`[Test] All invoice states: ${states.join(", ")}`);

      // Count by state
      const stateCounts: Record<string, number> = {};
      invoices.forEach(inv => {
        stateCounts[inv.state] = (stateCounts[inv.state] || 0) + 1;
      });
      console.log("[Test] State counts:", stateCounts);

      // Check unpaid invoices with dueDate
      const unpaidInvoices = invoices.filter(
        inv =>
          (inv.balance || 0) > 0 &&
          inv.state !== "voided" &&
          inv.state !== "draft"
      );
      console.log(`\n[Test] Unpaid invoices: ${unpaidInvoices.length}`);

      const now = new Date();
      const overdueByDate = unpaidInvoices.filter(inv => {
        if (!inv.dueDate) return false;
        const due = new Date(inv.dueDate);
        return due < now;
      });

      console.log(`[Test] Overdue by dueDate: ${overdueByDate.length}`);
      if (overdueByDate.length > 0) {
        console.log("[Test] Sample overdue invoice:");
        console.log(JSON.stringify(overdueByDate[0], null, 2));
      }
    }
  } catch (error: any) {
    console.error("[Test] Error:", error.message);
    console.error(error);
  }
}

testBillyApi();
