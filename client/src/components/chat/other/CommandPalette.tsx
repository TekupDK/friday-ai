/**
 * COMMAND PALETTE - Kommando palette til hurtig adgang
 */

import {
  Command,
  Zap,
  FileText,
  Mail,
  Calendar,
  Users,
  Settings,
  Search,
  Plus,
  Download,
  Upload,
  Trash2,
  Edit3,
  Clock,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  category:
    | "file"
    | "communication"
    | "productivity"
    | "management"
    | "tools"
    | "navigation";
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  commands?: CommandItem[];
  onCommandExecute?: (commandId: string) => void;
  onRecentCommands?: () => void;
}

export function CommandPalette({
  commands = [],
  onCommandExecute,
  onRecentCommands,
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [recentCommands, setRecentCommands] = useState<string[]>([
    "new-email",
    "create-invoice",
    "book-meeting",
    "search-documents",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default commands
  const defaultCommands: CommandItem[] = [
    // File Commands
    {
      id: "new-document",
      title: "Nyt dokument",
      description: "Opret et nyt dokument",
      icon: FileText,
      category: "file",
      shortcut: "Ctrl+Shift+N",
      keywords: ["dokument", "fil", "opret"],
      action: () => onCommandExecute?.("new-document"),
    },
    {
      id: "open-document",
      title: "Åbn dokument",
      description: "Åbn eksisterende dokument",
      icon: FileText,
      category: "file",
      shortcut: "Ctrl+O",
      keywords: ["åbn", "dokument", "fil"],
      action: () => onCommandExecute?.("open-document"),
    },
    {
      id: "save-document",
      title: "Gem dokument",
      description: "Gem nuværende dokument",
      icon: FileText,
      category: "file",
      shortcut: "Ctrl+S",
      keywords: ["gem", "save", "dokument"],
      action: () => onCommandExecute?.("save-document"),
    },
    {
      id: "download-file",
      title: "Download fil",
      description: "Download en fil fra systemet",
      icon: Download,
      category: "file",
      shortcut: "Ctrl+Shift+D",
      keywords: ["download", "hent", "fil"],
      action: () => onCommandExecute?.("download-file"),
    },
    {
      id: "upload-file",
      title: "Upload fil",
      description: "Upload en fil til systemet",
      icon: Upload,
      category: "file",
      shortcut: "Ctrl+Shift+U",
      keywords: ["upload", "send", "fil"],
      action: () => onCommandExecute?.("upload-file"),
    },

    // Communication Commands
    {
      id: "new-email",
      title: "Ny email",
      description: "Skriv og send en ny email",
      icon: Mail,
      category: "communication",
      shortcut: "Ctrl+N",
      keywords: ["email", "mail", "besked", "send"],
      action: () => onCommandExecute?.("new-email"),
    },
    {
      id: "reply-email",
      title: "Svar på email",
      description: "Svar på den valgte email",
      icon: Mail,
      category: "communication",
      shortcut: "Ctrl+R",
      keywords: ["svar", "reply", "email"],
      action: () => onCommandExecute?.("reply-email"),
    },
    {
      id: "forward-email",
      title: "Videresend email",
      description: "Videresend den valgte email",
      icon: Mail,
      category: "communication",
      shortcut: "Ctrl+Shift+F",
      keywords: ["videresend", "forward", "email"],
      action: () => onCommandExecute?.("forward-email"),
    },

    // Productivity Commands
    {
      id: "book-meeting",
      title: "Book møde",
      description: "Planlæg et nyt møde",
      icon: Calendar,
      category: "productivity",
      shortcut: "Ctrl+M",
      keywords: ["møde", "meeting", "kalender", "book"],
      action: () => onCommandExecute?.("book-meeting"),
    },
    {
      id: "create-task",
      title: "Opret opgave",
      description: "Opret en ny opgave",
      icon: Plus,
      category: "productivity",
      shortcut: "Ctrl+T",
      keywords: ["opgave", "task", "opret"],
      action: () => onCommandExecute?.("create-task"),
    },
    {
      id: "start-timer",
      title: "Start timer",
      description: "Start en tidsregistrering",
      icon: Zap,
      category: "productivity",
      shortcut: "Ctrl+Shift+T",
      keywords: ["timer", "tid", "start"],
      action: () => onCommandExecute?.("start-timer"),
    },

    // Management Commands
    {
      id: "create-invoice",
      title: "Opret faktura",
      description: "Opret en ny faktura",
      icon: FileText,
      category: "management",
      shortcut: "Ctrl+I",
      keywords: ["faktura", "invoice", "opret"],
      action: () => onCommandExecute?.("create-invoice"),
    },
    {
      id: "add-user",
      title: "Tilføj bruger",
      description: "Inviter en ny bruger til workspace",
      icon: Users,
      category: "management",
      shortcut: "Ctrl+U",
      keywords: ["bruger", "user", "inviter", "tilføj"],
      action: () => onCommandExecute?.("add-user"),
    },
    {
      id: "generate-report",
      title: "Generer rapport",
      description: "Generer en ny rapport",
      icon: FileText,
      category: "management",
      shortcut: "Ctrl+Shift+R",
      keywords: ["rapport", "report", "generer"],
      action: () => onCommandExecute?.("generate-report"),
    },

    // Tools Commands
    {
      id: "search",
      title: "Søg",
      description: "Søg i hele systemet",
      icon: Search,
      category: "tools",
      shortcut: "Ctrl+F",
      keywords: ["søg", "search", "find"],
      action: () => onCommandExecute?.("search"),
    },
    {
      id: "settings",
      title: "Indstillinger",
      description: "Åbn system indstillinger",
      icon: Settings,
      category: "tools",
      shortcut: "Ctrl+,",
      keywords: ["indstillinger", "settings", "konfiguration"],
      action: () => onCommandExecute?.("settings"),
    },
    {
      id: "delete-item",
      title: "Slet element",
      description: "Slet det valgte element",
      icon: Trash2,
      category: "tools",
      shortcut: "Delete",
      keywords: ["slet", "delete", "fjern"],
      action: () => onCommandExecute?.("delete-item"),
    },

    // Navigation Commands
    {
      id: "go-to-dashboard",
      title: "Gå til dashboard",
      description: "Naviger til dashboard",
      icon: Command,
      category: "navigation",
      shortcut: "Ctrl+D",
      keywords: ["dashboard", "hjem", "start"],
      action: () => onCommandExecute?.("go-to-dashboard"),
    },
    {
      id: "go-to-inbox",
      title: "Gå til indbakke",
      description: "Naviger til email indbakke",
      icon: Mail,
      category: "navigation",
      shortcut: "Ctrl+Shift+I",
      keywords: ["indbakke", "inbox", "emails"],
      action: () => onCommandExecute?.("go-to-inbox"),
    },
  ];

  const allCommands = commands.length > 0 ? commands : defaultCommands;

  const categories = [
    { id: "all", label: "Alle", count: allCommands.length },
    {
      id: "file",
      label: "Filer",
      count: allCommands.filter(c => c.category === "file").length,
    },
    {
      id: "communication",
      label: "Kommunikation",
      count: allCommands.filter(c => c.category === "communication").length,
    },
    {
      id: "productivity",
      label: "Produktivitet",
      count: allCommands.filter(c => c.category === "productivity").length,
    },
    {
      id: "management",
      label: "Management",
      count: allCommands.filter(c => c.category === "management").length,
    },
    {
      id: "tools",
      label: "Værktøjer",
      count: allCommands.filter(c => c.category === "tools").length,
    },
    {
      id: "navigation",
      label: "Navigation",
      count: allCommands.filter(c => c.category === "navigation").length,
    },
  ];

  const filteredCommands = allCommands.filter(command => {
    const matchesCategory =
      selectedCategory === "all" || command.category === selectedCategory;
    const matchesQuery =
      !query ||
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.keywords?.some(keyword =>
        keyword.toLowerCase().includes(query.toLowerCase())
      );

    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          prev => (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setQuery("");
        break;
    }
  };

  const executeCommand = (command: CommandItem) => {
    command.action();

    // Add to recent commands
    setRecentCommands(prev =>
      [command.id, ...prev.filter(id => id !== command.id)].slice(0, 5)
    );

    // Close palette
    setIsOpen(false);
    setQuery("");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "file":
        return "bg-blue-500";
      case "communication":
        return "bg-green-500";
      case "productivity":
        return "bg-purple-500";
      case "management":
        return "bg-orange-500";
      case "tools":
        return "bg-gray-500";
      case "navigation":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "file":
        return "Filer";
      case "communication":
        return "Kommunikation";
      case "productivity":
        return "Produktivitet";
      case "management":
        return "Management";
      case "tools":
        return "Værktøjer";
      case "navigation":
        return "Navigation";
      default:
        return category;
    }
  };

  const getRecentCommand = (commandId: string) => {
    return allCommands.find(c => c.id === commandId);
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
              <Command className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Command Palette</h4>
              <p className="text-xs text-muted-foreground">
                Kommando palette til hurtig adgang
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500">
              {allCommands.length} kommandoer
            </Badge>
            <Button size="sm" variant="ghost" onClick={onRecentCommands}>
              <Clock className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Command Input */}
        <div className="space-y-2">
          <div className="relative">
            <Command className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Skriv en kommando eller søg..."
              className="pl-9 pr-10 h-10"
              onFocus={() => setIsOpen(true)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+K</kbd>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {isOpen && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Kategorier:
            </label>
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-2 py-1 rounded text-xs transition-colors",
                    selectedCategory === category.id
                      ? "bg-purple-500 text-white"
                      : "bg-muted hover:bg-muted/70"
                  )}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Command List */}
        {isOpen && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h5 className="text-sm font-semibold">
                Kommandoer ({filteredCommands.length}):
              </h5>
              {query && (
                <Button size="sm" variant="ghost" onClick={() => setQuery("")}>
                  Ryd søgning
                </Button>
              )}
            </div>

            {filteredCommands.length > 0 ? (
              <div className="border rounded-lg bg-background max-h-64 overflow-y-auto">
                {filteredCommands.map((command, index) => {
                  const Icon = command.icon;
                  const isRecent = recentCommands.includes(command.id);
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={command.id}
                      onClick={() => executeCommand(command)}
                      className={cn(
                        "w-full text-left p-3 flex items-start gap-3 border-b last:border-b-0 transition-colors",
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/20 border-l-2 border-l-purple-500"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                          getCategoryColor(command.category)
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {command.title}
                          </span>
                          {isRecent && (
                            <Badge variant="outline" className="text-xs">
                              Nylig
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {command.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(command.category)}>
                            {getCategoryLabel(command.category)}
                          </Badge>
                          {command.shortcut && (
                            <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
                              {command.shortcut}
                            </kbd>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Command className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ingen kommandoer fundet</p>
                <p className="text-xs">Prøv en anden søgning</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Commands */}
        {!isOpen && recentCommands.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold">Seneste kommandoer:</h5>
            <div className="space-y-1">
              {recentCommands.slice(0, 3).map(commandId => {
                const command = getRecentCommand(commandId);
                if (!command) return null;
                const Icon = command.icon;

                return (
                  <button
                    key={commandId}
                    onClick={() => executeCommand(command)}
                    className="w-full text-left p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">{command.title}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {getCategoryLabel(command.category)}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-2">
            <Command className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-700 dark:text-purple-400">
              <p className="font-semibold mb-1">Keyboard shortcuts:</p>
              <ul className="space-y-1">
                <li>
                  •{" "}
                  <kbd className="px-1 py-0.5 bg-white rounded text-xs">
                    Ctrl+K
                  </kbd>{" "}
                  Åbn kommando palette
                </li>
                <li>
                  •{" "}
                  <kbd className="px-1 py-0.5 bg-white rounded text-xs">↑↓</kbd>{" "}
                  Naviger kommandoer
                </li>
                <li>
                  •{" "}
                  <kbd className="px-1 py-0.5 bg-white rounded text-xs">
                    Enter
                  </kbd>{" "}
                  Udfør kommando
                </li>
                <li>
                  •{" "}
                  <kbd className="px-1 py-0.5 bg-white rounded text-xs">
                    Esc
                  </kbd>{" "}
                  Luk palette
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={() => {
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="flex-1 bg-linear-to-r from-purple-600 to-pink-600"
          >
            <Command className="w-4 h-4 mr-2" />
            Åbn kommandoer
          </Button>
          <Button
            onClick={onRecentCommands}
            variant="outline"
            className="flex-1"
          >
            <Clock className="w-4 h-4 mr-2" />
            Seneste
          </Button>
        </div>
      </div>
    </Card>
  );
}
