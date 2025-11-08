import { useEffect } from 'react';

interface KeyboardShortcutConfig {
  onSave?: () => void;
  onSearch?: () => void;
  onNew?: () => void;
  onEscape?: () => void;
  onPreview?: () => void;
}

/**
 * Keyboard Shortcuts for Docs System
 * 
 * Shortcuts:
 * - Ctrl+S / Cmd+S: Save document
 * - Ctrl+K / Cmd+K: Focus search
 * - Ctrl+N / Cmd+N: New document
 * - Ctrl+P / Cmd+P: Toggle preview
 * - Escape: Cancel/Close
 */
export function useKeyboardShortcuts(config: KeyboardShortcutConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl+S / Cmd+S - Save
      if (ctrlKey && event.key === 's') {
        event.preventDefault();
        config.onSave?.();
        return;
      }

      // Ctrl+K / Cmd+K - Search
      if (ctrlKey && event.key === 'k') {
        event.preventDefault();
        config.onSearch?.();
        return;
      }

      // Ctrl+N / Cmd+N - New document
      if (ctrlKey && event.key === 'n') {
        event.preventDefault();
        config.onNew?.();
        return;
      }

      // Ctrl+P / Cmd+P - Toggle preview
      if (ctrlKey && event.key === 'p') {
        event.preventDefault();
        config.onPreview?.();
        return;
      }

      // Escape - Cancel
      if (event.key === 'Escape') {
        config.onEscape?.();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config]);
}

/**
 * Show keyboard shortcuts hint
 */
export function KeyboardShortcutsHint() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const mod = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <p className="font-semibold">Keyboard Shortcuts:</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span>{mod}+S</span>
        <span>Save</span>
        <span>{mod}+K</span>
        <span>Search</span>
        <span>{mod}+N</span>
        <span>New Doc</span>
        <span>{mod}+P</span>
        <span>Preview</span>
        <span>Esc</span>
        <span>Cancel</span>
      </div>
    </div>
  );
}
