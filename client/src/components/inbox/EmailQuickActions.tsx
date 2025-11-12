/**
 * EmailQuickActions - Quick Action Menu for Email Items
 *
 * Hover-activated quick actions for efficient email management
 * Includes: Archive, Star, Delete, Snooze, Label
 *
 * Inspired by Shortwave's quick actions
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  Star,
  Trash2,
  Clock,
  Tag,
  MoreHorizontal,
  Mail,
  MailOpen,
} from "lucide-react";

export interface EmailQuickActionsProps {
  threadId: string;
  isStarred?: boolean;
  isRead?: boolean;
  onArchive?: (threadId: string) => void;
  onStar?: (threadId: string) => void;
  onDelete?: (threadId: string) => void;
  onSnooze?: (threadId: string, until: Date) => void;
  onLabel?: (threadId: string, label: string) => void;
  onMarkAsRead?: (threadId: string) => void;
  onMarkAsUnread?: (threadId: string) => void;
}

export default function EmailQuickActions({
  threadId,
  isStarred = false,
  isRead = false,
  onArchive,
  onStar,
  onDelete,
  onSnooze,
  onLabel,
  onMarkAsRead,
  onMarkAsUnread,
}: EmailQuickActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle action with event stop propagation
  const handleAction = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    action();
  };

  // Snooze presets
  const snoozePresets = [
    { label: "Om 1 time", hours: 1 },
    { label: "Om 3 timer", hours: 3 },
    { label: "I morgen kl. 9", hours: 24 }, // Simplified, would calculate actual 9am
    { label: "Næste uge", hours: 7 * 24 },
  ];

  // Quick label presets
  const labelPresets = [
    { label: "Hot Lead", value: "hot-lead", color: "text-red-600" },
    { label: "Sent Offer", value: "sent-offer", color: "text-yellow-600" },
    { label: "Follow Up", value: "follow-up", color: "text-blue-600" },
    { label: "Done", value: "done", color: "text-green-600" },
  ];

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Archive Button */}
      {onArchive && (
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={e => handleAction(() => onArchive(threadId), e)}
          title="Arkivér (e)"
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Star Button */}
      {onStar && (
        <Button
          size="icon"
          variant="ghost"
          className={`h-7 w-7 ${isStarred ? "text-yellow-500" : ""}`}
          onClick={e => handleAction(() => onStar(threadId), e)}
          title="Stjerne (s)"
        >
          <Star className={`h-3.5 w-3.5 ${isStarred ? "fill-current" : ""}`} />
        </Button>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title="Flere handlinger"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48"
          onClick={e => e.stopPropagation()}
        >
          {/* Read/Unread */}
          {isRead && onMarkAsUnread ? (
            <DropdownMenuItem onClick={() => onMarkAsUnread(threadId)}>
              <Mail className="h-4 w-4 mr-2" />
              Markér som ulæst
            </DropdownMenuItem>
          ) : onMarkAsRead ? (
            <DropdownMenuItem onClick={() => onMarkAsRead(threadId)}>
              <MailOpen className="h-4 w-4 mr-2" />
              Markér som læst
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          {/* Snooze Options */}
          {onSnooze && (
            <>
              <DropdownMenuLabel className="text-xs">Snooze</DropdownMenuLabel>
              {snoozePresets.map(preset => (
                <DropdownMenuItem
                  key={preset.label}
                  onClick={() => {
                    const until = new Date();
                    until.setHours(until.getHours() + preset.hours);
                    onSnooze(threadId, until);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {preset.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Label Options */}
          {onLabel && (
            <>
              <DropdownMenuLabel className="text-xs">
                Tilføj Label
              </DropdownMenuLabel>
              {labelPresets.map(preset => (
                <DropdownMenuItem
                  key={preset.value}
                  onClick={() => onLabel(threadId, preset.value)}
                >
                  <Tag className={`h-4 w-4 mr-2 ${preset.color}`} />
                  {preset.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Delete */}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(threadId)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Slet
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
