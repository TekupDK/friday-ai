/**
 * SegmentCard Component
 *
 * Card component for displaying customer segments
 */

import { Edit, Eye, Sparkles, Trash2, Users } from "lucide-react";

import { AppleButton, AppleCard } from "./apple-ui";

import { cn } from "@/lib/utils";

export interface SegmentData {
  id: number;
  name: string;
  description: string | null;
  type: "manual" | "automatic";
  color: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SegmentCardProps {
  segment: SegmentData;
  onEdit: () => void;
  onDelete: () => void;
  onViewMembers: () => void;
}

// Type colors
const TYPE_COLORS = {
  manual: "bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300",
  automatic:
    "bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-300",
};

export function SegmentCard({
  segment,
  onEdit,
  onDelete,
  onViewMembers,
}: SegmentCardProps) {
  const typeColor = TYPE_COLORS[segment.type];

  return (
    <AppleCard variant="elevated" padding="md" hoverable>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{segment.name}</h3>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  typeColor
                )}
              >
                {segment.type === "automatic" ? (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Auto
                  </span>
                ) : (
                  "Manual"
                )}
              </span>
            </div>
            {segment.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {segment.description}
              </p>
            )}
          </div>
        </div>

        {/* Member Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            <strong className="text-foreground">{segment.memberCount}</strong>{" "}
            {segment.memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        {/* Color Badge */}
        {segment.color && (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 border-border"
              style={{ backgroundColor: segment.color }}
              aria-label={`Segment color: ${segment.color}`}
            />
            <span className="text-xs text-muted-foreground">Color</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <AppleButton
            variant="tertiary"
            size="sm"
            onClick={onViewMembers}
            leftIcon={<Eye className="w-3 h-3" />}
            className="flex-1"
          >
            View
          </AppleButton>
          <AppleButton
            variant="tertiary"
            size="sm"
            onClick={onEdit}
            leftIcon={<Edit className="w-3 h-3" />}
          >
            Edit
          </AppleButton>
          <AppleButton
            variant="tertiary"
            size="sm"
            onClick={onDelete}
            leftIcon={<Trash2 className="w-3 h-3" />}
          >
            Delete
          </AppleButton>
        </div>
      </div>
    </AppleCard>
  );
}
