/**
 * Generate Lead Documentation Button
 *
 * Standalone button component for generating AI documentation for a lead.
 * Can be used in:
 * - Leads list/table
 * - Lead detail view
 * - Quick actions menu
 */

import { Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAIGeneration } from "@/hooks/docs/useAIGeneration";

interface GenerateLeadDocButtonProps {
  leadId: number;
  leadName?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

export function GenerateLeadDocButton({
  leadId,
  leadName,
  variant = "outline",
  size = "sm",
  showIcon = true,
}: GenerateLeadDocButtonProps) {
  const { generateLeadDoc, isGenerating } = useAIGeneration();

  const handleGenerate = () => {
    generateLeadDoc.mutate({ leadId });
  };

  const isThisLeadGenerating = generateLeadDoc.isPending;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGenerate}
      disabled={isGenerating}
      title={`Generate AI documentation for ${leadName || `lead ${leadId}`}`}
    >
      {isThisLeadGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          {showIcon && <Sparkles className="h-4 w-4 mr-2" />}
          Generate Doc
        </>
      )}
    </Button>
  );
}

/**
 * Compact icon-only version for tight spaces
 */
export function GenerateLeadDocIconButton({
  leadId,
  leadName,
}: Pick<GenerateLeadDocButtonProps, "leadId" | "leadName">) {
  const { generateLeadDoc, isGenerating } = useAIGeneration();

  const handleGenerate = () => {
    generateLeadDoc.mutate({ leadId });
  };

  const isThisLeadGenerating = generateLeadDoc.isPending;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleGenerate}
      disabled={isGenerating}
      title={`Generate AI documentation for ${leadName || `lead ${leadId}`}`}
    >
      {isThisLeadGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
    </Button>
  );
}
