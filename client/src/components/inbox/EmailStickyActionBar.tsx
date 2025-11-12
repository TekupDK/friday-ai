/**
 * EmailStickyActionBar - Sticky Action Bar for Bulk Email Operations
 *
 * Appears when 1+ threads are selected
 * Provides quick access to common actions:
 * - Reply, Book, Create Task, Label, Archive
 *
 * Phase 2.1 improvement based on ChatGPT feedback
 */

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Reply,
  Calendar,
  CheckSquare,
  Tag,
  Archive,
  X,
  Mail,
  Clock,
} from "lucide-react";
import type { EmailThread } from "@/types/email-thread";

interface EmailStickyActionBarProps {
  selectedThreads: EmailThread[];
  onReply: () => void;
  onBook: () => void;
  onCreateTask: () => void;
  onLabel: () => void;
  onArchive: () => void;
  onDeselectAll: () => void;
}

export default function EmailStickyActionBar({
  selectedThreads,
  onReply,
  onBook,
  onCreateTask,
  onLabel,
  onArchive,
  onDeselectAll,
}: EmailStickyActionBarProps) {
  const count = selectedThreads.length;
  const hasUnread = selectedThreads.some(t => t.unreadCount > 0);

  return (
    <div
      className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shadow-lg border-b border-primary/20 animate-in slide-in-from-top duration-200"
      role="toolbar"
      aria-label="Bulk email actions"
    >
      {/* Left: Selection count */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={true}
          onCheckedChange={onDeselectAll}
          className="border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
          aria-label="Deselect all"
        />
        <span className="font-semibold text-sm md:text-base">
          {count} {count === 1 ? "thread" : "threads"} valgt
        </span>

        {/* Unread indicator */}
        {hasUnread && (
          <div className="flex items-center gap-1.5 text-xs opacity-90">
            <Mail className="w-3.5 h-3.5" />
            <span>
              {selectedThreads.reduce((sum, t) => sum + t.unreadCount, 0)} ulæst
            </span>
          </div>
        )}
      </div>

      {/* Right: Primary actions */}
      <div className="flex items-center gap-2">
        {/* Reply button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onReply}
          className="font-medium hover:bg-secondary/90 transition-colors"
        >
          <Reply className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Svar</span>
        </Button>

        {/* Book meeting button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onBook}
          className="font-medium hover:bg-secondary/90 transition-colors"
        >
          <Calendar className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Book møde</span>
        </Button>

        {/* Create task button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onCreateTask}
          className="font-medium hover:bg-secondary/90 transition-colors hidden md:flex"
        >
          <CheckSquare className="w-4 h-4 mr-1.5" />
          <span>Opgave</span>
        </Button>

        {/* Label button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onLabel}
          className="font-medium hover:bg-secondary/90 transition-colors hidden lg:flex"
        >
          <Tag className="w-4 h-4 mr-1.5" />
          <span>Label</span>
        </Button>

        {/* Archive button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onArchive}
          className="font-medium hover:bg-secondary/90 transition-colors"
        >
          <Archive className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Arkiver</span>
        </Button>

        {/* Close button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onDeselectAll}
          className="ml-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          aria-label="Close action bar"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
