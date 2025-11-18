/**
 * Error Hook: Rollback Changes
 *
 * Attempts to rollback changes when operations fail
 */

export interface RollbackResult {
  success: boolean;
  method: "git-stash-pop" | "file-restore" | "database-restore" | "none";
  message: string;
  filesRestored: string[];
}

/**
 * Rollback changes based on backup information
 */
export async function rollbackChanges(
  backupInfo?: any,
  error?: Error
): Promise<RollbackResult> {
  if (!backupInfo || !backupInfo.canRestore) {
    return {
      success: false,
      method: "none",
      message: "No backup available for rollback",
      filesRestored: [],
    };
  }

  try {
    switch (backupInfo.backupType) {
      case "git-stash":
        return await rollbackFromGitStash(backupInfo);

      case "database-backup":
        return await rollbackDatabaseChanges(backupInfo);

      case "file-backup":
        return await rollbackFileChanges(backupInfo);

      default:
        return {
          success: false,
          method: "none",
          message: "Unknown backup type for rollback",
          filesRestored: [],
        };
    }
  } catch (rollbackError) {
    return {
      success: false,
      method: "none",
      message: `Rollback failed: ${rollbackError}`,
      filesRestored: [],
    };
  }
}

/**
 * Rollback from git stash
 */
async function rollbackFromGitStash(backupInfo: any): Promise<RollbackResult> {
  try {
    const { execSync } = await import("child_process");

    // Get the latest stash (should be our backup)
    const stashList = execSync("git stash list", { encoding: "utf8" });

    if (stashList.includes(backupInfo.backupPath.replace("stash: ", ""))) {
      // Pop the stash to restore files
      execSync("git stash pop", { encoding: "utf8" });

      return {
        success: true,
        method: "git-stash-pop",
        message: `Successfully restored from git stash: ${backupInfo.backupPath}`,
        filesRestored: ["git-workspace"],
      };
    }

    return {
      success: false,
      method: "git-stash-pop",
      message: "Backup stash not found",
      filesRestored: [],
    };
  } catch (error) {
    return {
      success: false,
      method: "git-stash-pop",
      message: `Git stash rollback failed: ${error}`,
      filesRestored: [],
    };
  }
}

/**
 * Rollback database changes
 */
async function rollbackDatabaseChanges(
  backupInfo: any
): Promise<RollbackResult> {
  try {
    const fs = await import("fs");
    const path = await import("path");

    if (!fs.existsSync(backupInfo.backupPath)) {
      return {
        success: false,
        method: "database-restore",
        message: "Backup file not found for database restore",
        filesRestored: [],
      };
    }

    // Restore schema file from backup
    const schemaPath = "drizzle/schema.ts";
    const backupContent = fs.readFileSync(backupInfo.backupPath, "utf-8");
    fs.writeFileSync(schemaPath, backupContent);

    return {
      success: true,
      method: "database-restore",
      message: `Successfully restored database schema from: ${backupInfo.backupPath}`,
      filesRestored: [schemaPath],
    };
  } catch (error) {
    return {
      success: false,
      method: "database-restore",
      message: `Database rollback failed: ${error}`,
      filesRestored: [],
    };
  }
}

/**
 * Rollback file changes
 */
async function rollbackFileChanges(backupInfo: any): Promise<RollbackResult> {
  try {
    const fs = await import("fs");
    const path = await import("path");

    if (!fs.existsSync(backupInfo.backupPath)) {
      return {
        success: false,
        method: "file-restore",
        message: "Backup directory not found",
        filesRestored: [],
      };
    }

    const filesRestored: string[] = [];
    const backupFiles = fs.readdirSync(backupInfo.backupPath);

    for (const filename of backupFiles) {
      const backupFilePath = path.join(backupInfo.backupPath, filename);
      const originalPath = path.join(process.cwd(), filename);

      if (fs.existsSync(backupFilePath)) {
        const backupContent = fs.readFileSync(backupFilePath, "utf-8");
        fs.writeFileSync(originalPath, backupContent);
        filesRestored.push(originalPath);
      }
    }

    return {
      success: filesRestored.length > 0,
      method: "file-restore",
      message: `Successfully restored ${filesRestored.length} files from backup`,
      filesRestored,
    };
  } catch (error) {
    return {
      success: false,
      method: "file-restore",
      message: `File rollback failed: ${error}`,
      filesRestored: [],
    };
  }
}

export default rollbackChanges;
