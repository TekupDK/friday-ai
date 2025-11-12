import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface WSMessage {
  type: string;
  [key: string]: any;
}

/**
 * Hook for real-time documentation updates via WebSocket
 */
export function useDocsWebSocket() {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedDocs, setSubscribedDocs] = useState<Set<string>>(new Set());
  const listeners = useRef<Map<string, Set<(message: WSMessage) => void>>>(
    new Map()
  );

  // Connect to WebSocket
  useEffect(() => {
    if (!user?.openId) return;

    const wsPort = import.meta.env.VITE_DOCS_WS_PORT || "3002";
    const wsUrl = `ws://localhost:${wsPort}?userId=${user.openId}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("[DocsWS] Connected");
      setIsConnected(true);
    };

    socket.onmessage = event => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        console.log("[DocsWS] Message:", message);

        // Notify all listeners for this message type
        const typeListeners = listeners.current.get(message.type);
        if (typeListeners) {
          typeListeners.forEach(listener => listener(message));
        }

        // Show toast notifications for certain events
        if (message.type === "doc:updated") {
          toast.info("Document updated", {
            description: `${message.document?.title || "A document"} was updated`,
          });
        } else if (message.type === "comment:new") {
          toast.info("New comment", {
            description: "Someone commented on a document",
          });
        } else if (message.type === "doc:conflict") {
          toast.warning("Conflict detected", {
            description: `Conflict in ${message.conflict?.path || "a document"}`,
          });
        }
      } catch (error) {
        console.error("[DocsWS] Failed to parse message:", error);
      }
    };

    socket.onerror = error => {
      console.error("[DocsWS] Error:", error);
      toast.error("WebSocket connection error");
    };

    socket.onclose = () => {
      console.log("[DocsWS] Disconnected");
      setIsConnected(false);
    };

    ws.current = socket;

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user?.openId]);

  // Subscribe to document updates
  const subscribe = useCallback((documentId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.warn("[DocsWS] Cannot subscribe: not connected");
      return;
    }

    ws.current.send(
      JSON.stringify({
        type: "doc:subscribe",
        document_id: documentId,
      })
    );

    setSubscribedDocs(prev => new Set(prev).add(documentId));
    console.log(`[DocsWS] Subscribed to ${documentId}`);
  }, []);

  // Unsubscribe from document updates
  const unsubscribe = useCallback((documentId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.current.send(
      JSON.stringify({
        type: "doc:unsubscribe",
        document_id: documentId,
      })
    );

    setSubscribedDocs(prev => {
      const next = new Set(prev);
      next.delete(documentId);
      return next;
    });

    console.log(`[DocsWS] Unsubscribed from ${documentId}`);
  }, []);

  // Add event listener for specific message types
  const on = useCallback(
    (messageType: string, callback: (message: WSMessage) => void) => {
      if (!listeners.current.has(messageType)) {
        listeners.current.set(messageType, new Set());
      }
      listeners.current.get(messageType)!.add(callback);

      // Return cleanup function
      return () => {
        const typeListeners = listeners.current.get(messageType);
        if (typeListeners) {
          typeListeners.delete(callback);
          if (typeListeners.size === 0) {
            listeners.current.delete(messageType);
          }
        }
      };
    },
    []
  );

  // Send presence update
  const updatePresence = useCallback(
    (documentId: string, cursorPosition?: number) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        return;
      }

      ws.current.send(
        JSON.stringify({
          type: "presence:update",
          presence: {
            user_id: user?.openId,
            document_id: documentId,
            cursor_position: cursorPosition,
            last_seen: new Date().toISOString(),
          },
        })
      );
    },
    [user?.openId]
  );

  return {
    isConnected,
    subscribe,
    unsubscribe,
    on,
    updatePresence,
    subscribedDocs: Array.from(subscribedDocs),
  };
}
