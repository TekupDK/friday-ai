/**
 * Pre-execution Hook: Create Backup
 *
 * Creates backups before potentially destructive operations
 */

export interface BackupResult {
  success: boolean;
  backupPath?: string;
  backupType: "git-stash" | "file-backup" | "database-backup" | "none";
  message: string;
  canRestore: boolean;
}

/**
 * Create appropriate backup before execution
 */
export async function createBackup(
  changedFiles: string[],
  operation?: string
): Promise<BackupResult> {
  try {
    // Import child_process for git operations
    const { execSync } = await import("child_process");
    const fs = await import("fs");
    const path = await import("path");

    // Determine backup strategy based on files and operation
    const backupStrategy = determineBackupStrategy(changedFiles, operation);

    switch (backupStrategy) {
      case "git-stash":
        return await createGitStash(execSync);

      case "database-backup":
        return await createDatabaseBackup(changedFiles, fs, path);

      case "file-backup":
        return await createFileBackup(changedFiles, fs, path);

      default:
        return {
          success: true,
          backupType: "none",
          message: "No backup needed for this operation",
          canRestore: false,
        };
    }
  } catch (error) {
    return {
      success: false,
      backupType: "none",
      message: `Backup failed: ${error}`,
      canRestore: false,
    };
  }
}

/**
 * Determine appropriate backup strategy
 */
function determineBackupStrategy(
  changedFiles: string[],
  operation?: string
): "git-stash" | "file-backup" | "database-backup" | "none" {
  // Check if operation involves database
  if (
    operation?.includes("db:push") ||
    operation?.includes("migrate") ||
    changedFiles.some(f => f.includes("drizzle/") || f.includes("schema.ts"))
  ) {
    return "database-backup";
  }

  // Check if operation involves critical files
  if (
    changedFiles.some(
      f =>
        f.includes(".cursor/hooks/") ||
        f.includes("package.json") ||
        f.includes("drizzle.config.ts") ||
        f.includes(".env")
    )
  ) {
    return "git-stash";
  }

  // Check if operation involves many files
  if (changedFiles.length > 5) {
    return "git-stash";
  }

  // For individual file changes, create file backup
  if (changedFiles.length > 0 && changedFiles.length <= 3) {
    return "file-backup";
  }

  return "none";
}

/**
 * Create git stash backup
 */
async function createGitStash(execSync: any): Promise<BackupResult> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const stashMessage = `cursor-backup-${timestamp}`;

    // Check if there are changes to stash
    const status = execSync("git status --porcelain", { encoding: "utf8" });

    if (!status.trim()) {
      return {
        success: true,
        backupType: "none",
        message: "No changes to backup",
        canRestore: false,
      };
    }

    // Create git stash
    execSync(`git stash push -u -m "${stashMessage}"`, { encoding: "utf8" });

    return {
      success: true,
      backupPath: `stash: ${stashMessage}`,
      backupType: "git-stash",
      message: `Created git stash backup: ${stashMessage}`,
      canRestore: true,
    };
  } catch (error) {
    return {
      success: false,
      backupType: "git-stash",
      message: `Git stash backup failed: ${error}`,
      canRestore: false,
    };
  }
}

/**
 * Create database backup
 */
async function createDatabaseBackup(
  changedFiles: string[],
  fs: any,
  path: any
): Promise<BackupResult> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(".cursor", "backups", "database");
    const backupPath = path.join(backupDir, `schema-backup-${timestamp}.ts`);

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup current schema file
    const schemaPath = "drizzle/schema.ts";
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, "utf-8");
      fs.writeFileSync(backupPath, schemaContent);

      return {
        success: true,
        backupPath,
        backupType: "database-backup",
        message: `Created database schema backup: ${backupPath}`,
        canRestore: true,
      };
    }

    return {
      success: false,
      backupType: "database-backup",
      message: "Schema file not found for backup",
      canRestore: false,
    };
  } catch (error) {
    return {
      success: false,
      backupType: "database-backup",
      message: `Database backup failed: ${error}`,
      canRestore: false,
    };
  }
}

/**
 * Create file backup
 */
async function createFileBackup(
  changedFiles: string[],
  fs: any,
  path: any
): Promise<BackupResult> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(".cursor", "backups", "files", timestamp);

    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    let backedUpFiles = 0;

    for (const filePath of changedFiles) {
      if (fs.existsSync(filePath)) {
        const backupPath = path.join(backupDir, path.basename(filePath));
        const content = fs.readFileSync(filePath, "utf-8");
        fs.writeFileSync(backupPath, content);
        backedUpFiles++;
      }
    }

    if (backedUpFiles > 0) {
      return {
        success: true,
        backupPath: backupDir,
        backupType: "file-backup",
        message: `Backed up ${backedUpFiles} files to: ${backupDir}`,
        canRestore: true,
      };
    }

    return {
      success: false,
      backupType: "file-backup",
      message: "No files found to backup",
      canRestore: false,
    };
  } catch (error) {
    return {
      success: false,
      backupType: "file-backup",
      message: `File backup failed: ${error}`,
      canRestore: false,
    };
  }
}

export default createBackup;
