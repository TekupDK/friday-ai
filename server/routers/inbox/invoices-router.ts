import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { customerInvoices, customerProfiles } from "../../../drizzle/schema";
import { logger } from "../../_core/logger";
import {
  permissionProcedure,
  protectedProcedure,
  router,
} from "../../_core/trpc";
import type { BillyInvoice } from "../../billy";
import {
  createInvoice as createBillyInvoice,
  getInvoices as getBillyInvoices,
} from "../../billy";
import { getDb } from "../../db";
import { cacheInvoicesToDatabase } from "../../invoice-cache";
import { computeInvoiceStats } from "../../utils/invoice-stats";

export const invoicesRouter = router({
  sync: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    const fresh = await getBillyInvoices();
    await cacheInvoicesToDatabase(fresh, ctx.user.id, db);
    return { success: true, count: fresh.length } as const;
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    // DATABASE-FIRST STRATEGY: Try database first, only fallback if empty
    const db = await getDb();
    if (db) {
      try {
        // Query customer_invoices via customer_profiles for this user
        const invoiceRecords = await db
          .select({
            invoice: customerInvoices,
            customer: customerProfiles,
          })
          .from(customerInvoices)
          .innerJoin(
            customerProfiles,
            eq(customerInvoices.customerId, customerProfiles.id)
          )
          .where(eq(customerProfiles.userId, ctx.user.id))
          // entryDate does not exist on customer_invoices; use createdAt
          .orderBy(desc(customerInvoices.createdAt))
          .limit(100)
          .execute();

        if (invoiceRecords.length > 0) {
          // Transform to Billy invoice format for frontend compatibility
          // NOTE: Database cache has limited fields. Use Billy API for full data.
          return invoiceRecords.map(
            ({ invoice, customer }) =>
              ({
                // Core identifiers
                id: invoice.billyInvoiceId || "",
                organizationId: customer.billyOrganizationId || "",
                invoiceNo: invoice.invoiceNumber || null,

                // Contact/Customer
                contactId:
                  customer.billyCustomerId ||
                  invoice.customerId?.toString() ||
                  "",

                // Dates
                createdTime: invoice.createdAt || new Date().toISOString(),
                entryDate:
                  invoice.entryDate?.split("T")[0] ||
                  invoice.createdAt?.split("T")[0] ||
                  new Date().toISOString().split("T")[0],
                dueDate: invoice.dueDate?.split("T")[0] || null,

                // Status
                state: invoice.status as
                  | "draft"
                  | "approved"
                  | "sent"
                  | "paid"
                  | "overdue"
                  | "voided",
                sentState: "unsent" as const, // Not stored in DB cache
                isPaid:
                  (invoice.status as any) === "paid" ||
                  parseFloat(invoice.grossAmount || invoice.amount || "0") -
                    parseFloat(invoice.paidAmount || "0") <=
                    0,

                // Amounts stored as DKK decimals in DB
                amount: parseFloat(invoice.amount || "0"),
                tax: 0, // Not stored in DB cache - use Billy API for accurate tax
                grossAmount: parseFloat(
                  invoice.grossAmount || invoice.amount || "0"
                ),
                // Use gross - paid to avoid net/gross mismatch
                balance:
                  parseFloat(invoice.grossAmount || invoice.amount || "0") -
                  parseFloat(invoice.paidAmount || "0"),

                // Currency
                currencyId: invoice.currency || "DKK",
                exchangeRate: 1,

                // Payment terms (calculated from dates)
                paymentTermsDays:
                  invoice.dueDate && invoice.createdAt
                    ? Math.round(
                        (new Date(invoice.dueDate).getTime() -
                          new Date(invoice.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : null,

                // Lines not stored in customer_invoices table
                lines: [],

                // Backwards compatibility (DKK)
                totalAmount: parseFloat(invoice.amount || "0"),
                createdAt: invoice.createdAt,
              }) as BillyInvoice
          );
        }

        logger.info(
          "[Invoice List] Database empty, fetching from Billy API and caching..."
        );
      } catch (error) {
        logger.warn(
          { err: error },
          "[Invoice List] Database query failed, falling back to Billy API"
        );
      }
    }

    // Fallback to Billy API if database empty or unavailable
    const invoices = await getBillyInvoices();

    // Background cache to database
    if (db && invoices.length > 0) {
      cacheInvoicesToDatabase(invoices, ctx.user.id, db).catch(error => {
        logger.error({ err: error }, "[Invoice List] Background cache failed");
      });
    }

    return invoices;
  }),
  create: permissionProcedure("create_invoice")
    .input(
      z.object({
        contactId: z.string(),
        entryDate: z.string(),
        paymentTermsDays: z.number().optional(),
        lines: z.array(
          z.object({
            description: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
            productId: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      // ✅ RBAC: Only owner can create invoices (enforced by permissionProcedure)
      return createBillyInvoice(input);
    }),
  stats: protectedProcedure.query(async () => {
    // Always use Billy API for accurate states and balances (DKK units)
    const invoices = await getBillyInvoices();
    return computeInvoiceStats(invoices);
  }),
  getByNumber: protectedProcedure
    .input(z.object({ invoiceNumber: z.string() }))
    .query(async ({ input }) => {
      // Get all invoices from Billy API
      const invoices = await getBillyInvoices();

      // Find invoice by number
      const invoice = invoices.find(
        inv =>
          inv.invoiceNo === input.invoiceNumber ||
          inv.invoiceNo === `#${input.invoiceNumber}` ||
          inv.invoiceNo?.includes(input.invoiceNumber)
      );

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Invoice ${input.invoiceNumber} not found`,
        });
      }

      return invoice;
    }),
});
