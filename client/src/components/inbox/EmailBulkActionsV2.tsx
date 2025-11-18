/**
 * EmailBulkActionsV2 - Modular Bulk Actions Component
 *
 * Extracted from EmailTab for better separation of concerns.
 * Handles bulk operations like mark as read/unread, archive, delete.
 */

import {
  Archive,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export type BulkAction =
  | "markAsRead"
  | "markAsUnread"
  | "archive"
  | "delete"
  | "addLabel"
  | "removeLabel"
  | "clearSelection"
  | "markAllAsRead"
  | "selectAll"
  | "createLead";

interface EmailBulkActionsV2Props {
  selectedEmails: Set<string>;
  onBulkAction: (action: BulkAction, params?: any) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function EmailBulkActionsV2({
  selectedEmails,
  onBulkAction,
  isLoading = false,
  disabled = false,
}: EmailBulkActionsV2Props) {
  const selectedCount = selectedEmails.size;

  // Handle bulk action with safety checks
  const handleBulkAction = useCallback(
    (action: BulkAction, params?: any) => {
      if (selectedCount === 0 || disabled || isLoading) return;
      onBulkAction(action, params);
    },
    [selectedCount, disabled, isLoading, onBulkAction]
  );

  // Clear selection helper
  const handleClearSelection = useCallback(() => {
    if (selectedCount === 0) return;
    onBulkAction("clearSelection");
  }, [selectedCount, onBulkAction]);

  // No emails selected - show empty state
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="p-3 border-b border-border/20 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} valg{selectedCount !== 1 ? "t" : "et"}
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("markAsRead")}
              disabled={disabled || isLoading}
              className="h-7 text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Læst
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("markAsUnread")}
              disabled={disabled || isLoading}
              className="h-7 text-xs"
            >
              <Circle className="w-3 h-3 mr-1" />
              Ulæst
            </Button>

            <Separator orientation="vertical" className="h-5" />

            <Button
              size="sm"
              variant="default"
              onClick={() => handleBulkAction("createLead")}
              disabled={disabled || isLoading}
              className="h-7 text-xs"
              data-testid="create-lead-from-email"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Opret Lead
            </Button>

            <Separator orientation="vertical" className="h-5" />

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("archive")}
              disabled={disabled || isLoading}
              className="h-7 text-xs"
            >
              <Archive className="w-3 h-3 mr-1" />
              Arkiv
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("delete")}
              disabled={disabled || isLoading}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Slet
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearSelection}
            disabled={disabled || isLoading}
            className="h-7 text-xs"
          >
            Annuller
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={disabled || isLoading}
                className="h-7 text-xs"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Fler handlinger</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleBulkAction("addLabel")}
                disabled={disabled || isLoading}
              >
                Tilføj label
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkAction("removeLabel")}
                disabled={disabled || isLoading}
              >
                Fjern label
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleBulkAction("markAllAsRead")}
                disabled={disabled || isLoading}
              >
                Marker alle som læst
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkAction("selectAll")}
                disabled={disabled || isLoading}
              >
                Vælg alle på siden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
