/**
 * OpportunityColumn Component - Kanban column for opportunities pipeline
 *
 * Features:
 * - Header with stage name + opportunity count
 * - Droppable area for OpportunityCard components
 * - Empty state when no opportunities
 * - Scrollable content area
 * - Visual feedback for drag-over state
 */

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Inbox } from "lucide-react";

import { AppleCard } from "./apple-ui";
import {
  OpportunityCard,
  type OpportunityCardData,
  type OpportunityStage,
} from "./OpportunityCard";

import { cn } from "@/lib/utils";

interface OpportunityColumnProps {
  stage: OpportunityStage;
  title: string;
  opportunities: OpportunityCardData[];
  onOpportunityClick?: (opportunity: OpportunityCardData) => void;
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

const STAGE_TEXT_COLORS: Record<OpportunityStage, string> = {
  lead: "text-blue-900 dark:text-blue-300",
  qualified: "text-purple-900 dark:text-purple-300",
  proposal: "text-yellow-900 dark:text-yellow-300",
  negotiation: "text-orange-900 dark:text-orange-300",
  won: "text-green-900 dark:text-green-300",
  lost: "text-gray-900 dark:text-gray-300",
};

export function OpportunityColumn({
  stage,
  title,
  opportunities,
  onOpportunityClick,
}: OpportunityColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const opportunityIds = opportunities.map(opp => opp.id.toString());

  return (
    <AppleCard
      variant="elevated"
      className={cn(
        "flex flex-col h-full transition-all min-h-[500px]",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Column Header */}
      <div className={cn("p-4 border-b-2 rounded-t-lg", STAGE_COLORS[stage])}>
        <div className="flex items-center justify-between">
          <h3 className={cn("font-semibold text-sm", STAGE_TEXT_COLORS[stage])}>
            {title}
          </h3>
          <span
            className={cn(
              "text-sm font-medium px-2 py-0.5 rounded-full",
              STAGE_TEXT_COLORS[stage]
            )}
          >
            {opportunities.length}
          </span>
        </div>
      </div>

      {/* Droppable Opportunity List */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 transition-colors overflow-y-auto",
          isOver && "bg-accent/50"
        )}
      >
        <SortableContext
          items={opportunityIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {opportunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No opportunities</p>
                <p className="text-xs">Drag opportunities here</p>
              </div>
            ) : (
              opportunities.map(opportunity => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onClick={onOpportunityClick}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </AppleCard>
  );
}
