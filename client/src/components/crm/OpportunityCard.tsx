/**
 * OpportunityCard Component
 *
 * Card component for displaying opportunities in the Kanban board
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, DollarSign, Percent, User } from "lucide-react";

import { AppleCard } from "./apple-ui";

import { cn } from "@/lib/utils";

export type OpportunityStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface OpportunityCardData {
  id: number;
  title: string;
  customerProfileId: number;
  customerName?: string;
  stage: OpportunityStage;
  value: number | null;
  probability: number | null;
  expectedCloseDate: string | null;
  nextSteps: string | null;
}

interface OpportunityCardProps {
  opportunity: OpportunityCardData;
  onClick?: (opportunity: OpportunityCardData) => void;
}

// Stage colors
const STAGE_COLORS: Record<OpportunityStage, string> = {
  lead: "bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700",
  qualified:
    "bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700",
  proposal:
    "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700",
  negotiation:
    "bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700",
  won: "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700",
  lost: "bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700",
};

const STAGE_LABELS: Record<OpportunityStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export function OpportunityCard({
  opportunity,
  onClick,
}: OpportunityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: opportunity.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("da-DK", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "z-50")}
    >
      <AppleCard
        variant="elevated"
        padding="sm"
        hoverable
        pressable
        onClick={() => onClick?.(opportunity)}
        className={cn(
          "mb-2 transition-all",
          STAGE_COLORS[opportunity.stage],
          isDragging && "shadow-lg"
        )}
      >
        <div className="space-y-2">
          {/* Title */}
          <h4 className="font-semibold text-sm leading-tight">
            {opportunity.title}
          </h4>

          {/* Customer Name */}
          {opportunity.customerName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="truncate">{opportunity.customerName}</span>
            </div>
          )}

          {/* Value and Probability */}
          <div className="flex items-center gap-3 text-xs">
            {opportunity.value !== null && (
              <div className="flex items-center gap-1 text-foreground">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">
                  {formatCurrency(opportunity.value)}
                </span>
              </div>
            )}
            {opportunity.probability !== null && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Percent className="w-3 h-3" />
                <span>{opportunity.probability}%</span>
              </div>
            )}
          </div>

          {/* Expected Close Date */}
          {opportunity.expectedCloseDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(opportunity.expectedCloseDate)}</span>
            </div>
          )}

          {/* Next Steps */}
          {opportunity.nextSteps && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {opportunity.nextSteps}
            </p>
          )}

          {/* Stage Badge */}
          <div className="pt-1 border-t border-border/50">
            <span className="text-xs font-medium text-muted-foreground">
              {STAGE_LABELS[opportunity.stage]}
            </span>
          </div>
        </div>
      </AppleCard>
    </div>
  );
}
