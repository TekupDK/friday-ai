import { EventEmitter } from "events";
import { IncomingMessage } from "http";

import { WebSocketServer, WebSocket } from "ws";

import { logger } from "../../_core/logger";
import type { WSClientEvent, WSServerEvent, Presence } from "../types";

export interface WSClient {
  id: string;
  userId: string;
  ws: WebSocket;
  subscribedDocs: Set<string>;
  presence: Map<string, Presence>;
}

export class WebSocketHub extends EventEmitter {
  private wss: WebSocketServer;
  private port: number;
  private maxRetries = 20;
  private retries = 0;
  private clients: Map<string, WSClient> = new Map();
  private subscribers: Map<string, Set<string>> = new Map(); // docId -> clientIds

  constructor(port: number) {
    super();
    this.port = port;
    this.wss = this.createServer(this.port);
    this.bind();
  }

  private createServer(port: number): WebSocketServer {
    const wss = new WebSocketServer({ port });

    // Log once listening so address is available
    wss.on("listening", () => {
      const addr = wss.address();
      logger.info({ addr, port }, "[WSHub] WebSocket server listening");
    });

    // Handle EADDRINUSE by retrying on next port
    wss.on("error", (err: any) => {
      if (err?.code === "EADDRINUSE" && this.retries < this.maxRetries) {
        const next = this.port + 1;
        logger.warn(
          { attempted: this.port, next },
          "[WSHub] Port in use, retrying on next"
        );
        this.retries += 1;
        try {
          wss.removeAllListeners();
          // Close current server if partially opened
          try {
            wss.close();
          } catch {}
        } catch {}
        this.port = next;
        // Recreate server on next port
        this.wss = this.createServer(this.port);
        this.bind();
        return;
      }
      logger.error({ err }, "[WSHub] Server error");
    });

    return wss;
  }

  private bind(): void {
    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      this.onConnection(ws, req);
    });

    // Other server-level errors handled in createServer
  }

  private onConnection(ws: WebSocket, req: IncomingMessage): void {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId") || "anonymous";
    const clientId = this.id();

    const client: WSClient = {
      id: clientId,
      userId,
      ws,
      subscribedDocs: new Set(),
      presence: new Map(),
    };

    this.clients.set(clientId, client);
    logger.info({ clientId, userId }, "[WSHub] Client connected");

    ws.on("message", data => this.onMessage(client, data));

    ws.on("close", () => this.onClose(client));

    ws.on("error", err => {
      logger.error({ err, clientId }, "[WSHub] Client error");
    });

    // initial status
    this.send(client, {
      type: "sync:status",
      status: { status: "idle", pending_changes: 0, conflicts: [] },
    });
  }

  private onMessage(client: WSClient, data: any): void {
    try {
      const msg: WSClientEvent = JSON.parse(data.toString());
      switch (msg.type) {
        case "doc:subscribe":
          this.subscribe(client, msg.document_id);
          break;
        case "doc:unsubscribe":
          this.unsubscribe(client, msg.document_id);
          break;
        case "doc:edit":
          // broadcast lightweight presence update to others
          this.broadcastDoc(
            msg.document_id,
            {
              type: "presence:joined",
              user_id: client.userId,
              document_id: msg.document_id,
            },
            client.id
          );
          break;
        case "comment:add":
          this.emit("comment:add", msg.comment);
          break;
        case "presence:update":
          client.presence.set(msg.presence.document_id, msg.presence);
          this.broadcastDoc(
            msg.presence.document_id,
            {
              type: "presence:joined",
              user_id: client.userId,
              document_id: msg.presence.document_id,
            },
            client.id
          );
          break;
        default:
          logger.warn(
            { type: (msg as any).type },
            "[WSHub] Unknown message type"
          );
      }
    } catch (err) {
      logger.error({ err }, "[WSHub] Failed to parse message");
    }
  }

  private subscribe(client: WSClient, docId: string): void {
    client.subscribedDocs.add(docId);
    if (!this.subscribers.has(docId)) this.subscribers.set(docId, new Set());
    this.subscribers.get(docId)!.add(client.id);

    this.broadcastDoc(
      docId,
      {
        type: "presence:joined",
        user_id: client.userId,
        document_id: docId,
      },
      client.id
    );

    logger.debug({ clientId: client.id, docId }, "[WSHub] Subscribed");
  }

  private unsubscribe(client: WSClient, docId: string): void {
    client.subscribedDocs.delete(docId);
    const set = this.subscribers.get(docId);
    if (set) {
      set.delete(client.id);
      if (set.size === 0) this.subscribers.delete(docId);
    }

    client.presence.delete(docId);

    this.broadcastDoc(
      docId,
      {
        type: "presence:left",
        user_id: client.userId,
        document_id: docId,
      },
      client.id
    );

    logger.debug({ clientId: client.id, docId }, "[WSHub] Unsubscribed");
  }

  private onClose(client: WSClient): void {
    for (const docId of client.subscribedDocs) this.unsubscribe(client, docId);
    this.clients.delete(client.id);
    logger.info({ clientId: client.id }, "[WSHub] Client disconnected");
  }

  private send(client: WSClient, message: WSServerEvent): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  public broadcastAll(message: WSServerEvent): void {
    const payload = JSON.stringify(message);
    for (const c of this.clients.values()) {
      if (c.ws.readyState === WebSocket.OPEN) c.ws.send(payload);
    }
    logger.debug({ clients: this.clients.size }, "[WSHub] Broadcast all");
  }

  public broadcastDoc(
    docId: string,
    message: WSServerEvent,
    excludeId?: string
  ): void {
    const set = this.subscribers.get(docId);
    if (!set) return;
    const payload = JSON.stringify(message);
    for (const clientId of set.values()) {
      if (excludeId && clientId === excludeId) continue;
      const c = this.clients.get(clientId);
      if (c && c.ws.readyState === WebSocket.OPEN) c.ws.send(payload);
    }
    logger.debug(
      { docId, count: set.size, excludeId },
      "[WSHub] Broadcast doc"
    );
  }

  private id(): string {
    return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  public close(): Promise<void> {
    return new Promise(resolve => {
      for (const c of this.clients.values()) c.ws.close();
      this.wss.close(() => {
        logger.info("[WSHub] Server closed");
        resolve();
      });
    });
  }
}
