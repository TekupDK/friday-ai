import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Keyboard,
  Command,
  ArrowUp,
  ArrowDown,
  Search,
  MessageSquare,
  Archive,
  Star,
  RefreshCw,
  Settings,
} from "lucide-react";

export interface KeyboardShortcutsCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  shortcuts: Array<{
    id: string;
    keys: string[];
    description: string;
    category: string;
    enabled?: boolean;
  }>;
  onShortcutClick?: (shortcut: any) => void;
  onCustomize?: () => void;
  onReset?: () => void;
  showCategories?: boolean;
}

export function KeyboardShortcutsCard({
  shortcuts,
  onShortcutClick,
  onCustomize,
  onReset,
  showCategories = true,
  className,
  ...props
}: KeyboardShortcutsCardProps) {
  const categories = React.useMemo(() => {
    const cats = new Set(shortcuts.map(s => s.category));
    return Array.from(cats);
  }, [shortcuts]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "navigation":
        return ArrowUp;
      case "search":
        return Search;
      case "messages":
        return MessageSquare;
      case "actions":
        return Command;
      default:
        return Keyboard;
    }
  };

  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <React.Fragment key={index}>
        <kbd className="inline-flex items-center rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
          {key}
        </kbd>
        {index < keys.length - 1 && (
          <span className="mx-1 text-muted-foreground">+</span>
        )}
      </React.Fragment>
    ));
  };

  const shortcutsByCategory = React.useMemo(() => {
    if (!showCategories) return { All: shortcuts };

    return shortcuts.reduce(
      (acc, shortcut) => {
        const category = shortcut.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(shortcut);
        return acc;
      },
      {} as Record<string, typeof shortcuts>
    );
  }, [shortcuts, showCategories]);

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-gray-500" />
            Keyboard Shortcuts
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Tastaturgenveje for hurtigere arbejde
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCustomize}>
            <Settings className="h-4 w-4 mr-1" />
            Tilpas
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Nulstil
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.entries(shortcutsByCategory).map(
          ([category, categoryShortcuts]) => {
            const CategoryIcon = getCategoryIcon(category);
            return (
              <div key={category} className="space-y-3">
                {showCategories && (
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm">{category}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {categoryShortcuts.length}
                    </Badge>
                  </div>
                )}

                <div className="space-y-2">
                  {categoryShortcuts.map(shortcut => (
                    <div
                      key={shortcut.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                        shortcut.enabled !== false
                          ? "bg-card"
                          : "bg-muted/50 opacity-60"
                      )}
                      onClick={() => onShortcutClick?.(shortcut)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                          {formatKeys(shortcut.keys)}
                        </div>
                        <div className="w-px h-4 bg-border" />
                        <span className="text-sm text-muted-foreground">
                          {shortcut.description}
                        </span>
                      </div>

                      {!shortcut.enabled && (
                        <Badge variant="outline" className="text-xs">
                          Deaktiveret
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {showCategories &&
                  category !==
                    Object.keys(shortcutsByCategory)[
                      Object.keys(shortcutsByCategory).length - 1
                    ] && <Separator className="my-4" />}
              </div>
            );
          }
        )}

        {/* Popular Shortcuts */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-3">Populære genveje</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
              <div className="flex gap-0.5">
                <kbd className="inline-flex items-center rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-xs font-mono text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                  j
                </kbd>
                <span className="mx-1 text-muted-foreground">/</span>
                <kbd className="inline-flex items-center rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-xs font-mono text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                  k
                </kbd>
              </div>
              <span className="text-xs text-muted-foreground">Navigation</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
              <div className="flex gap-0.5">
                <kbd className="inline-flex items-center rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-xs font-mono text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                  /
                </kbd>
              </div>
              <span className="text-xs text-muted-foreground">Søg</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
              <div className="flex gap-0.5">
                <kbd className="inline-flex items-center rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-xs font-mono text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                  r
                </kbd>
              </div>
              <span className="text-xs text-muted-foreground">Svar</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
              <div className="flex gap-0.5">
                <kbd className="inline-flex items-center rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-xs font-mono text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                  ?
                </kbd>
              </div>
              <span className="text-xs text-muted-foreground">Hjælp</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
