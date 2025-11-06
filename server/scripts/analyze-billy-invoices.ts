import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface BillyInvoice {
  id: string;
  type: "invoice" | "creditNote";
  createdTime: string;
  approvedTime: string;
  entryDate: string;
  state: string;
  sentState: string;
  isPaid: boolean;
  amount: number;
  tax: number;
  grossAmount: number;
  balance: number;
  currencyId: string;
  invoiceNo: string;
  contactId: string;
  lineDescription?: string;
  contactMessage?: string;
}

interface BillyApiResponse {
  timestamp: string;
  totalInvoices: number;
  invoices: BillyInvoice[];
}

interface InvoiceAnalysis {
  summary: {
    totalInvoices: number;
    totalRevenue: number;
    totalTax: number;
    totalOutstanding: number;
    totalPaid: number;
    analysisDate: string;
  };
  breakdown: {
    byType: Record<string, { count: number; revenue: number }>;
    byState: Record<string, { count: number; revenue: number }>;
    byPaymentStatus: {
      paid: { count: number; revenue: number };
      unpaid: { count: number; revenue: number };
    };
  };
  timeline: {
    byMonth: Record<
      string,
      { count: number; revenue: number; paid: number; unpaid: number }
    >;
    recentActivity: Array<{
      date: string;
      invoiceNo: string;
      amount: number;
      type: string;
      state: string;
    }>;
  };
  insights: {
    averageInvoiceValue: number;
    largestInvoice: { invoiceNo: string; amount: number; date: string };
    smallestInvoice: { invoiceNo: string; amount: number; date: string };
    paymentRate: number;
    mostCommonState: string;
    trends: string[];
  };
}

function analyzeInvoices(data: BillyApiResponse): InvoiceAnalysis {
  const invoices = data.invoices;

  // Summary calculations
  const totalRevenue = invoices.reduce(
    (sum, inv) =>
      sum +
      (inv.type === "invoice"
        ? inv.grossAmount
        : inv.type === "creditNote"
          ? -inv.grossAmount
          : 0),
    0
  );
  const totalTax = invoices.reduce(
    (sum, inv) =>
      sum +
      (inv.type === "invoice"
        ? inv.tax
        : inv.type === "creditNote"
          ? -inv.tax
          : 0),
    0
  );
  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + (inv.isPaid ? 0 : inv.balance),
    0
  );
  const totalPaid = invoices.reduce(
    (sum, inv) => sum + (inv.isPaid ? inv.grossAmount : 0),
    0
  );

  // Breakdown by type
  const byType: Record<string, { count: number; revenue: number }> = {};
  invoices.forEach(inv => {
    if (!byType[inv.type]) {
      byType[inv.type] = { count: 0, revenue: 0 };
    }
    byType[inv.type].count++;
    const amount =
      inv.type === "creditNote" ? -inv.grossAmount : inv.grossAmount;
    byType[inv.type].revenue += amount;
  });

  // Breakdown by state
  const byState: Record<string, { count: number; revenue: number }> = {};
  invoices.forEach(inv => {
    if (!byState[inv.state]) {
      byState[inv.state] = { count: 0, revenue: 0 };
    }
    byState[inv.state].count++;
    const amount =
      inv.type === "creditNote" ? -inv.grossAmount : inv.grossAmount;
    byState[inv.state].revenue += amount;
  });

  // Payment status
  const paidInvoices = invoices.filter(inv => inv.isPaid);
  const unpaidInvoices = invoices.filter(inv => !inv.isPaid);
  const byPaymentStatus = {
    paid: {
      count: paidInvoices.length,
      revenue: paidInvoices.reduce(
        (sum, inv) =>
          sum +
          (inv.type === "creditNote" ? -inv.grossAmount : inv.grossAmount),
        0
      ),
    },
    unpaid: {
      count: unpaidInvoices.length,
      revenue: unpaidInvoices.reduce(
        (sum, inv) =>
          sum +
          (inv.type === "creditNote" ? -inv.grossAmount : inv.grossAmount),
        0
      ),
    },
  };

  // Timeline by month
  const byMonth: Record<
    string,
    { count: number; revenue: number; paid: number; unpaid: number }
  > = {};
  invoices.forEach(inv => {
    const month = inv.entryDate.substring(0, 7); // YYYY-MM
    if (!byMonth[month]) {
      byMonth[month] = { count: 0, revenue: 0, paid: 0, unpaid: 0 };
    }
    byMonth[month].count++;
    const amount =
      inv.type === "creditNote" ? -inv.grossAmount : inv.grossAmount;
    byMonth[month].revenue += amount;
    if (inv.isPaid) {
      byMonth[month].paid += amount;
    } else {
      byMonth[month].unpaid += amount;
    }
  });

  // Recent activity (last 10 invoices by entry date)
  const recentActivity = invoices
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate))
    .slice(0, 10)
    .map(inv => ({
      date: inv.entryDate,
      invoiceNo: inv.invoiceNo,
      amount: inv.grossAmount,
      type: inv.type,
      state: inv.state,
    }));

  // Insights
  const invoiceAmounts = invoices.map(inv => ({
    invoiceNo: inv.invoiceNo,
    amount: inv.grossAmount,
    date: inv.entryDate,
  }));
  const sortedByAmount = [...invoiceAmounts].sort((a, b) => b.amount - a.amount);
  const largestInvoice = sortedByAmount[0];
  const smallestInvoice = sortedByAmount[sortedByAmount.length - 1];

  const averageInvoiceValue =
    invoices.length > 0 ? totalRevenue / invoices.length : 0;
  const paymentRate =
    invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0;

  // Most common state
  const stateEntries = Object.entries(byState).sort(
    (a, b) => b[1].count - a[1].count
  );
  const mostCommonState = stateEntries[0]?.[0] || "unknown";

  // Trends
  const trends: string[] = [];
  const monthKeys = Object.keys(byMonth).sort();
  if (monthKeys.length >= 2) {
    const lastMonth = byMonth[monthKeys[monthKeys.length - 1]];
    const prevMonth = byMonth[monthKeys[monthKeys.length - 2]];
    const revenueChange =
      ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
    if (revenueChange > 10) {
      trends.push(
        `Revenue increased by ${revenueChange.toFixed(1)}% from previous month`
      );
    } else if (revenueChange < -10) {
      trends.push(
        `Revenue decreased by ${Math.abs(revenueChange).toFixed(1)}% from previous month`
      );
    }
  }

  if (paymentRate < 50) {
    trends.push(`Low payment rate (${paymentRate.toFixed(1)}%) - many unpaid invoices`);
  } else if (paymentRate > 80) {
    trends.push(`High payment rate (${paymentRate.toFixed(1)}%) - good collection`);
  }

  const creditNotes = invoices.filter(inv => inv.type === "creditNote");
  if (creditNotes.length > invoices.length * 0.1) {
    trends.push(
      `High credit note rate (${((creditNotes.length / invoices.length) * 100).toFixed(1)}%) - review refund processes`
    );
  }

  return {
    summary: {
      totalInvoices: invoices.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      analysisDate: new Date().toISOString(),
    },
    breakdown: {
      byType,
      byState,
      byPaymentStatus,
    },
    timeline: {
      byMonth,
      recentActivity,
    },
    insights: {
      averageInvoiceValue: Math.round(averageInvoiceValue * 100) / 100,
      largestInvoice,
      smallestInvoice,
      paymentRate: Math.round(paymentRate * 100) / 100,
      mostCommonState,
      trends,
    },
  };
}

async function main() {
  console.log("📊 Billy Invoice Analysis");
  console.log("=".repeat(50));

  // Read the Billy API response
  const dataPath = join(process.cwd(), "billy-api-response.json");
  const rawData = readFileSync(dataPath, "utf-8");
  const data: BillyApiResponse = JSON.parse(rawData);

  console.log(`\n📁 Loaded ${data.totalInvoices} invoices from Billy API`);
  console.log(`📅 Data timestamp: ${data.timestamp}\n`);

  // Perform analysis
  const analysis = analyzeInvoices(data);

  // Display summary
  console.log("💰 SUMMARY");
  console.log("-".repeat(50));
  console.log(`Total Invoices: ${analysis.summary.totalInvoices}`);
  console.log(
    `Total Revenue: ${analysis.summary.totalRevenue.toLocaleString()} DKK`
  );
  console.log(`Total Tax: ${analysis.summary.totalTax.toLocaleString()} DKK`);
  console.log(
    `Total Paid: ${analysis.summary.totalPaid.toLocaleString()} DKK`
  );
  console.log(
    `Total Outstanding: ${analysis.summary.totalOutstanding.toLocaleString()} DKK`
  );

  // Display breakdown
  console.log("\n📦 BREAKDOWN BY TYPE");
  console.log("-".repeat(50));
  Object.entries(analysis.breakdown.byType).forEach(([type, stats]) => {
    console.log(
      `${type}: ${stats.count} invoices, ${stats.revenue.toLocaleString()} DKK`
    );
  });

  console.log("\n📋 BREAKDOWN BY STATE");
  console.log("-".repeat(50));
  Object.entries(analysis.breakdown.byState).forEach(([state, stats]) => {
    console.log(
      `${state}: ${stats.count} invoices, ${stats.revenue.toLocaleString()} DKK`
    );
  });

  console.log("\n💳 PAYMENT STATUS");
  console.log("-".repeat(50));
  console.log(
    `Paid: ${analysis.breakdown.byPaymentStatus.paid.count} invoices, ${analysis.breakdown.byPaymentStatus.paid.revenue.toLocaleString()} DKK`
  );
  console.log(
    `Unpaid: ${analysis.breakdown.byPaymentStatus.unpaid.count} invoices, ${analysis.breakdown.byPaymentStatus.unpaid.revenue.toLocaleString()} DKK`
  );

  console.log("\n📈 INSIGHTS");
  console.log("-".repeat(50));
  console.log(
    `Average Invoice Value: ${analysis.insights.averageInvoiceValue.toLocaleString()} DKK`
  );
  console.log(
    `Payment Rate: ${analysis.insights.paymentRate}% (${analysis.breakdown.byPaymentStatus.paid.count}/${analysis.summary.totalInvoices})`
  );
  console.log(`Most Common State: ${analysis.insights.mostCommonState}`);
  console.log(
    `Largest Invoice: #${analysis.insights.largestInvoice.invoiceNo} - ${analysis.insights.largestInvoice.amount.toLocaleString()} DKK (${analysis.insights.largestInvoice.date})`
  );
  console.log(
    `Smallest Invoice: #${analysis.insights.smallestInvoice.invoiceNo} - ${analysis.insights.smallestInvoice.amount.toLocaleString()} DKK (${analysis.insights.smallestInvoice.date})`
  );

  if (analysis.insights.trends.length > 0) {
    console.log("\n🔍 TRENDS");
    console.log("-".repeat(50));
    analysis.insights.trends.forEach(trend => {
      console.log(`• ${trend}`);
    });
  }

  console.log("\n📅 MONTHLY TIMELINE");
  console.log("-".repeat(50));
  const sortedMonths = Object.keys(analysis.timeline.byMonth).sort();
  sortedMonths.slice(-6).forEach(month => {
    const data = analysis.timeline.byMonth[month];
    console.log(
      `${month}: ${data.count} invoices, ${data.revenue.toLocaleString()} DKK (${data.paid.toLocaleString()} paid, ${data.unpaid.toLocaleString()} unpaid)`
    );
  });

  console.log("\n🕐 RECENT ACTIVITY (Last 10 invoices)");
  console.log("-".repeat(50));
  analysis.timeline.recentActivity.forEach(activity => {
    console.log(
      `${activity.date} - Invoice #${activity.invoiceNo}: ${activity.amount.toLocaleString()} DKK (${activity.type}, ${activity.state})`
    );
  });

  // Save analysis to file
  const outputPath = join(process.cwd(), "billy-invoice-analysis.json");
  writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
  console.log(`\n✅ Analysis saved to ${outputPath}`);
}

main().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
