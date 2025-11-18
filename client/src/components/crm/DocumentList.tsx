/**
 * DocumentList Component
 *
 * Lists and displays customer documents with search and filtering
 */

import { FileText, Search, X } from "lucide-react";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { AppleButton, AppleCard, AppleSearchField } from "./apple-ui";
import { DocumentCard, type DocumentData } from "./DocumentCard";
import { DocumentUploader } from "./DocumentUploader";
import { ErrorDisplay } from "./ErrorDisplay";
import { LoadingSpinner } from "./LoadingSpinner";
import { trpc } from "@/lib/trpc";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface DocumentListProps {
  customerProfileId: number;
}

export function DocumentList({ customerProfileId }: DocumentListProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const utils = trpc.useUtils();

  // Fetch documents
  const {
    data: documents,
    isLoading,
    error,
    isError,
  } = trpc.crm.extensions.listDocuments.useQuery({
    customerProfileId,
    category: selectedCategory || undefined,
    limit: 100,
  });

  // Delete mutation with Supabase Storage cleanup
  const deleteMutation = trpc.crm.extensions.deleteDocument.useMutation({
    onSuccess: async (result) => {
      // Also delete file from Supabase Storage if storageUrl is provided
      if (result.storageUrl) {
        try {
          const { supabase } = await import("@/lib/supabaseClient");
          if (supabase) {
            // Extract file path from storage URL
            // Format: https://[project].supabase.co/storage/v1/object/public/customer-documents/documents/[path]
            const url = new URL(result.storageUrl);
            const pathParts = url.pathname.split("/");
            const bucketIndex = pathParts.indexOf("customer-documents");
            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
              const filePath = pathParts.slice(bucketIndex + 1).join("/");
              await supabase.storage
                .from("customer-documents")
                .remove([filePath]);
            }
          }
        } catch (error) {
          console.warn("Failed to delete file from Supabase Storage:", error);
          // Continue even if storage deletion fails - metadata is already deleted
        }
      }
      utils.crm.extensions.listDocuments.invalidate({ customerProfileId });
      toast.success("Document deleted successfully");
    },
    onError: error => {
      console.error("Failed to delete document:", error);
      toast.error(error.message || "Failed to delete document");
    },
  });

  // Filter documents by search query
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (!debouncedSearch) return documents;

    const query = debouncedSearch.toLowerCase();
    return documents.filter(
      doc =>
        doc.filename.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        (Array.isArray(doc.tags) &&
          doc.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );
  }, [documents, debouncedSearch]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!documents) return [];
    const unique = new Set(
      documents.map(doc => doc.category).filter(Boolean) as string[]
    );
    return Array.from(unique).sort();
  }, [documents]);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDownload = (document: DocumentData) => {
    window.open(document.storageUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Upload */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <AppleSearchField
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory || ""}
              onChange={e =>
                setSelectedCategory(e.target.value || null)
              }
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
          <AppleButton
            onClick={() => setShowUploadModal(true)}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Upload Document
          </AppleButton>
        </div>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <LoadingSpinner message="Loading documents..." />
      ) : isError ? (
        <ErrorDisplay message="Failed to load documents" error={error} />
      ) : filteredDocuments && filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(document => (
            <DocumentCard
              key={document.id}
              document={document as any}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      ) : (
        <AppleCard variant="elevated" padding="lg">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload documents to keep them organized with this customer
            </p>
            <AppleButton
              onClick={() => setShowUploadModal(true)}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Upload Document
            </AppleButton>
          </div>
        </AppleCard>
      )}

      {/* Upload Modal */}
      <DocumentUploader
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        customerProfileId={customerProfileId}
      />
    </div>
  );
}

