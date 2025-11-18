import { EventEmitter } from "events";
import fs from "fs/promises";
import path from "path";

import chokidar, { type FSWatcher } from "chokidar";
import { simpleGit, type SimpleGit } from "simple-git";

import { logger } from "../../_core/logger";
import type { SyncStatus, Conflict } from "../types";

export interface GitSyncConfig {
  repoPath: string;
  docsPath: string; // relative to repoPath
  branch: string;
  autoCommit: boolean;
  autoPush: boolean;
  commitMessage: (files: string[]) => string;
  watchPatterns: string[]; // glob patterns relative to docsPath
  ignorePatterns: string[];
}

export interface SyncEvent {
  type:
    | "file_changed"
    | "file_added"
    | "file_deleted"
    | "conflict"
    | "sync_complete"
    | "error";
  path?: string;
  files?: string[];
  conflict?: Conflict;
  error?: Error;
}

export class GitSyncEngine extends EventEmitter {
  private git: SimpleGit;
  private watcher: FSWatcher | null = null;
  private syncing = false;
  private queue: Set<string> = new Set();
  private debounce: NodeJS.Timeout | null = null;

  constructor(private config: GitSyncConfig) {
    super();
    this.git = simpleGit(this.config.repoPath);
  }

  async initialize(): Promise<void> {
    try {
      await this.git.cwd(this.config.repoPath);
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) throw new Error(`Not a git repo: ${this.config.repoPath}`);

      await this.git.checkout(this.config.branch);

      // Try to pull, but don't fail if there are unstaged changes
      try {
        await this.pullChanges();
      } catch (pullErr: any) {
        if (pullErr.message?.includes("unstaged changes")) {
          logger.warn(
            { err: pullErr },
            "[GitSync] Skipping pull due to unstaged changes - will continue anyway"
          );
        } else {
          logger.warn(
            { err: pullErr },
            "[GitSync] Pull failed - continuing without pull"
          );
        }
      }

      this.startWatcher();

      logger.info(
        { repoPath: this.config.repoPath, branch: this.config.branch },
        "[GitSync] Initialized"
      );
    } catch (err) {
      logger.error({ err }, "[GitSync] Initialization failed");
      throw err;
    }
  }

  private startWatcher(): void {
    const cwd = path.join(this.config.repoPath, this.config.docsPath);
    this.watcher = chokidar.watch(this.config.watchPatterns, {
      cwd,
      ignored: this.config.ignorePatterns,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 800, pollInterval: 100 },
    });

    this.watcher.on("add", p => this.onFsEvent("file_added", p));
    this.watcher.on("change", p => this.onFsEvent("file_changed", p));
    this.watcher.on("unlink", p => this.onFsEvent("file_deleted", p));

    logger.info({ cwd }, "[GitSync] File watcher started");
  }

  private onFsEvent(type: SyncEvent["type"], relPath: string): void {
    const full = path.join(this.config.docsPath, relPath);
    this.queue.add(full);
    this.emit(type, { type, path: relPath } satisfies SyncEvent);

    if (this.debounce) clearTimeout(this.debounce);
    this.debounce = setTimeout(() => void this.processQueue(), 1200);
  }

  private async processQueue(): Promise<void> {
    if (this.syncing || this.queue.size === 0) return;
    this.syncing = true;

    const files = Array.from(this.queue);
    this.queue.clear();

    try {
      await this.git.add(files);
      const status = await this.git.status();
      if (status.conflicted.length > 0) {
        await this.raiseConflicts(status.conflicted);
        return;
      }

      if (this.config.autoCommit && files.length > 0) {
        await this.git.commit(this.config.commitMessage(files));
        logger.info({ count: files.length }, "[GitSync] Committed changes");
        if (this.config.autoPush) await this.pushChanges();
        this.emit("sync_complete", {
          type: "sync_complete",
          files,
        } as SyncEvent);
      }
    } catch (err) {
      logger.error({ err, files }, "[GitSync] Failed to process changes");
      this.emit("error", { type: "error", error: err as Error } as SyncEvent);
    } finally {
      this.syncing = false;
    }
  }

  async pullChanges(): Promise<void> {
    try {
      await this.git.fetch();
      const status = await this.git.status();
      if (status.conflicted.length > 0) {
        await this.raiseConflicts(status.conflicted);
        return;
      }
      await this.git.pull("origin", this.config.branch, { "--rebase": "true" });
      logger.info("[GitSync] Pulled latest changes");
    } catch (err) {
      logger.error({ err }, "[GitSync] Pull failed");
      throw err;
    }
  }

  async pushChanges(): Promise<void> {
    try {
      await this.git.push("origin", this.config.branch);
      logger.info("[GitSync] Pushed changes");
    } catch (err) {
      logger.error({ err }, "[GitSync] Push failed");
      throw err;
    }
  }

  private async raiseConflicts(conflicted: string[]): Promise<void> {
    logger.warn({ files: conflicted }, "[GitSync] Conflicts detected");
    for (const filePath of conflicted) {
      try {
        const abs = path.join(this.config.repoPath, filePath);
        const content = await fs.readFile(abs, "utf-8");
        const localMatch = content.match(/<<<<<<< HEAD\n([\s\S]*?)\n=======/);
        const remoteMatch = content.match(/=======\n([\s\S]*?)\n>>>>>>>/);

        const conflict: Conflict = {
          document_id: this.pathToId(filePath),
          path: filePath,
          local_content: localMatch?.[1] ?? "",
          remote_content: remoteMatch?.[1] ?? "",
          conflict_markers: content,
        };
        this.emit("conflict", { type: "conflict", conflict } as SyncEvent);
      } catch (err) {
        logger.error({ err, filePath }, "[GitSync] Failed to parse conflict");
      }
    }
  }

  async resolveConflict(
    filePath: string,
    strategy: "accept_local" | "accept_remote" | "manual",
    merged?: string
  ): Promise<void> {
    try {
      const abs = path.join(this.config.repoPath, filePath);
      if (strategy === "manual" && typeof merged === "string") {
        await fs.writeFile(abs, merged, "utf-8");
      } else if (strategy === "accept_local") {
        await this.git.raw(["checkout", "--ours", filePath]);
      } else if (strategy === "accept_remote") {
        await this.git.raw(["checkout", "--theirs", filePath]);
      }
      await this.git.add(filePath);
      logger.info({ filePath, strategy }, "[GitSync] Conflict resolved");
    } catch (err) {
      logger.error({ err, filePath }, "[GitSync] Failed to resolve conflict");
      throw err;
    }
  }

  async getStatus(): Promise<SyncStatus> {
    try {
      const s = await this.git.status();
      return {
        status:
          s.conflicted.length > 0
            ? "conflict"
            : this.syncing
              ? "syncing"
              : "idle",
        last_sync: new Date(),
        pending_changes: this.queue.size,
        conflicts: s.conflicted,
      };
    } catch (err) {
      logger.error({ err }, "[GitSync] Failed to get status");
      return {
        status: "error",
        pending_changes: this.queue.size,
        conflicts: [],
        error: (err as Error).message,
      };
    }
  }

  private pathToId(p: string): string {
    return p.replace(/[^a-zA-Z0-9]/g, "-");
  }

  async stop(): Promise<void> {
    if (this.watcher) await this.watcher.close();
    if (this.debounce) clearTimeout(this.debounce);
    logger.info("[GitSync] Stopped");
  }
}
