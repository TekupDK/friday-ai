/**
 * Friday AI Import Validation Script
 *
 * Validates that v4.3.5 lead data was correctly imported into Supabase.
 * Reports counts, data quality, and highlights any issues.
 *
 * Usage:
 *   npx tsx server/scripts/validate-import.ts
 */

import * as dotenv from "dotenv";
import { eq, sql } from "drizzle-orm";

import {
  leads,
  customerProfiles,
  customerInvoices,
} from "../../drizzle/schema";
import { getDb, getUserByOpenId } from "../db";

dotenv.config({ path: ".env.supabase" });
dotenv.config();

interface ValidationReport {
  leads: {
    total: number;
    v4_3_5: number;
    withCustomerProfiles: number;
    withInvoices: number;
    byStatus: Record<string, number>;
    premiumCustomers: number;
    recurringCustomers: number;
  };
  customerProfiles: {
    total: number;
    withLeads: number;
    byStatus: Record<string, number>;
    totalInvoiced: number;
    totalPaid: number;
  };
  invoices: {
    total: number;
    byStatus: Record<string, number>;
    totalAmount: number;
    paidAmount: number;
  };
  dataQuality: {
    leadsWithoutEmail: number;
    leadsWithoutPhone: number;
    syntheticEmails: number;
    profilesWithoutInvoices: number;
  };
}

async function main() {
  console.log("🔍 Validating v4.3.5 import...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const ownerOpenId = process.env.OWNER_OPEN_ID || "";
  if (!ownerOpenId) {
    throw new Error("OWNER_OPEN_ID missing");
  }

  const ownerUser = await getUserByOpenId(ownerOpenId);
  if (!ownerUser) {
    throw new Error(`Owner user not found: ${ownerOpenId}`);
  }

  const userId = ownerUser.id;

  const report: ValidationReport = {
    leads: {
      total: 0,
      v4_3_5: 0,
      withCustomerProfiles: 0,
      withInvoices: 0,
      byStatus: {},
      premiumCustomers: 0,
      recurringCustomers: 0,
    },
    customerProfiles: {
      total: 0,
      withLeads: 0,
      byStatus: {},
      totalInvoiced: 0,
      totalPaid: 0,
    },
    invoices: {
      total: 0,
      byStatus: {},
      totalAmount: 0,
      paidAmount: 0,
    },
    dataQuality: {
      leadsWithoutEmail: 0,
      leadsWithoutPhone: 0,
      syntheticEmails: 0,
      profilesWithoutInvoices: 0,
    },
  };

  // Validate Leads
  console.log("📊 Analyzing leads...");
  const allLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.userId, userId));

  report.leads.total = allLeads.length;

  for (const lead of allLeads) {
    // Check if from v4.3.5
    const metadata = lead.metadata as any;
    if (metadata?.datasetVersion === "4.3.5") {
      report.leads.v4_3_5 += 1;
    }

    // Status count
    const leadStatusKey = lead.status || "unknown";
    report.leads.byStatus[leadStatusKey] =
      (report.leads.byStatus[leadStatusKey] || 0) + 1;

    // Check for customer profile
    const profile = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.leadId, lead.id))
      .limit(1);
    if (profile.length > 0 && profile[0]) {
      report.leads.withCustomerProfiles += 1;

      // Check for invoices
      const invoices = await db
        .select()
        .from(customerInvoices)
        .where(eq(customerInvoices.customerId, profile[0].id))
        .limit(1);
      if (invoices.length > 0) {
        report.leads.withInvoices += 1;
      }
    }

    // Premium/Recurring tags
    if (metadata?.customer?.customerType === "premium") {
      report.leads.premiumCustomers += 1;
    }
    if (metadata?.customer?.isRecurring) {
      report.leads.recurringCustomers += 1;
    }

    // Data quality
    if (!lead.email) {
      report.dataQuality.leadsWithoutEmail += 1;
    }
    if (!lead.phone) {
      report.dataQuality.leadsWithoutPhone += 1;
    }
    if (metadata?.syntheticEmail) {
      report.dataQuality.syntheticEmails += 1;
    }
  }

  // Validate Customer Profiles
  console.log("👥 Analyzing customer profiles...");
  const allProfiles = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId));

  report.customerProfiles.total = allProfiles.length;

  for (const profile of allProfiles) {
    if (profile.leadId) {
      report.customerProfiles.withLeads += 1;
    }

    const statusKey = profile.status || "unknown";
    report.customerProfiles.byStatus[statusKey] =
      (report.customerProfiles.byStatus[statusKey] || 0) + 1;

    report.customerProfiles.totalInvoiced += profile.totalInvoiced || 0;
    report.customerProfiles.totalPaid += profile.totalPaid || 0;

    // Check for invoices
    const invoices = await db
      .select()
      .from(customerInvoices)
      .where(eq(customerInvoices.customerId, profile.id));
    if (invoices.length === 0) {
      report.dataQuality.profilesWithoutInvoices += 1;
    }
  }

  // Validate Invoices
  console.log("💰 Analyzing invoices...");
  const allInvoices = await db
    .select()
    .from(customerInvoices)
    .where(eq(customerInvoices.userId, userId));

  report.invoices.total = allInvoices.length;

  for (const invoice of allInvoices) {
    const invoiceStatusKey = invoice.status || "unknown";
    report.invoices.byStatus[invoiceStatusKey] =
      (report.invoices.byStatus[invoiceStatusKey] || 0) + 1;

    const amount = parseFloat(invoice.amount || "0");
    const paidAmount = parseFloat(invoice.paidAmount || "0");

    report.invoices.totalAmount += amount;
    report.invoices.paidAmount += paidAmount;
  }

  // Print report
  console.log("\n" + "=".repeat(60));
  console.log("📋 VALIDATION REPORT");
  console.log("=".repeat(60));

  console.log("\n📌 LEADS:");
  console.log(`   Total:                  ${report.leads.total}`);
  console.log(`   From v4.3.5:            ${report.leads.v4_3_5}`);
  console.log(
    `   With customer profiles: ${report.leads.withCustomerProfiles}`
  );
  console.log(`   With invoices:          ${report.leads.withInvoices}`);
  console.log(`   Premium customers:      ${report.leads.premiumCustomers}`);
  console.log(`   Recurring customers:    ${report.leads.recurringCustomers}`);
  console.log("\n   By Status:");
  for (const [status, count] of Object.entries(report.leads.byStatus)) {
    console.log(`      ${status.padEnd(12)}: ${count}`);
  }

  console.log("\n👥 CUSTOMER PROFILES:");
  console.log(`   Total:              ${report.customerProfiles.total}`);
  console.log(`   With leads:         ${report.customerProfiles.withLeads}`);
  console.log(
    `   Total invoiced:     ${(report.customerProfiles.totalInvoiced / 100).toFixed(2)} kr`
  );
  console.log(
    `   Total paid:         ${(report.customerProfiles.totalPaid / 100).toFixed(2)} kr`
  );
  console.log("\n   By Status:");
  for (const [status, count] of Object.entries(
    report.customerProfiles.byStatus
  )) {
    console.log(`      ${status.padEnd(12)}: ${count}`);
  }

  console.log("\n💰 INVOICES:");
  console.log(`   Total:         ${report.invoices.total}`);
  console.log(`   Total amount:  ${report.invoices.totalAmount.toFixed(2)} kr`);
  console.log(`   Paid amount:   ${report.invoices.paidAmount.toFixed(2)} kr`);
  console.log("\n   By Status:");
  for (const [status, count] of Object.entries(report.invoices.byStatus)) {
    console.log(`      ${status.padEnd(12)}: ${count}`);
  }

  console.log("\n🔍 DATA QUALITY:");
  console.log(
    `   Leads without email:       ${report.dataQuality.leadsWithoutEmail}`
  );
  console.log(
    `   Leads without phone:       ${report.dataQuality.leadsWithoutPhone}`
  );
  console.log(
    `   Synthetic emails used:     ${report.dataQuality.syntheticEmails}`
  );
  console.log(
    `   Profiles without invoices: ${report.dataQuality.profilesWithoutInvoices}`
  );

  console.log("\n" + "=".repeat(60));

  // Validation checks
  const warnings: string[] = [];

  if (report.leads.v4_3_5 === 0) {
    warnings.push("⚠️  No leads from v4.3.5 found!");
  }

  if (report.leads.withCustomerProfiles < report.leads.v4_3_5 * 0.9) {
    warnings.push(
      "⚠️  Less than 90% of leads have customer profiles - check linkage"
    );
  }

  if (report.dataQuality.syntheticEmails > report.leads.total * 0.1) {
    warnings.push(
      "⚠️  More than 10% synthetic emails - consider data quality improvement"
    );
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  WARNINGS:");
    warnings.forEach(w => console.log(`   ${w}`));
  } else {
    console.log("\n✅ All validation checks passed!");
  }

  console.log("\n");
  process.exit(0);
}

void main().catch(error => {
  console.error("❌ Validation failed:", error);
  process.exit(1);
});
