import { getInvoices as getBillyInvoices } from "./server/billy";
import { getDb } from "./server/db";
import { cacheInvoicesToDatabase } from "./server/invoice-cache";

/**
 * Re-sync all Billy invoices to database
 * Fixes any incorrect amounts or missing fields
 */
async function resyncInvoices() {
  console.log("[Resync] Starting Billy invoice re-sync...");

  const db = await getDb();
  if (!db) {
    console.error("[Resync] Database not available");
    process.exit(1);
  }

  try {
    console.log("[Resync] Fetching invoices from Billy API...");
    const invoices = await getBillyInvoices();
    console.log(`[Resync] Found ${invoices.length} invoices from Billy`);

    console.log("[Resync] Caching to database...");
    // Use userId 1 (owner) - adjust if needed
    await cacheInvoicesToDatabase(invoices, 1, db);

    console.log(`[Resync] ✅ Successfully cached ${invoices.length} invoices`);
    console.log(
      "[Resync] All Billy invoices have been re-synced with correct DKK values"
    );
  } catch (error) {
    console.error("[Resync] Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

resyncInvoices();
