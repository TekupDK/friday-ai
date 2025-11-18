import { logger } from "../_core/logger";

import { GitSyncEngine, type GitSyncConfig } from "./sync/git-sync-engine";
import { WebSocketHub } from "./ws/websocket-hub";

let engine: GitSyncEngine | null = null;
let hub: WebSocketHub | null = null;

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

export async function startDocsService(): Promise<void> {
  try {
    const repoPath = process.env.DOCS_REPO_PATH || process.cwd();
    const docsPath = process.env.DOCS_PATH || "docs";
    const branch = process.env.DOCS_GIT_BRANCH || "main";
    const wsPort = parseInt(process.env.DOCS_WS_PORT || "3002", 10);

    const config: GitSyncConfig = {
      repoPath,
      docsPath,
      branch,
      autoCommit: readBool(process.env.DOCS_AUTO_COMMIT, true),
      autoPush: readBool(process.env.DOCS_AUTO_PUSH, false),
      commitMessage: files =>
        `docs: update ${files.length} file(s)` +
        (files.length <= 5 ? ` (${files.join(", ")})` : ""),
      watchPatterns: ["**/*.md"],
      ignorePatterns: ["**/node_modules/**", "**/.git/**"],
    };

    engine = new GitSyncEngine(config);

    engine.on("file_added", e =>
      logger.debug({ path: e.path }, "[Docs] file added")
    );
    engine.on("file_changed", e =>
      logger.debug({ path: e.path }, "[Docs] file changed")
    );
    engine.on("file_deleted", e =>
      logger.debug({ path: e.path }, "[Docs] file deleted")
    );
    engine.on("conflict", e =>
      logger.warn({ file: e.conflict?.path }, "[Docs] conflict detected")
    );
    engine.on("error", e =>
      logger.error({ err: e.error }, "[Docs] sync error")
    );
    engine.on("sync_complete", e =>
      logger.info({ count: e.files?.length }, "[Docs] sync complete")
    );

    await engine.initialize();

    hub = new WebSocketHub(wsPort);

    logger.info(
      { repoPath, docsPath, branch, wsPort },
      "[Docs] Service started"
    );
  } catch (err) {
    logger.error({ err }, "[Docs] Failed to start service");
    throw err;
  }
}

export async function stopDocsService(): Promise<void> {
  try {
    if (engine) await engine.stop();
    if (hub) await hub.close();
    engine = null;
    hub = null;
    logger.info("[Docs] Service stopped");
  } catch (err) {
    logger.error({ err }, "[Docs] Failed to stop service");
  }
}
