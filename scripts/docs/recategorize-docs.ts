#!/usr/bin/env tsx
/**
 * Recategorize & Update Documentation
 * - Analyze content for better categories
 * - Mark outdated docs
 * - Add "archived" tag to old references
 * - Update status tags
 */

import { eq } from "drizzle-orm";

import { documents } from "../drizzle/schema";
import { getDb } from "../server/db";

interface DocUpdate {
  id: string;
  title: string;
  category: string;
  tags: string[];
  status: "active" | "outdated" | "archived";
}

// Detect if doc is outdated based on content
function isOutdated(content: string, path: string): boolean {
  const outdatedPatterns = [
    /old implementation/i,
    /deprecated/i,
    /no longer used/i,
    /\[DONE\]/i,
    /\[COMPLETED\]/i,
    /legacy/i,
    /archived/i,
    /replaced by/i,
  ];

  // Check content
  for (const pattern of outdatedPatterns) {
    if (pattern.test(content)) return true;
  }

  // Check path
  if (path.includes("archive") || path.includes("old")) return true;

  return false;
}

// Better categorization based on content analysis
function improveCategory(
  currentCategory: string,
  content: string,
  path: string,
  tags: string[]
): string {
  const lower = content.toLowerCase();

  // Priority-based categorization
  if (
    path.includes("invoice") ||
    lower.includes("billy") ||
    lower.includes("invoice")
  ) {
    return "Invoices & Billy";
  }

  if (
    path.includes("email") ||
    lower.includes("email") ||
    lower.includes("gmail")
  ) {
    return "Email System";
  }

  if (
    lower.includes("friday ai") ||
    lower.includes("chatbot") ||
    path.includes("ai")
  ) {
    return "AI & Friday";
  }

  if (
    path.includes("calendar") ||
    lower.includes("calendar") ||
    lower.includes("google calendar")
  ) {
    return "Calendar Integration";
  }

  if (
    path.includes("test") ||
    lower.includes("playwright") ||
    lower.includes("e2e")
  ) {
    return "Testing & QA";
  }

  if (
    lower.includes("migration") ||
    lower.includes("database") ||
    lower.includes("schema")
  ) {
    return "Database & Migrations";
  }

  if (
    lower.includes("deployment") ||
    lower.includes("docker") ||
    lower.includes("production")
  ) {
    return "DevOps & Deployment";
  }

  if (
    lower.includes("api") ||
    lower.includes("endpoint") ||
    lower.includes("trpc")
  ) {
    return "API & Backend";
  }

  if (
    lower.includes("component") ||
    lower.includes("react") ||
    lower.includes("ui")
  ) {
    return "Frontend & UI";
  }

  if (path.includes("docs") && path.includes("screenshots")) {
    return "Screenshots & Visuals";
  }

  if (
    lower.includes("setup") ||
    lower.includes("installation") ||
    lower.includes("getting started")
  ) {
    return "Setup & Configuration";
  }

  if (
    lower.includes("plan") ||
    lower.includes("roadmap") ||
    lower.includes("milestone")
  ) {
    return "Planning & Roadmap";
  }

  if (
    lower.includes("bug") ||
    lower.includes("fix") ||
    lower.includes("issue")
  ) {
    return "Bug Fixes";
  }

  if (currentCategory === "Uncategorized" || !currentCategory) {
    return "General";
  }

  return currentCategory;
}

// Enhance tags based on content
function improveTags(
  content: string,
  path: string,
  existingTags: string[]
): string[] {
  const tags = new Set(existingTags);

  const lower = content.toLowerCase();

  // Status tags
  if (
    lower.includes("✅") ||
    lower.includes("[done]") ||
    lower.includes("completed")
  ) {
    tags.add("completed");
  }
  if (
    lower.includes("🚧") ||
    lower.includes("[wip]") ||
    lower.includes("in progress")
  ) {
    tags.add("in-progress");
  }
  if (
    lower.includes("❌") ||
    lower.includes("[todo]") ||
    lower.includes("not started")
  ) {
    tags.add("todo");
  }

  // Priority tags
  if (
    lower.includes("urgent") ||
    lower.includes("critical") ||
    lower.includes("blocker")
  ) {
    tags.add("urgent");
  }
  if (lower.includes("important") || lower.includes("priority")) {
    tags.add("important");
  }

  // Type tags
  if (
    lower.includes("guide") ||
    lower.includes("how to") ||
    lower.includes("tutorial")
  ) {
    tags.add("guide");
  }
  if (lower.includes("reference") || lower.includes("documentation")) {
    tags.add("reference");
  }
  if (lower.includes("changelog") || lower.includes("release notes")) {
    tags.add("changelog");
  }
  if (lower.includes("troubleshoot") || lower.includes("debug")) {
    tags.add("troubleshooting");
  }

  // Outdated/archived
  if (isOutdated(content, path)) {
    tags.add("outdated");
  }

  return Array.from(tags);
}

async function recategorizeDocs() {
  console.log("🔄 Recategorizing & updating documentation...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  // Fetch all documents
  const allDocs = await db.select().from(documents);
  console.log(`📊 Found ${allDocs.length} documents\n`);

  const updates: DocUpdate[] = [];
  let categorized = 0;
  let tagged = 0;
  let markedOutdated = 0;

  for (const doc of allDocs) {
    const oldCategory = doc.category;
    const oldTags = doc.tags || [];

    // Improve category
    const newCategory = improveCategory(
      doc.category || "Uncategorized",
      doc.content,
      doc.path,
      oldTags
    );

    // Improve tags
    const newTags = improveTags(doc.content, doc.path, oldTags);

    // Determine status
    const status = isOutdated(doc.content, doc.path) ? "outdated" : "active";

    // Check if anything changed
    const categoryChanged = newCategory !== oldCategory;
    const tagsChanged =
      JSON.stringify(newTags.sort()) !== JSON.stringify(oldTags.sort());
    const statusChanged = status === "outdated";

    if (categoryChanged || tagsChanged || statusChanged) {
      updates.push({
        id: doc.id,
        title: doc.title,
        category: newCategory,
        tags: newTags,
        status,
      });

      if (categoryChanged) categorized++;
      if (tagsChanged) tagged++;
      if (statusChanged) markedOutdated++;

      // Show change
      if (categoryChanged) {
        console.log(`📁 ${doc.title}`);
        console.log(`   ${oldCategory} → ${newCategory}`);
      }
      if (statusChanged) {
        console.log(`⚠️  ${doc.title} → OUTDATED`);
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Docs to update: ${updates.length}`);
  console.log(`   Recategorized: ${categorized}`);
  console.log(`   Tags updated: ${tagged}`);
  console.log(`   Marked outdated: ${markedOutdated}`);
  console.log(``);

  if (updates.length === 0) {
    console.log("✅ No updates needed!");
    return;
  }

  // Apply updates
  console.log(`\n🚀 Applying updates...`);
  let updated = 0;
  let errors = 0;

  for (const update of updates) {
    try {
      await db
        .update(documents)
        .set({
          category: update.category,
          tags: update.tags,
        })
        .where(eq(documents.id, update.id));

      updated++;
      process.stdout.write(`\r  Updated: ${updated}/${updates.length}`);
    } catch (error: any) {
      console.error(`\n❌ Failed to update ${update.title}: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n\n✨ Recategorization complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\n🎯 New category breakdown:`);

  // Show new distribution
  const categoryCount = new Map<string, number>();
  for (const update of updates) {
    categoryCount.set(
      update.category,
      (categoryCount.get(update.category) || 0) + 1
    );
  }

  const sorted = Array.from(categoryCount.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  for (const [category, count] of sorted.slice(0, 10)) {
    console.log(`   - ${category}: ${count}`);
  }

  console.log(`\n🚀 Visit http://localhost:3000/docs to see updates!`);
}

// Run
recategorizeDocs().catch(console.error);
