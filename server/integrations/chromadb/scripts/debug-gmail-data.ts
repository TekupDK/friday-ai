/**
 * Debug Gmail Data Structure
 * See what's actually in the Gmail threads
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.dev") });

import { searchGmailThreads, getGmailThread } from "../../../google-api";

async function debugGmailData() {
  console.log("🔍 Debugging Gmail Data Structure\n");

  const startDate = new Date("2025-07-01T00:00:00Z");
  const endDate = new Date("2025-12-31T23:59:59Z");

  // Search for threads
  const threads = await searchGmailThreads({
    query: `after:${Math.floor(startDate.getTime() / 1000)} before:${Math.floor(endDate.getTime() / 1000)}`,
    maxResults: 5, // Just get 5 for debugging
  });

  console.log(`Found ${threads.length} threads\n`);

  // Get first thread detail
  if (threads.length > 0) {
    const threadDetail = await getGmailThread(threads[0].id);

    console.log("Thread structure:");
    console.log(JSON.stringify(threadDetail, null, 2));
  }

  process.exit(0);
}

debugGmailData().catch(console.error);
