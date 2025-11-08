import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Hook for managing documents with tRPC
 */
export function useDocuments(params?: {
  category?: string;
  tags?: string[];
  author?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const queryClient = useQueryClient();

  // List documents
  const { data, isLoading, error } = trpc.docs.list.useQuery(params || {});

  // Create document mutation
  const createMutation = trpc.docs.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", "list"] });
      toast.success("Document created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create document: ${error.message}`);
    },
  });

  // Update document mutation
  const updateMutation = trpc.docs.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs"] });
      toast.success("Document updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update document: ${error.message}`);
    },
  });

  // Delete document mutation
  const deleteMutation = trpc.docs.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", "list"] });
      toast.success("Document deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  return {
    documents: data?.documents || [],
    total: data?.total || 0,
    isLoading,
    error,
    createDocument: createMutation.mutate,
    updateDocument: updateMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for fetching a single document
 */
export function useDocument(id: string | null) {
  const { data, isLoading, error } = trpc.docs.get.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  return {
    document: data,
    isLoading,
    error,
  };
}

/**
 * Hook for document search with facets
 */
export function useDocumentSearch(params: {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  limit?: number;
  offset?: number;
}) {
  const { data, isLoading, error } = trpc.docs.search.useQuery(params);

  return {
    documents: data?.documents || [],
    total: data?.total || 0,
    facets: data?.facets || { categories: {}, tags: {}, authors: {} },
    isLoading,
    error,
  };
}

/**
 * Hook for document comments
 */
export function useDocumentComments(documentId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = trpc.docs.getComments.useQuery(
    { documentId: documentId! },
    { enabled: !!documentId }
  );

  const addCommentMutation = trpc.docs.addComment.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", "comments"] });
      toast.success("Comment added");
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });

  const resolveCommentMutation = trpc.docs.resolveComment.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", "comments"] });
      toast.success("Comment resolved");
    },
    onError: (error) => {
      toast.error(`Failed to resolve comment: ${error.message}`);
    },
  });

  return {
    comments: data || [],
    isLoading,
    error,
    addComment: addCommentMutation.mutate,
    resolveComment: resolveCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
  };
}

/**
 * Hook for conflict management
 */
export function useConflicts() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = trpc.docs.getConflicts.useQuery();

  const resolveConflictMutation = trpc.docs.resolveConflict.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", "conflicts"] });
      toast.success("Conflict resolved");
    },
    onError: (error) => {
      toast.error(`Failed to resolve conflict: ${error.message}`);
    },
  });

  return {
    conflicts: data || [],
    isLoading,
    error,
    resolveConflict: resolveConflictMutation.mutate,
    isResolving: resolveConflictMutation.isPending,
  };
}
