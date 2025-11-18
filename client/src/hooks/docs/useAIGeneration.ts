/**
 * AI Documentation Generation Hook
 *
 * Provides mutations for AI-powered doc generation:
 * - Generate lead documentation
 * - Update lead documentation
 * - Generate weekly digest
 * - Bulk generate for all leads
 */

import { toast } from "sonner";
import { useLocation } from "wouter";

import { trpc } from "@/lib/trpc";

export function useAIGeneration() {
  const [, navigate] = useLocation();

  // Generate documentation for a single lead
  const generateLeadDoc = trpc.docs.generateLeadDoc.useMutation({
    onSuccess: result => {
      if (result.success && result.docId) {
        toast.success("🎉 AI documentation generated!", {
          description: "Click to view the document",
          action: {
            label: "View",
            onClick: () => navigate(`/docs?view=${result.docId}`),
          },
        });
      } else {
        toast.error("Failed to generate documentation", {
          description: result.error || "Unknown error",
        });
      }
    },
    onError: error => {
      toast.error("Failed to generate documentation", {
        description: error.message,
      });
    },
  });

  // Update existing lead documentation
  const updateLeadDoc = trpc.docs.updateLeadDoc.useMutation({
    onSuccess: result => {
      if (result.success) {
        toast.success("✅ Documentation updated!", {
          description: "The document has been refreshed with latest data",
        });
      } else {
        toast.error("Failed to update documentation", {
          description: result.error || "Unknown error",
        });
      }
    },
    onError: error => {
      toast.error("Failed to update documentation", {
        description: error.message,
      });
    },
  });

  // Generate weekly digest
  const generateWeeklyDigest = trpc.docs.generateWeeklyDigest.useMutation({
    onSuccess: result => {
      if (result.success && result.docId) {
        toast.success("📊 Weekly digest generated!", {
          description: "Click to view the digest",
          action: {
            label: "View",
            onClick: () => navigate(`/docs?view=${result.docId}`),
          },
        });
      } else {
        toast.error("Failed to generate digest", {
          description: result.error || "Unknown error",
        });
      }
    },
    onError: error => {
      toast.error("Failed to generate digest", {
        description: error.message,
      });
    },
  });

  // Bulk generate for all leads
  const bulkGenerateLeadDocs = trpc.docs.bulkGenerateLeadDocs.useMutation({
    onSuccess: result => {
      if (result.success) {
        toast.success(`🚀 Bulk generation complete!`, {
          description: `Generated ${result.generated} docs, ${result.failed} failed`,
        });
      } else {
        toast.error("Bulk generation failed");
      }
    },
    onError: error => {
      toast.error("Bulk generation failed", {
        description: error.message,
      });
    },
  });

  return {
    generateLeadDoc,
    updateLeadDoc,
    generateWeeklyDigest,
    bulkGenerateLeadDocs,
    isGenerating:
      generateLeadDoc.isPending ||
      updateLeadDoc.isPending ||
      generateWeeklyDigest.isPending ||
      bulkGenerateLeadDocs.isPending,
  };
}
