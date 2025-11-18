/**
 * Friday AI + Leads Integration Router
 *
 * Exposes API endpoints for Friday AI to query and analyze customer lead data.
 * Integrates ChromaDB semantic search with Supabase lead database.
 */

import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql, or, ilike, inArray } from "drizzle-orm";
import { z } from "zod";

import {
  leads,
  customerProfiles,
  customerInvoices,
  type CustomerInvoice,
} from "../../drizzle/schema";
import { withDatabaseErrorHandling } from "../_core/error-handling";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";



/**
 * Customer lookup by name, email, or phone
 */
export const fridayLeadsRouter = router({
  /**
   * Search for customer by name, email, or phone
   */
  lookupCustomer: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(500), // ✅ SECURITY: Max length to prevent DoS
        includeInvoices: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const userId = ctx.user.id;

      // ✅ SECURITY FIX: Use parameterized queries with Drizzle's ilike for case-insensitive search
      // ilike properly parameterizes the search value, preventing SQL injection
      // ✅ ERROR HANDLING: Wrap database query with error handling
      const matchingLeads = await withDatabaseErrorHandling(
        async () => {
          return await db
            .select()
            .from(leads)
            .where(
              and(
                eq(leads.userId, userId),
                or(
                  ilike(leads.name, `%${input.query}%`),
                  ilike(leads.email, `%${input.query}%`),
                  ilike(leads.phone, `%${input.query}%`)
                )!
              )
            )
            .limit(10);
        },
        "Failed to search leads"
      );

      if (matchingLeads.length === 0) {
        return {
          found: false,
          customers: [],
        };
      }

      // ✅ PERFORMANCE FIX: Use batch queries instead of N+1 queries
      // Get all customer profiles in one query
      const leadIds = matchingLeads.map(lead => lead.id);
      const allProfiles = await withDatabaseErrorHandling(
        async () => {
          return await db
            .select()
            .from(customerProfiles)
            .where(inArray(customerProfiles.leadId, leadIds));
        },
        "Failed to fetch customer profiles"
      );

      // Create a map for quick lookup: leadId -> profile
      const profileMap = new Map(
        allProfiles.map(profile => [profile.leadId, profile])
      );

      // ✅ PERFORMANCE FIX: Batch fetch all invoices if requested
      let invoicesMap = new Map<number, CustomerInvoice[]>();
      if (input.includeInvoices && allProfiles.length > 0) {
        const customerIds = allProfiles.map(profile => profile.id);
        const allInvoices = await withDatabaseErrorHandling(
          async () => {
            return await db
              .select()
              .from(customerInvoices)
              .where(inArray(customerInvoices.customerId, customerIds))
              .orderBy(desc(customerInvoices.entryDate));
          },
          "Failed to fetch invoices"
        );

        // Group invoices by customerId
        for (const invoice of allInvoices) {
          if (invoice.customerId) {
            const existing = invoicesMap.get(invoice.customerId) || [];
            existing.push(invoice);
            invoicesMap.set(invoice.customerId, existing);
          }
        }
      }

      // Build results using the maps (O(1) lookups)
      const results = matchingLeads.map(lead => {
        const profile = profileMap.get(lead.id) || null;
        const invoices = profile ? (invoicesMap.get(profile.id) || []) : [];

        return {
          lead,
          profile,
          invoices,
        };
      });

      return {
        found: true,
        customers: results,
      };
    }),

  /**
   * Get customer intelligence for Friday AI
   */
  getCustomerIntelligence: protectedProcedure
    .input(
      z.object({
        leadId: z.number().optional(),
        customerId: z.number().optional(),
        email: z.string().email().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const userId = ctx.user.id;

      // Find customer by leadId, customerId, or email
      let profile: any = null;
      let lead: any = null;

      if (input.leadId) {
        const leadResult = await db
          .select()
          .from(leads)
          .where(and(eq(leads.userId, userId), eq(leads.id, input.leadId)))
          .limit(1);
        if (leadResult.length > 0) {
          lead = leadResult[0];
          const profileResult = await db
            .select()
            .from(customerProfiles)
            .where(eq(customerProfiles.leadId, lead.id))
            .limit(1);
          profile = profileResult[0] || null;
        }
      } else if (input.customerId) {
        const profileResult = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.userId, userId),
              eq(customerProfiles.id, input.customerId)
            )
          )
          .limit(1);
        profile = profileResult[0] || null;
        if (profile && profile.leadId) {
          const leadResult = await db
            .select()
            .from(leads)
            .where(eq(leads.id, profile.leadId))
            .limit(1);
          lead = leadResult[0] || null;
        }
      } else if (input.email) {
        // ✅ SECURITY FIX: Use parameterized query with ilike for case-insensitive comparison
        const profileResult = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.userId, userId),
              ilike(customerProfiles.email, input.email)
            )
          )
          .limit(1);
        profile = profileResult[0] || null;
        if (profile && profile.leadId) {
          const leadResult = await db
            .select()
            .from(leads)
            .where(eq(leads.id, profile.leadId))
            .limit(1);
          lead = leadResult[0] || null;
        }
      }

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Get invoices
      const invoices = await db
        .select()
        .from(customerInvoices)
        .where(eq(customerInvoices.customerId, profile.id))
        .orderBy(desc(customerInvoices.entryDate));

      // Extract metadata from lead
      const metadata = (lead?.metadata as any) || {};

      // Build intelligence summary
      const intelligence = {
        customer: {
          id: profile.id,
          leadId: lead?.id || null,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          status: profile.status,
          customerType: profile.customerType,
          tags: profile.tags,
        },
        financial: {
          totalInvoiced: profile.totalInvoiced || 0,
          totalPaid: profile.totalPaid || 0,
          balance: profile.balance || 0,
          invoiceCount: invoices.length,
          avgInvoiceAmount:
            invoices.length > 0
              ? (profile.totalInvoiced || 0) / invoices.length
              : 0,
        },
        behavioral: {
          isRecurring: metadata.customer?.isRecurring || false,
          recurringFrequency: metadata.customer?.recurringFrequency || null,
          hasComplaints: metadata.customer?.hasComplaints || false,
          hasSpecialNeeds: metadata.customer?.hasSpecialNeeds || false,
          lastContactDate: profile.lastContactDate,
        },
        insights: {
          aiResume: profile.aiResume,
          pipelineStage: metadata.pipelineStage || null,
          pipelineStatus: metadata.pipelineStatus || null,
          quality: metadata.quality || null,
        },
        recentInvoices: invoices.slice(0, 5).map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          amount: inv.amount,
          status: inv.status,
          entryDate: inv.entryDate,
          dueDate: inv.dueDate,
          isPaid: inv.status === "paid",
        })),
      };

      return intelligence;
    }),

  /**
   * Get actionable insights for autonomous operations
   */
  getActionableInsights: protectedProcedure
    .input(
      z.object({
        insightType: z
          .enum(["missing_bookings", "at_risk", "upsell", "all"])
          .optional()
          .default("all"),
        limit: z.number().min(1).max(100).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const userId = ctx.user.id;
      const insights: any[] = [];

      // Missing bookings: recurring customers without recent invoices
      if (
        input.insightType === "missing_bookings" ||
        input.insightType === "all"
      ) {
        const recurringProfiles = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.userId, userId),
              sql`${customerProfiles.tags}::jsonb @> '["recurring"]'`
            )
          )
          .limit(input.limit);

        for (const profile of recurringProfiles) {
          const recentInvoices = await db
            .select()
            .from(customerInvoices)
            .where(
              and(
                eq(customerInvoices.customerId, profile.id),
                sql`${customerInvoices.entryDate} > NOW() - INTERVAL '90 days'`
              )
            )
            .limit(1);

          if (recentInvoices.length === 0) {
            insights.push({
              type: "missing_booking",
              priority: "high",
              customer: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
              },
              message: `Recurring customer ${profile.name} has no bookings in the last 90 days`,
              actionable: true,
              suggestedAction: "reach_out",
              metadata: {
                lastContactDate: profile.lastContactDate,
                tags: profile.tags,
              },
            });
          }
        }
      }

      // At-risk customers
      if (input.insightType === "at_risk" || input.insightType === "all") {
        const atRiskProfiles = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.userId, userId),
              eq(customerProfiles.status, "at_risk")
            )
          )
          .limit(input.limit);

        for (const profile of atRiskProfiles) {
          insights.push({
            type: "at_risk",
            priority: "high",
            customer: {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
            },
            message: `Customer ${profile.name} is marked as at-risk`,
            actionable: true,
            suggestedAction: "investigate",
            metadata: {
              balance: profile.balance,
              tags: profile.tags,
              aiResume: profile.aiResume,
            },
          });
        }
      }

      // Upsell opportunities: VIP customers with high lifetime value
      if (input.insightType === "upsell" || input.insightType === "all") {
        const vipProfiles = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.userId, userId),
              eq(customerProfiles.status, "vip")
            )
          )
          .orderBy(desc(customerProfiles.totalInvoiced))
          .limit(input.limit);

        for (const profile of vipProfiles) {
          const lifetimeValue = (profile.totalInvoiced || 0) / 100;
          if (lifetimeValue > 10000) {
            insights.push({
              type: "upsell",
              priority: "medium",
              customer: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
              },
              message: `VIP customer ${profile.name} with ${lifetimeValue.toLocaleString("da-DK")} kr lifetime value - potential upsell`,
              actionable: true,
              suggestedAction: "upsell",
              metadata: {
                lifetimeValue,
                invoiceCount: profile.invoiceCount,
                tags: profile.tags,
              },
            });
          }
        }
      }

      return {
        insights,
        count: insights.length,
        generatedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get dashboard statistics
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    const userId = ctx.user.id;

    const [leadCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.userId, userId));

    const [customerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId));

    const [invoiceStats] = await db
      .select({
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(cast(${customerInvoices.amount} as numeric))`,
        paidAmount: sql<number>`sum(cast(${customerInvoices.paidAmount} as numeric))`,
      })
      .from(customerInvoices)
      .where(eq(customerInvoices.userId, userId));

    const recurringCustomers = await db
      .select({ count: sql<number>`count(*)` })
      .from(customerProfiles)
      .where(
        and(
          eq(customerProfiles.userId, userId),
          sql`${customerProfiles.tags}::jsonb @> '["recurring"]'`
        )
      );

    return {
      leads: Number(leadCount?.count || 0),
      customers: Number(customerCount?.count || 0),
      invoices: Number(invoiceStats?.count || 0),
      totalRevenue: Number(invoiceStats?.totalAmount || 0),
      paidRevenue: Number(invoiceStats?.paidAmount || 0),
      recurringCustomers: Number(recurringCustomers[0]?.count || 0),
    };
  }),
});
