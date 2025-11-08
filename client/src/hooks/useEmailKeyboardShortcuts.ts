/**
 * useEmailKeyboardShortcuts - Keyboard Shortcuts for Email Management
 * 
 * Shortwave-inspired keyboard shortcuts for efficient email management:
 * - e: Archive
 * - s: Star/unstar
 * - r: Reply
 * - l: Mark as lead
 * - d: Delete
 * - x: Select
 * - a: Select all
 * - Escape: Clear selection
 * 
 * Usage:
 * useEmailKeyboardShortcuts({
 *   onArchive: () => { ... },
 *   onStar: () => { ... },
 *   ...
 * });
 */

import { useEffect, useCallback } from "react";

export interface EmailKeyboardShortcutsConfig {
  enabled?: boolean;
  selectedThreadId?: string | null;
  onArchive?: () => void;
  onStar?: () => void;
  onDelete?: () => void;
  onReply?: () => void;
  onMarkAsLead?: () => void;
  onSelect?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
}

export function useEmailKeyboardShortcuts(config: EmailKeyboardShortcutsConfig) {
  const {
    enabled = true,
    selectedThreadId,
    onArchive,
    onStar,
    onDelete,
    onReply,
    onMarkAsLead,
    onSelect,
    onSelectAll,
    onClearSelection,
    onNavigateUp,
    onNavigateDown,
  } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      // Don't trigger if modifiers are pressed (except Shift for some)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      // Handle shortcuts
      switch (key) {
        case 'e':
          if (onArchive && selectedThreadId) {
            event.preventDefault();
            onArchive();
          }
          break;
        
        case 's':
          if (onStar && selectedThreadId) {
            event.preventDefault();
            onStar();
          }
          break;
        
        case 'r':
          if (onReply && selectedThreadId) {
            event.preventDefault();
            onReply();
          }
          break;
        
        case 'l':
          if (onMarkAsLead && selectedThreadId) {
            event.preventDefault();
            onMarkAsLead();
          }
          break;
        
        case 'd':
          if (onDelete && selectedThreadId) {
            event.preventDefault();
            onDelete();
          }
          break;
        
        case 'x':
          if (onSelect && selectedThreadId) {
            event.preventDefault();
            onSelect();
          }
          break;
        
        case 'a':
          if (onSelectAll && !event.shiftKey) {
            event.preventDefault();
            onSelectAll();
          }
          break;
        
        case 'escape':
          if (onClearSelection) {
            event.preventDefault();
            onClearSelection();
          }
          break;
        
        case 'arrowup':
        case 'k':
          if (onNavigateUp) {
            event.preventDefault();
            onNavigateUp();
          }
          break;
        
        case 'arrowdown':
        case 'j':
          if (onNavigateDown) {
            event.preventDefault();
            onNavigateDown();
          }
          break;
      }
    },
    [
      selectedThreadId,
      onArchive,
      onStar,
      onDelete,
      onReply,
      onMarkAsLead,
      onSelect,
      onSelectAll,
      onClearSelection,
      onNavigateUp,
      onNavigateDown,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: [
      { key: 'e', description: 'Arkivér' },
      { key: 's', description: 'Stjerne' },
      { key: 'r', description: 'Svar' },
      { key: 'l', description: 'Marker som lead' },
      { key: 'd', description: 'Slet' },
      { key: 'x', description: 'Vælg' },
      { key: 'a', description: 'Vælg alle' },
      { key: 'Esc', description: 'Ryd valg' },
      { key: '↑/k', description: 'Naviger op' },
      { key: '↓/j', description: 'Naviger ned' },
    ],
  };
}
