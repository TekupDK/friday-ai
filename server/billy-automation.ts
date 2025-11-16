/**
 * Phase 9.8: Billy Automation Service
 *
 * Automatically creates customers and invoices from leads
 * Provides real-time financial integration.
 */

import {
  createInvoice,
  getInvoices,
  searchCustomerByEmail,
  createCustomer,
} from "./billy";
import { getDb } from "./db";
import { leads, customerProfiles } from "../drizzle/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

interface BillyCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  organizationId?: string;
}

interface InvoiceData {
  customerId: string;
  amount: number;
  description: string;
  dueDate: Date;
  metadata?: Record<string, any>;
}

interface LeadToInvoiceResult {
  success: boolean;
  customerId?: string;
  invoiceId?: string;
  error?: string;
  invoiceUrl?: string;
}

/**
 * Phase 9.8: Billy automation service
 */
export class BillyAutomationService {
  /**
   * Create Billy customer from lead data
   */
  async createCustomerFromLead(leadId: number): Promise<BillyCustomer | null> {
    try {
      console.log(
        `[BillyAutomation] Creating Billy customer from lead ${leadId}`
      );

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Get lead data
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1);

      if (!lead) {
        throw new Error(`Lead ${leadId} not found`);
      }

      // Check if customer already exists in Billy
      const existingCustomer = await searchCustomerByEmail(lead.email || "");
      if (existingCustomer) {
        console.log(
          `[BillyAutomation] Customer already exists: ${existingCustomer.id}`
        );
        return existingCustomer;
      }

      // Create new Billy customer
      const customerData = {
        name: lead.name || "Ukendt Kunde",
        email: lead.email || "",
        phone: lead.phone || "",
        address: lead.company || "", // Use company as address for now
        metadata: {
          leadId: lead.id,
          source: lead.source,
          createdAt: lead.createdAt,
        },
      };

      const billyCustomer = await createCustomer(customerData);

      if (!billyCustomer) {
        throw new Error("Failed to create Billy customer");
      }

      // Update lead with Billy customer ID
      const leadMetadata = (lead.metadata as any) ?? {};
      await db
        .update(leads)
        .set({
          metadata: JSON.stringify({
            ...leadMetadata,
            billyCustomerId: billyCustomer.id,
          }),
        })
        .where(eq(leads.id, leadId));

      console.log(
        `[BillyAutomation] ✅ Created Billy customer: ${billyCustomer.id}`
      );
      return billyCustomer;
    } catch (error) {
      console.error(
        `[BillyAutomation] Error creating customer from lead ${leadId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Create invoice from completed job/lead
   */
  async createInvoiceFromJob(jobData: {
    leadId: number;
    jobType: string;
    hoursWorked: number;
    hourlyRate: number;
    materials?: number;
    travelCost?: number;
    description?: string;
  }): Promise<LeadToInvoiceResult> {
    try {
      console.log(
        `[BillyAutomation] Creating invoice for job from lead ${jobData.leadId}`
      );

      const db = await getDb();
      if (!db) {
        return {
          success: false,
          error: "Database not available",
        };
      }

      // Get lead data
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, jobData.leadId))
        .limit(1);

      if (!lead) {
        return {
          success: false,
          error: `Lead ${jobData.leadId} not found`,
        };
      }

      // Get or create Billy customer
      let billyCustomer: BillyCustomer | null = null;

      // Check if customer already exists
      const leadMetadata = (lead.metadata as any) ?? {};
      if (leadMetadata.billyCustomerId) {
        billyCustomer = await searchCustomerByEmail(lead.email || "");
      }

      // Create customer if doesn't exist
      if (!billyCustomer) {
        billyCustomer = await this.createCustomerFromLead(jobData.leadId);
      }

      if (!billyCustomer) {
        return {
          success: false,
          error: "Failed to get or create Billy customer",
        };
      }

      // Calculate invoice amount
      const laborCost = jobData.hoursWorked * jobData.hourlyRate;
      const materialsCost = jobData.materials || 0;
      const travelCost = jobData.travelCost || 0;
      const totalAmount = laborCost + materialsCost + travelCost;

      // Create invoice (Billy API format)
      const invoiceData = {
        contactId: billyCustomer.id,
        entryDate: new Date().toISOString(),
        paymentTermsDays: 14,
        lines: [
          {
            description:
              jobData.description ||
              `${jobData.jobType} - ${jobData.hoursWorked} timer`,
            quantity: jobData.hoursWorked,
            unitPrice: jobData.hourlyRate,
          },
        ],
      };

      const invoice = await createInvoice(invoiceData);

      if (!invoice) {
        return {
          success: false,
          error: "Failed to create Billy invoice",
        };
      }

      // Update lead with invoice info
      await db
        .update(leads)
        .set({
          status: "proposal", // Move to proposal stage
          metadata: JSON.stringify({
            ...leadMetadata,
            billyInvoiceId: invoice.id,
            invoiceAmount: totalAmount,
            invoiceDate: new Date().toISOString(),
          }),
        })
        .where(eq(leads.id, jobData.leadId));

      console.log(
        `[BillyAutomation] ✅ Created invoice: ${invoice.id} for ${totalAmount} kr`
      );

      return {
        success: true,
        customerId: billyCustomer.id,
        invoiceId: invoice.id || "",
        invoiceUrl: "", // TODO: Get invoice URL from Billy API
      };
    } catch (error) {
      console.error(
        `[BillyAutomation] Error creating invoice from job:`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get customer invoices and payment status
   */
  async getCustomerInvoices(customerId: string): Promise<any[]> {
    try {
      console.log(
        `[BillyAutomation] Getting invoices for customer ${customerId}`
      );

      const invoices = await getInvoices();

      // Filter invoices for this customer
      const customerInvoices = invoices.filter(
        invoice => invoice.contactId === customerId
      );

      console.log(
        `[BillyAutomation] Found ${customerInvoices.length} invoices for customer ${customerId}`
      );
      return customerInvoices;
    } catch (error) {
      console.error(
        `[BillyAutomation] Error getting customer invoices:`,
        error
      );
      return [];
    }
  }

  /**
   * Sync lead status with Billy payment status
   */
  async syncPaymentStatus(invoiceId: string): Promise<boolean> {
    try {
      console.log(
        `[BillyAutomation] Syncing payment status for invoice ${invoiceId}`
      );

      const db = await getDb();

      // Get invoice from Billy
      const invoices = await getInvoices();
      const invoice = invoices.find(inv => inv.id === invoiceId);

      if (!invoice) {
        console.error(`[BillyAutomation] Invoice ${invoiceId} not found`);
        return false;
      }

      // Find corresponding lead
      if (!db) {
        console.error("[BillyAutomation] Database not available");
        return false;
      }
      const [lead] = await db
        .select()
        .from(leads)
        .where(sql`metadata::text LIKE '%${invoiceId}%'`)
        .limit(1);

      if (!lead) {
        console.error(
          `[BillyAutomation] Lead for invoice ${invoiceId} not found`
        );
        return false;
      }

      // Update lead status based on payment
      let newStatus = lead.status;
      if (invoice.state === "paid") {
        newStatus = "won";
      } else if (invoice.state === "overdue") {
        newStatus = "proposal"; // Still in proposal, but overdue
      }

      if (newStatus !== lead.status) {
        await db
          .update(leads)
          .set({
            status: newStatus,
            updatedAt: new Date().toISOString(),
            metadata: JSON.stringify({
              ...((lead.metadata as any) ?? {}),
              paymentStatus: invoice.state,
              paymentDate: invoice.approvedTime ?? invoice.dueDate ?? null,
            }),
          })
          .where(eq(leads.id, lead.id));

        console.log(
          `[BillyAutomation] ✅ Updated lead ${lead.id} status to ${newStatus}`
        );
      }

      return true;
    } catch (error) {
      console.error(`[BillyAutomation] Error syncing payment status:`, error);
      return false;
    }
  }

  /**
   * Get financial summary for leads
   */
  async getFinancialSummary(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRevenue: number;
    totalInvoices: number;
    paidInvoices: number;
    outstandingInvoices: number;
    averageInvoiceAmount: number;
    revenueBySource: Record<string, number>;
  }> {
    try {
      console.log(
        `[BillyAutomation] Getting financial summary for ${startDate.toISOString()} to ${endDate.toISOString()}`
      );

      const db = await getDb();
      if (!db) {
        return {
          totalRevenue: 0,
          totalInvoices: 0,
          paidInvoices: 0,
          outstandingInvoices: 0,
          averageInvoiceAmount: 0,
          revenueBySource: {},
        };
      }

      // Get leads with invoices in the period
      const leadsWithInvoices = await db
        .select()
        .from(leads)
        .where(
          and(
            gte(leads.updatedAt, startDate.toISOString()),
            lte(leads.updatedAt, endDate.toISOString()),
            sql`metadata::text LIKE '%billyInvoiceId%'`
          )
        );

      const invoices = await getInvoices();
      const periodInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.createdTime);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });

      const totalRevenue = periodInvoices.reduce(
        (sum, inv) => sum + (inv.amount || 0),
        0
      );
      const paidInvoices = periodInvoices.filter(inv => inv.isPaid).length;
      const outstandingInvoices = periodInvoices.filter(inv => !inv.isPaid).length;
      const averageInvoiceAmount =
        periodInvoices.length > 0 ? totalRevenue / periodInvoices.length : 0;

      // Revenue by source
      const revenueBySource: Record<string, number> = {};

      for (const lead of leadsWithInvoices) {
        const leadMetadata = (lead.metadata as any) ?? {};
        const invoice = periodInvoices.find(
          inv => inv.id === leadMetadata.billyInvoiceId
        );

        if (invoice && lead.source) {
          revenueBySource[lead.source] =
            (revenueBySource[lead.source] || 0) + (invoice.amount || 0);
        }
      }

      const summary = {
        totalRevenue,
        totalInvoices: periodInvoices.length,
        paidInvoices,
        outstandingInvoices,
        averageInvoiceAmount,
        revenueBySource,
      };

      console.log(`[BillyAutomation] ✅ Financial summary:`, summary);
      return summary;
    } catch (error) {
      console.error(
        `[BillyAutomation] Error getting financial summary:`,
        error
      );
      return {
        totalRevenue: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        outstandingInvoices: 0,
        averageInvoiceAmount: 0,
        revenueBySource: {},
      };
    }
  }

  /**
   * Auto-create customer from high-confidence lead
   */
  async autoCreateCustomer(
    leadId: number,
    confidence: number
  ): Promise<boolean> {
    try {
      // Only auto-create for high confidence leads (>90%)
      if (confidence < 90) {
        console.log(
          `[BillyAutomation] Confidence too low (${confidence}%) for auto-creation`
        );
        return false;
      }

      const customer = await this.createCustomerFromLead(leadId);
      return customer !== null;
    } catch (error) {
      console.error(
        `[BillyAutomation] Error in auto-creating customer:`,
        error
      );
      return false;
    }
  }
}

// Singleton instance
export const billyAutomation = new BillyAutomationService();
