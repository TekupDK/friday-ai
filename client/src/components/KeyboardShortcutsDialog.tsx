/**
 * Keyboard Shortcuts Dialog
 * Displays available keyboard shortcuts for accessibility
 * WCAG 2.1.1 (Level A) - Keyboard
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { action: "Navigate email list", keys: ["↑", "↓"] },
        { action: "Select email", keys: ["Enter", "Space"] },
        { action: "Close dialog/modal", keys: ["Esc"] },
        { action: "Focus search", keys: ["Ctrl", "K"] },
      ],
    },
    {
      category: "Email Actions",
      items: [
        { action: "Archive email", keys: ["E"] },
        { action: "Delete email", keys: ["Delete"] },
        { action: "Mark as read/unread", keys: ["U"] },
        { action: "Star email", keys: ["S"] },
      ],
    },
    {
      category: "General",
      items: [
        { action: "Open keyboard shortcuts", keys: ["?", "Shift", "?"] },
        { action: "Focus main content", keys: ["Alt", "M"] },
        { action: "Focus navigation", keys: ["Alt", "N"] },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogDescription>
          Available keyboard shortcuts for navigation and actions. Press{" "}
          <kbd className="px-2 py-1 bg-muted rounded text-sm">Esc</kbd> to close
          this dialog.
        </DialogDescription>

        <div className="space-y-6 py-4">
          {shortcuts.map(category => (
            <div key={category.category}>
              <h3 className="text-sm font-semibold mb-3">
                {category.category}
              </h3>
              <dl className="space-y-2">
                {category.items.map((item, index) => (
                  <div
                    key={`${category.category}-${index}`}
                    className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                  >
                    <dt className="text-sm text-foreground">{item.action}</dt>
                    <dd className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border border-border">
                            {key}
                          </kbd>
                          {keyIndex < item.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>
            Note: Keyboard shortcuts may vary depending on your browser and
            operating system.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
