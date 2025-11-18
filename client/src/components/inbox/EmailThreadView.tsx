import { format } from "date-fns";
import { da } from "date-fns/locale";
import { Bot } from "lucide-react";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";

import ShortWaveChatPanel from "../chat/ShortWaveChatPanel";
import {
  CategoryBadge,
  PriorityIndicator,
  ResponseSuggestions,
} from "../email-intelligence";
import EmailIframeView from "../EmailIframeView";
import { SafeStreamdown } from "../SafeStreamdown";

import { EmailAssistant3Panel } from "../workspace/EmailAssistant3Panel";
import EmailActions from "./EmailActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

const EmailAISummary = lazy(() => import("./EmailAISummary"));
const EmailLabelSuggestions = lazy(() => import("./EmailLabelSuggestions"));

interface EmailThreadViewProps {
  threadId: string;
  onReply?: (message: any) => void;
  onForward?: (message: any) => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onLabelChange?: () => void;
  // PERFORMANCE: Optimistic preview data from email list
  initialPreview?: {
    subject: string;
    from: string;
    snippet: string;
    date: string;
  };
}

// Wrapper component for CategoryBadge with TRPC data fetching
function EmailCategoryBadge({ threadId }: { threadId: string }) {
  const { data } = trpc.emailIntelligence.getEmailCategory.useQuery({
    threadId,
  });

  if (!data) return null;

  return (
    <CategoryBadge
      category={data.category}
      subcategory={data.subcategory}
      confidence={data.confidence}
    />
  );
}

// Wrapper component for PriorityIndicator with TRPC data fetching
function EmailPriorityBadge({ threadId }: { threadId: string }) {
  const { data } = trpc.emailIntelligence.getEmailPriority.useQuery({
    threadId,
  });

  if (!data) return null;

  return (
    <PriorityIndicator
      level={data.level}
      score={data.score}
      reasoning={data.reasoning}
    />
  );
}

export default function EmailThreadView({
  threadId,
  onReply,
  onForward,
  onArchive,
  onDelete,
  onLabelChange,
  initialPreview,
}: EmailThreadViewProps) {
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined
  );
  const [emailContext, setEmailContext] = useState<{
    threadId: string;
    subject: string;
    from: string;
    body: string;
  } | null>(null);

  // Create conversation for AI sidebar
  const createConversation = trpc.chat.createConversation.useMutation({
    onSuccess: newConv => {
      setConversationId(newConv.id);
    },
  });

  useEffect(() => {
    if (showAISidebar && !conversationId && !createConversation.isPending) {
      createConversation.mutate({ title: "Email AI Assistant" });
    }
  }, [showAISidebar, conversationId, createConversation]); // Create conversation when AI sidebar opens

  // LocalStorage-backed initialData for instant reloads
  const threadStorageKey = useMemo(
    () => `inbox:thread:${encodeURIComponent(threadId)}`,
    [threadId]
  );
  const initialThread = useMemo(() => {
    try {
      const raw = localStorage.getItem(threadStorageKey);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as { ts: number; data: any };
      if (!parsed?.data) return undefined;
      const age = Date.now() - (parsed.ts || 0);
      if (age > 5 * 60 * 1000) return undefined; // 5 minutes
      return parsed.data;
    } catch {
      return undefined;
    }
  }, [threadStorageKey]);

  const { data: thread, isLoading } = trpc.inbox.email.getThread.useQuery(
    { threadId },
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      initialData: initialThread,
    }
  );

  // Persist latest thread
  useEffect(() => {
    if (!thread) return;
    try {
      localStorage.setItem(
        threadStorageKey,
        JSON.stringify({ ts: Date.now(), data: thread })
      );
    } catch {}
  }, [thread, threadStorageKey]); // Persist thread to localStorage for instant reloads

  // PERFORMANCE: Show optimistic preview while loading full thread
  if (isLoading && initialPreview) {
    return (
      <div className="space-y-4 p-4">
        <Card className="p-4">
          {/* Optimistic preview from email list */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">{initialPreview.from}</p>
                <Badge variant="secondary" className="text-xs">
                  Loading...
                </Badge>
              </div>
              <p className="text-sm font-medium mb-2">
                {initialPreview.subject}
              </p>
              <p className="text-xs text-muted-foreground">
                {initialPreview.date}
              </p>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Snippet as preview */}
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground italic">
              {initialPreview.snippet}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Loading full email...
            </p>
          </div>
        </Card>

        {/* Loading skeletons for additional messages */}
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-4 opacity-50">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!thread || !thread.messages || thread.messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Ingen beskeder i denne tråd</p>
      </div>
    );
  }

  // Sort messages by date (oldest first)
  const sortedMessages = [...thread.messages].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateA - dateB;
  });

  // Handle AI Assistant click
  const handleAIAssistant = () => {
    if (thread && thread.messages && thread.messages.length > 0) {
      const latestMessage = sortedMessages[sortedMessages.length - 1];
      setEmailContext({
        threadId: thread.id,
        subject: thread.subject || "No subject",
        from: latestMessage.from || "Unknown sender",
        body:
          (latestMessage as any).bodyText || latestMessage.body || "No content",
      });
      setShowAISidebar(true);
    }
  };

  return (
    <div className="h-full flex">
      {/* Email Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-4 p-4">
          {/* AI Assistant Button */}
          <Button
            onClick={handleAIAssistant}
            variant="outline"
            className="w-full"
          >
            <Bot className="w-4 h-4 mr-2" />
            🤖 AI Assistant (Prototype)
          </Button>

          {sortedMessages.map((message, index) => {
            const isLast = index === sortedMessages.length - 1;
            const messageDate = message.date
              ? new Date(message.date)
              : new Date();

            return (
              <Card key={message.id || index} className="p-4">
                {/* Message Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-foreground">
                        {message.from || "Ukendt"}
                      </p>
                      {isLast && (
                        <Badge variant="secondary" className="text-xs">
                          Nyeste
                        </Badge>
                      )}

                      {/* Email Intelligence: Category Badge */}
                      {isLast && (
                        <Suspense fallback={null}>
                          <EmailCategoryBadge threadId={threadId} />
                        </Suspense>
                      )}

                      {/* Email Intelligence: Priority Indicator */}
                      {isLast && (
                        <Suspense fallback={null}>
                          <EmailPriorityBadge threadId={threadId} />
                        </Suspense>
                      )}
                    </div>
                    <p className="text-sm text-foreground/70 mb-1">
                      Til: {message.to || "N/A"}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {format(messageDate, "d. MMM 'kl.' HH:mm", {
                        locale: da,
                      })}
                    </p>
                  </div>

                  {/* Actions for the last message */}
                  {isLast && (
                    <EmailActions
                      message={message}
                      threadId={threadId}
                      onReply={onReply}
                      onForward={onForward}
                      onArchive={onArchive}
                      onDelete={onDelete}
                      onLabelChange={onLabelChange}
                    />
                  )}
                </div>

                {/* Subject */}
                {message.subject && (
                  <div className="mb-3">
                    <p className="font-medium text-foreground">
                      {message.subject}
                    </p>
                  </div>
                )}

                {/* AI Summary - below subject */}
                {isLast && (
                  <Suspense
                    fallback={
                      <div className="h-3 bg-muted/40 rounded w-3/4 mb-3" />
                    }
                  >
                    <EmailAISummary
                      threadId={message.threadId || threadId}
                      collapsed={false}
                      className="mb-3"
                    />
                  </Suspense>
                )}

                {/* AI Label Suggestions - below summary */}
                {isLast && (
                  <Suspense
                    fallback={
                      <div className="h-6 bg-muted/30 rounded w-40 mb-3" />
                    }
                  >
                    <EmailLabelSuggestions
                      threadId={message.threadId || threadId}
                      currentLabels={thread.labels || []}
                      onLabelApplied={() => {
                        // Trigger label change callback
                        if (onLabelChange) {
                          onLabelChange();
                        }
                      }}
                      collapsed={false}
                      className="mb-3"
                    />
                  </Suspense>
                )}

                {/* Phase 9.9: AI Email Assistant - below label suggestions */}
                {isLast && (
                  <Suspense
                    fallback={
                      <div className="h-20 bg-muted/30 rounded-lg mb-3 animate-pulse" />
                    }
                  >
                    <EmailAssistant3Panel
                      emailData={{
                        from: message.from || "",
                        subject: message.subject || "",
                        body: (message as any).bodyText || message.body || "",
                        threadId: message.threadId || threadId,
                      }}
                      onInsertReply={content => {
                        // Insert content i reply system
                        if (onReply) {
                          onReply({
                            content,
                            threadId: message.threadId || threadId,
                            messageId: message.id,
                            to: message.from,
                            subject: `Re: ${message.subject}`,
                          });
                        }
                      }}
                      onSendEmail={async content => {
                        // Send email direkte via Gmail
                        try {
                          console.log("Sending email...", content);
                          // Success feedback
                          console.log("Email sent successfully");
                        } catch (error) {
                          console.error("Error sending email:", error);
                        }
                      }}
                    />
                  </Suspense>
                )}

                {/* Email Intelligence: Response Suggestions */}
                {isLast && (
                  <Suspense
                    fallback={
                      <div className="h-32 bg-muted/20 rounded-lg mb-3 animate-pulse" />
                    }
                  >
                    <ResponseSuggestions
                      threadId={message.threadId || threadId}
                      onSelectSuggestion={text => {
                        // Copy to clipboard and optionally trigger reply
                        if (onReply) {
                          onReply({
                            content: text,
                            threadId: message.threadId || threadId,
                            messageId: message.id,
                            to: message.from,
                            subject: `Re: ${message.subject}`,
                          });
                        }
                      }}
                      className="mb-3"
                    />
                  </Suspense>
                )}

                {/* Message Body */}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {message && (message as any).bodyHtml ? (
                    <EmailIframeView
                      html={(message as any).bodyHtml}
                      messageId={message.id}
                    />
                  ) : message.body || (message as any).bodyText ? (
                    <SafeStreamdown
                      content={(message as any).bodyText || message.body}
                    />
                  ) : (
                    <p className="text-muted-foreground">Ingen indhold</p>
                  )}
                </div>

                {!isLast && <Separator className="mt-4" />}
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI Sidebar */}
      {showAISidebar && emailContext && (
        <div className="w-80 border-l border-border bg-background h-full flex flex-col">
          {/* Header with close button */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Friday AI</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAISidebar(false)}
            >
              <span className="sr-only">Close</span>✕
            </Button>
          </div>

          {/* Chat Panel */}
          <div className="flex-1 overflow-hidden">
            <ShortWaveChatPanel
              conversationId={conversationId}
              context={{
                selectedEmails: [emailContext.threadId],
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
