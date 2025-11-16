/**
 * Email Actions Hook
 *
 * Provides tRPC mutations for email actions (archive, mark read/unread)
 * with loading states, error handling, and toast notifications.
 */

import { toast } from "sonner";

import { trpc } from "@/lib/trpc";

export function useEmailActions() {
  const utils = trpc.useUtils();

  // Archive thread mutation
  const archiveMutation = (trpc as any).inbox.email.archive.useMutation({
    onSuccess: () => {
      toast.success("Email archived successfully");
      // Invalidate inbox queries to refresh the list
      utils.inbox.email.list.invalidate();
    },
    onError: (error: any) => {
      console.error("Failed to archive email:", error);
      toast.error(`Failed to archive email: ${error.message}`);
    },
  });

  // Mark thread as read mutation
  const markReadMutation = (
    trpc as any
  ).inbox.email.markThreadAsRead.useMutation({
    onSuccess: () => {
      toast.success("Email marked as read");
      utils.inbox.email.list.invalidate();
    },
    onError: (error: any) => {
      console.error("Failed to mark email as read:", error);
      toast.error(`Failed to mark as read: ${error.message}`);
    },
  });

  // Mark thread as unread mutation
  const markUnreadMutation = (
    trpc as any
  ).inbox.email.markThreadAsUnread.useMutation({
    onSuccess: () => {
      toast.success("Email marked as unread");
      utils.inbox.email.list.invalidate();
    },
    onError: (error: any) => {
      console.error("Failed to mark email as unread:", error);
      toast.error(`Failed to mark as unread: ${error.message}`);
    },
  });

  // Convenience wrapper functions
  const archiveThread = (threadId: string) => {
    archiveMutation.mutate({ threadId });
  };

  const markThreadAsRead = (threadId: string) => {
    markReadMutation.mutate({ threadId });
  };

  const markThreadAsUnread = (threadId: string) => {
    markUnreadMutation.mutate({ threadId });
  };

  return {
    // Mutation objects (for accessing loading, error states)
    archiveMutation,
    markReadMutation,
    markUnreadMutation,

    // Convenience functions
    archiveThread,
    markThreadAsRead,
    markThreadAsUnread,

    // Loading states
    isArchiving: archiveMutation.isPending,
    isMarkingRead: markReadMutation.isPending,
    isMarkingUnread: markUnreadMutation.isPending,

    // Combined loading state
    isLoading:
      archiveMutation.isPending ||
      markReadMutation.isPending ||
      markUnreadMutation.isPending,
  };
}
