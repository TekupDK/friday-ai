/**
 * Invoice Caching Utilities
 *
 * Cache Billy invoices to database in background
 */

import type { BillyInvoice } from './billy';
import { getCustomer } from './billy';
import {
  addCustomerInvoice,
  createOrUpdateCustomerProfile,
} from '../crm/customer-db';

/**
 * Map Billy invoice state to customer_invoice_status enum
 */
function mapInvoiceStatus(
  billyState: string
): "draft" | "approved" | "sent" | "paid" | "overdue" | "voided" {
  const stateMap: Record<
    string,
    "draft" | "approved" | "sent" | "paid" | "overdue" | "voided"
  > = {
    draft: "draft",
    approved: "approved",
    sent: "sent",
    paid: "paid",
    overdue: "overdue",
    voided: "voided",
    cancelled: "voided",
  };

  return stateMap[billyState?.toLowerCase()] || "draft";
}

/**
 * Cache Billy invoices to database (background job)
 */
export async function cacheInvoicesToDatabase(
  invoices: BillyInvoice[],
  userId: number,
  db: any
): Promise<void> {
  try {
    for (const invoice of invoices) {
      // Get customer from Billy API to get email/name
      const customer = await getCustomer(invoice.contactId);
      if (!customer) {
        console.warn(
          `[Invoice Cache] Customer not found for contactId: ${invoice.contactId}`
        );
        continue;
      }

      // Create or update customer profile
      let customerProfileId: number;
      try {
        customerProfileId = await createOrUpdateCustomerProfile({
          userId,
          email:
            customer.email || `customer-${invoice.contactId}@unknown.local`,
          name: customer.name || undefined,
          phone: customer.phone || undefined,
          billyCustomerId: invoice.contactId,
          billyOrganizationId: invoice.organizationId,
        });
      } catch (error) {
        console.error(
          `[Invoice Cache] Error creating/updating customer profile:`,
          error
        );
        continue;
      }

      // Amounts: use values directly from Billy response (DKK -> øre)
      // Billy list responses often omit lines; relying on lines caused zeros.
      const amount = Number.isFinite(invoice.amount as any)
        ? (invoice.amount as number).toFixed(2)
        : "0.00";

      // Calculate due date from entry date and payment terms
      const entryDate = invoice.entryDate
        ? new Date(invoice.entryDate)
        : new Date();
      const dueDate = invoice.dueDate
        ? new Date(invoice.dueDate).toISOString()
        : invoice.paymentTermsDays
          ? new Date(
              entryDate.getTime() +
                invoice.paymentTermsDays * 24 * 60 * 60 * 1000
            ).toISOString()
          : undefined;

      // Add invoice to database
      try {
        await addCustomerInvoice({
          userId,
          customerId: customerProfileId,
          billyInvoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNo || undefined,
          amount,
          // Use gross amounts consistently: paid = grossAmount - balance (store as DKK string)
          paidAmount: (
            (invoice.grossAmount || 0) - (invoice.balance || 0)
          ).toFixed(2),
          grossAmount: (invoice.grossAmount ?? Number(amount)).toFixed(2),
          taxAmount: (invoice.tax ?? 0).toFixed(2),
          status: mapInvoiceStatus(invoice.state),
          entryDate: invoice.entryDate || entryDate.toISOString(),
          dueDate,
          paymentTermsDays: invoice.paymentTermsDays || undefined,
          // Billy list payload doesn't include paid timestamp; don't guess
          paidAt: undefined,
        });
      } catch (error) {
        console.error(
          `[Invoice Cache] Error caching invoice ${invoice.id}:`,
          error
        );
        // Continue with next invoice even if one fails
      }
    }
  } catch (error) {
    console.error("[Invoice Cache] Error caching invoices:", error);
    throw error;
  }
}
