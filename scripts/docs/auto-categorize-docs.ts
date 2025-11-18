#!/usr/bin/env tsx
/**
 * Auto-categorize documentation files in docs/ folder
 *
 * This script analyzes markdown files and organizes them into
 * a structured folder hierarchy based on filename patterns and content.
 */

import { existsSync } from "fs";
import { mkdir, readdir, rename } from "fs/promises";
import { dirname, join } from "path";

interface FileInfo {
  name: string;
  path: string;
  category?: string;
  subcategory?: string;
}

interface CategoryRule {
  pattern: RegExp | string;
  category: string;
  subcategory?: string;
  priority: number; // Higher priority = checked first
}

// Category rules - ordered by priority
const CATEGORY_RULES: CategoryRule[] = [
  // Status Reports & Progress
  {
    pattern: /^SESSION_(STATUS|SUMMARY|TODOS|REFLECTION)/i,
    category: "status-reports",
    subcategory: "sessions",
    priority: 100,
  },
  {
    pattern: /^SPRINT_(TODOS|PLAN|SUMMARY)/i,
    category: "status-reports",
    subcategory: "sprints",
    priority: 100,
  },
  {
    pattern: /^PHASE[0-9]|^PHASE_[0-9]/i,
    category: "status-reports",
    subcategory: "phases",
    priority: 100,
  },
  {
    pattern: /^DAY[0-9]|^DAY_[0-9]/i,
    category: "status-reports",
    subcategory: "daily-progress",
    priority: 100,
  },
  {
    pattern: /_(STATUS|COMPLETE|SUMMARY|REPORT|PLAN|AUDIT).*\.md$/i,
    category: "status-reports",
    subcategory: "feature-status",
    priority: 90,
  },
  {
    pattern: /^CODE_REVIEW|^COMPREHENSIVE_REVIEW|^WORK_SUMMARY/i,
    category: "status-reports",
    subcategory: "reviews",
    priority: 90,
  },
  {
    pattern: /^TODO_AUDIT|^COMPLETED_TODOS/i,
    category: "status-reports",
    subcategory: "todos",
    priority: 90,
  },

  // AI & Automation
  {
    pattern: /^AI_(DOCS|MODEL|TEST|BUG)/i,
    category: "ai-automation",
    subcategory: "docs-generation",
    priority: 100,
  },
  {
    pattern: /^FRIDAY_(AI|DOCS)/i,
    category: "ai-automation",
    subcategory: "friday-ai",
    priority: 100,
  },
  {
    pattern: /^AGENTIC_|^AUTONOMOUS/i,
    category: "ai-automation",
    subcategory: "agentic-rag",
    priority: 100,
  },
  {
    pattern: /AI.*GUIDE|AI.*TEST/i,
    category: "ai-automation",
    subcategory: "guides",
    priority: 80,
  },

  // Email System
  {
    pattern: /^EMAIL_(CENTER|INTELLIGENCE|SYNC|TAB)/i,
    category: "email-system",
    subcategory: "email-center",
    priority: 100,
  },
  {
    pattern: /^LEAD_FLOW|^SENDER_GROUPING/i,
    category: "email-system",
    subcategory: "leads",
    priority: 90,
  },
  {
    pattern: /^SHORTWAVE|^GMAIL/i,
    category: "email-system",
    subcategory: "integrations",
    priority: 90,
  },
  {
    pattern: /EMAIL.*GUIDE|EMAIL.*ANALYSIS/i,
    category: "email-system",
    subcategory: "guides",
    priority: 80,
  },

  // Integrations
  {
    pattern: /^LANGFUSE/i,
    category: "integrations",
    subcategory: "langfuse",
    priority: 100,
  },
  {
    pattern: /^LITELLM/i,
    category: "integrations",
    subcategory: "litellm",
    priority: 100,
  },
  {
    pattern: /^CHROMADB|^CHROMA/i,
    category: "integrations",
    subcategory: "chromadb",
    priority: 100,
  },
  {
    pattern: /^TOOL_(CALLING|EXECUTION)/i,
    category: "integrations",
    subcategory: "tools",
    priority: 100,
  },
  {
    pattern: /INTEGRATION.*PLAN|INTEGRATION.*GUIDE/i,
    category: "integrations",
    subcategory: "general",
    priority: 80,
  },

  // CRM Business
  {
    pattern: /^CRM_/i,
    category: "crm-business",
    subcategory: "phases",
    priority: 100,
  },
  {
    pattern: /CRM.*GUIDE|CRM.*ANALYSIS|CRM.*REVIEW/i,
    category: "crm-business",
    subcategory: "guides",
    priority: 80,
  },

  // UI & Frontend
  {
    pattern: /^COMPONENT_|^UI_|^CHAT_PANEL/i,
    category: "ui-frontend",
    subcategory: "components",
    priority: 100,
  },
  {
    pattern: /^ANIMATIONS|^NEW_UI/i,
    category: "ui-frontend",
    subcategory: "components",
    priority: 90,
  },
  {
    pattern: /^3-PANEL|^VIRTUAL_SCROLLING/i,
    category: "ui-frontend",
    subcategory: "features",
    priority: 90,
  },
  {
    pattern: /UI.*GUIDE|UI.*REVIEW/i,
    category: "ui-frontend",
    subcategory: "guides",
    priority: 80,
  },

  // DevOps & Deployment
  {
    pattern: /^DEPLOYMENT|^SECURITY_IMPLEMENTATION/i,
    category: "devops-deploy",
    subcategory: "deployment",
    priority: 100,
  },
  {
    pattern: /^SECURITY_(REVIEW|REMEDIATION|STATUS)/i,
    category: "devops-deploy",
    subcategory: "security",
    priority: 100,
  },
  {
    pattern: /^CSRF|^CORS|^RATE_LIMITING/i,
    category: "devops-deploy",
    subcategory: "security",
    priority: 90,
  },
  {
    pattern: /^HEALTH_CHECK|^PERFORMANCE/i,
    category: "devops-deploy",
    subcategory: "monitoring",
    priority: 90,
  },

  // Development Notes
  {
    pattern: /^FIXES_|^FIX_|^DEBUG_|^ERROR_/i,
    category: "development-notes",
    subcategory: "fixes",
    priority: 100,
  },
  {
    pattern: /^EXPLORATORY_DEBUGGING|^MINIMAL_REPRO/i,
    category: "development-notes",
    subcategory: "debugging",
    priority: 90,
  },
  {
    pattern: /^INPUT_VALIDATION|^SQL_PARAMETERIZATION/i,
    category: "development-notes",
    subcategory: "security",
    priority: 90,
  },
  {
    pattern: /^MEMORY_RULES|^CURSOR_/i,
    category: "development-notes",
    subcategory: "configuration",
    priority: 80,
  },

  // Guides & Documentation
  {
    pattern: /^GUIDE$|.*_GUIDE\.md$/i,
    category: "guides",
    subcategory: "general",
    priority: 70,
  },
  {
    pattern: /^QUICK_START|^V2-QUICK-START/i,
    category: "guides",
    subcategory: "quick-start",
    priority: 90,
  },
  {
    pattern: /^SHOWCASE/i,
    category: "guides",
    subcategory: "showcases",
    priority: 90,
  },
  {
    pattern: /^TEST.*GUIDE|^TESTING|^TEST_COVERAGE/i,
    category: "guides",
    subcategory: "testing",
    priority: 80,
  },
  {
    pattern: /^ACCESSIBILITY|^LIGHTHOUSE|^SCREEN_READER/i,
    category: "guides",
    subcategory: "testing",
    priority: 80,
  },

  // Additional patterns for better categorization
  {
    pattern: /^ACTION_CATALOG|^CATALOG/i,
    category: "core",
    subcategory: "reference",
    priority: 85,
  },
  {
    pattern: /^API_(OPTIMIZATION|CONTRACT)/i,
    category: "core",
    subcategory: "api",
    priority: 85,
  },
  {
    pattern: /^DOCUMENTATION_|^DOCS_/i,
    category: "core",
    subcategory: "documentation",
    priority: 80,
  },
  {
    pattern: /^WORKSPACE_|^REORGANIZATION/i,
    category: "development-notes",
    subcategory: "organization",
    priority: 75,
  },
  {
    pattern: /^BRANDKIT|^LOGO/i,
    category: "ui-frontend",
    subcategory: "branding",
    priority: 80,
  },

  // Analysis & Review patterns
  {
    pattern: /.*_ANALYSIS\.md$|^ANALYSIS_/i,
    category: "status-reports",
    subcategory: "reviews",
    priority: 85,
  },
  {
    pattern: /^CHANGE_ANALYSIS|^CLEANUP_ANALYSIS|^DEEP_DIVE|^CODEBASE_HEALTH/i,
    category: "status-reports",
    subcategory: "reviews",
    priority: 85,
  },
  {
    pattern: /^COMPREHENSIVE_SYSTEM|^CRITICAL_REVIEW/i,
    category: "status-reports",
    subcategory: "reviews",
    priority: 85,
  },
  {
    pattern: /^CODE_BASED_UI|^UI_VURDERING/i,
    category: "ui-frontend",
    subcategory: "analysis",
    priority: 80,
  },

  // Spec & Design patterns
  {
    pattern: /.*_SPEC\.md$|^SPEC_/i,
    category: "features",
    subcategory: "specs",
    priority: 85,
  },
  {
    pattern: /^CHAT_APPROVALS|^CHATPANEL-REDESIGN|^ARCHITECTURE-REDESIGN/i,
    category: "ui-frontend",
    subcategory: "design",
    priority: 85,
  },

  // Implementation & Progress patterns
  {
    pattern: /^CHAT_IMPLEMENTATION|^IMPLEMENTATION_PROGRESS/i,
    category: "features",
    subcategory: "implementation",
    priority: 85,
  },
  {
    pattern: /^CROSS_TAB|^CUSTOMER_PROFILE/i,
    category: "features",
    subcategory: "implementation",
    priority: 80,
  },

  // Database & Migration patterns
  {
    pattern: /^DATABASE_MIGRATION|^DATA_INTEGRATION/i,
    category: "migration",
    subcategory: "database",
    priority: 85,
  },
  {
    pattern: /^SUPABASE/i,
    category: "migration",
    subcategory: "database",
    priority: 85,
  },

  // Verification & Testing patterns
  {
    pattern: /.*_VERIFICATION\.md$|^VERIFICATION_/i,
    category: "guides",
    subcategory: "testing",
    priority: 80,
  },
  {
    pattern: /^DATA_INTEGRATION_VERIFICATION/i,
    category: "migration",
    subcategory: "database",
    priority: 85,
  },

  // Deprecated & Cleanup patterns
  {
    pattern: /^DEPRECATED_|^CLEANUP_/i,
    category: "development-notes",
    subcategory: "cleanup",
    priority: 85,
  },

  // Danish/Norwegian text patterns (common in this codebase)
  {
    pattern: /^DETALJERET_|^GENNEMGANG|^STATUSRAPPORT/i,
    category: "status-reports",
    subcategory: "reviews",
    priority: 80,
  },
  {
    pattern: /^Fase [0-9]|^Backend CRM Status/i,
    category: "crm-business",
    subcategory: "phases",
    priority: 85,
  },

  // Execution & Setup patterns
  {
    pattern: /^EXECUTE_|^SETUP_|^CRITICAL_FIXES/i,
    category: "development-notes",
    subcategory: "setup",
    priority: 80,
  },

  // Documentation strategy
  {
    pattern: /^DOCS_STRATEGY|^DOCUMENTATION_STRATEGY/i,
    category: "core",
    subcategory: "documentation",
    priority: 85,
  },

  // Date-based status reports (common pattern: YYYY-MM-DD)
  {
    pattern: /^[0-9]{4}-[0-9]{2}-[0-9]{2}|.*_[0-9]{4}-[0-9]{2}-[0-9]{2}\.md$/i,
    category: "status-reports",
    subcategory: "feature-status",
    priority: 75,
  },

  // Dev notes and prompts
  {
    pattern: /^DEV_NOTES|^DEV_PROMPTS/i,
    category: "development-notes",
    subcategory: "notes",
    priority: 80,
  },

  // Summary files (generic)
  {
    pattern: /^summary\.md$/i,
    category: "status-reports",
    subcategory: "feature-status",
    priority: 70,
  },

  // Files with special characters or spaces (often need manual review)
  {
    pattern: /.*[–—].*\.md$/i,
    category: "status-reports",
    subcategory: "feature-status",
    priority: 60,
  },

  // CHANGELOG (should be in development-notes)
  {
    pattern: /^CHANGELOG/i,
    category: "development-notes",
    subcategory: "changelog",
    priority: 85,
  },

  // START_SERVER, PORT_FIX patterns
  {
    pattern: /^START_SERVER|^PORT_FIX/i,
    category: "development-notes",
    subcategory: "fixes",
    priority: 85,
  },

  // Documentation files in subdirectories (keep structure but categorize)
  {
    pattern: /^Dokumentér|^Gennemse/i,
    category: "development-notes",
    subcategory: "notes",
    priority: 70,
  },

  // Core Documentation
  {
    pattern: /^ARCHITECTURE\.md$/i,
    category: "core",
    subcategory: "architecture",
    priority: 100,
  },
  {
    pattern: /^API_REFERENCE/i,
    category: "core",
    subcategory: "api",
    priority: 100,
  },
  {
    pattern: /^DEVELOPMENT_GUIDE/i,
    category: "core",
    subcategory: "development",
    priority: 100,
  },
  {
    pattern: /^AREA_[0-9]|^MODULE_/i,
    category: "core",
    subcategory: "architecture",
    priority: 90,
  },
  {
    pattern: /^RBAC|^STATE_MANAGEMENT|^ERROR_HANDLING/i,
    category: "core",
    subcategory: "guides",
    priority: 80,
  },
  {
    pattern: /^STRATEGIC_LOGGING|^CORRELATION_ID/i,
    category: "core",
    subcategory: "development",
    priority: 80,
  },

  // Realtime & Features
  {
    pattern: /^REALTIME_/i,
    category: "features",
    subcategory: "realtime",
    priority: 100,
  },
  {
    pattern: /^HOOK_|^CURSOR_COMMAND/i,
    category: "features",
    subcategory: "cursor-integration",
    priority: 100,
  },
  {
    pattern: /^AB_TESTING/i,
    category: "features",
    subcategory: "ab-testing",
    priority: 90,
  },

  // Migration & Versioning
  {
    pattern: /^V2-|^MIGRATION/i,
    category: "migration",
    subcategory: "versioning",
    priority: 100,
  },
  {
    pattern: /^VERSION_/i,
    category: "migration",
    subcategory: "versioning",
    priority: 90,
  },
];

// Files to keep in root docs/
const KEEP_IN_ROOT = [
  "README.md",
  "ARCHITECTURE.md",
  "API_REFERENCE.md",
  "DEVELOPMENT_GUIDE.md",
];

/**
 * Categorize a file based on its name
 */
function categorizeFile(
  filename: string
): { category: string; subcategory: string } | null {
  // Check if file should stay in root
  if (KEEP_IN_ROOT.includes(filename)) {
    return null;
  }

  // Sort rules by priority (highest first)
  const sortedRules = [...CATEGORY_RULES].sort(
    (a, b) => b.priority - a.priority
  );

  for (const rule of sortedRules) {
    const pattern =
      typeof rule.pattern === "string"
        ? new RegExp(rule.pattern, "i")
        : rule.pattern;
    if (pattern.test(filename)) {
      return {
        category: rule.category,
        subcategory: rule.subcategory || "general",
      };
    }
  }

  // Default category for unmatched files
  return {
    category: "uncategorized",
    subcategory: "general",
  };
}

/**
 * Get all markdown files in docs directory
 */
async function getMarkdownFiles(
  docsPath: string,
  basePath: string = docsPath
): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  const entries = await readdir(docsPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      const fullPath = join(docsPath, entry.name);
      const relativePath = fullPath
        .replace(basePath + "\\", "")
        .replace(basePath + "/", "");
      files.push({
        name: entry.name,
        path: fullPath,
      });
    } else if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      entry.name !== "archive"
    ) {
      // Recursively scan subdirectories (but skip archive)
      const subFiles = await getMarkdownFiles(
        join(docsPath, entry.name),
        basePath
      );
      files.push(...subFiles);
    }
  }

  return files;
}

/**
 * Create directory structure
 */
async function ensureDirectory(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

/**
 * Move file to new location
 */
async function moveFile(oldPath: string, newPath: string): Promise<void> {
  await ensureDirectory(dirname(newPath));
  await rename(oldPath, newPath);
}

/**
 * Generate category statistics
 */
function generateStats(files: FileInfo[]): Map<string, number> {
  const stats = new Map<string, number>();

  for (const file of files) {
    if (file.category) {
      const key = `${file.category}/${file.subcategory}`;
      stats.set(key, (stats.get(key) || 0) + 1);
    }
  }

  return stats;
}

/**
 * Main execution
 */
async function main() {
  // Ensure we're in the project root
  const projectRoot = process.cwd();
  const docsPath = join(projectRoot, "docs");
  const dryRun = process.argv.includes("--dry-run");
  const verbose = process.argv.includes("--verbose");

  console.log("📚 Auto-categorizing documentation files...\n");
  console.log(`📁 Docs path: ${docsPath}`);
  console.log(
    `🔍 Mode: ${dryRun ? "DRY RUN (no files will be moved)" : "LIVE (files will be moved)"}\n`
  );

  // Get all markdown files
  const files = await getMarkdownFiles(docsPath);
  console.log(`Found ${files.length} markdown files\n`);

  // Categorize files
  const categorized: FileInfo[] = [];
  const uncategorized: FileInfo[] = [];
  const keptInRoot: FileInfo[] = [];

  for (const file of files) {
    const result = categorizeFile(file.name);

    if (result === null) {
      keptInRoot.push(file);
      if (verbose) {
        console.log(`📍 Keeping in root: ${file.name}`);
      }
    } else {
      file.category = result.category;
      file.subcategory = result.subcategory;
      categorized.push(file);
    }
  }

  // Generate statistics
  const stats = generateStats(categorized);

  console.log("📊 Category Statistics:\n");
  const sortedStats = Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
  for (const [category, count] of sortedStats) {
    console.log(`  ${category}: ${count} files`);
  }
  console.log(`\n  Kept in root: ${keptInRoot.length} files`);
  console.log(
    `  Uncategorized: ${stats.get("uncategorized/general") || 0} files\n`
  );

  // Show moves
  if (dryRun || verbose) {
    console.log("📦 Planned moves:\n");
    for (const file of categorized) {
      const newPath = join(
        docsPath,
        file.category!,
        file.subcategory!,
        file.name
      );
      const relativeOld = file.path
        .replace(process.cwd() + "\\", "")
        .replace(process.cwd() + "/", "");
      const relativeNew = newPath
        .replace(process.cwd() + "\\", "")
        .replace(process.cwd() + "/", "");
      console.log(`  ${relativeOld}`);
      console.log(`  → ${relativeNew}\n`);
    }
  }

  // Execute moves
  if (!dryRun) {
    console.log("🚀 Moving files...\n");
    let moved = 0;
    let errors = 0;

    for (const file of categorized) {
      try {
        const newPath = join(
          docsPath,
          file.category!,
          file.subcategory!,
          file.name
        );

        // Skip if already in correct location
        const normalizedOld = file.path.replace(/\\/g, "/");
        const normalizedNew = newPath.replace(/\\/g, "/");
        if (normalizedOld === normalizedNew) {
          if (verbose) {
            console.log(`⏭️  Skipped (already in place): ${file.name}`);
          }
          continue;
        }

        // Check if target file already exists
        if (existsSync(newPath)) {
          console.warn(
            `⚠️  Target exists, skipping: ${file.name} → ${file.category}/${file.subcategory}/`
          );
          continue;
        }

        await moveFile(file.path, newPath);
        moved++;

        if (verbose) {
          console.log(
            `✅ Moved: ${file.name} → ${file.category}/${file.subcategory}/`
          );
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error moving ${file.name}:`, error);
      }
    }

    console.log(`\n✨ Done! Moved ${moved} files, ${errors} errors`);

    // Generate index files
    console.log("\n📝 Generating index files...");
    await generateIndexFiles(docsPath, stats);
  } else {
    console.log("\n💡 Run without --dry-run to execute the moves");
  }
}

/**
 * Generate README.md index files for each category
 */
async function generateIndexFiles(
  docsPath: string,
  stats: Map<string, number>
): Promise<void> {
  // This would generate index files - simplified for now
  console.log("  (Index file generation can be added if needed)");
}

// Run if executed directly
main().catch(error => {
  console.error("❌ Error:", error);
  process.exit(1);
});

export { categorizeFile, getMarkdownFiles };
