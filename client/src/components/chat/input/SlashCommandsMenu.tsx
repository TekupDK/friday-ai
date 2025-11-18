/**
 * SLASH COMMANDS MENU - /kommandoer i chat
 */

import {
  Slash,
  Command,
  HelpCircle,
  Calendar,
  Mail,
  FileText,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface SlashCommand {
  id: string;
  command: string;
  description: string;
  icon: any;
  category: "action" | "search" | "create" | "help" | "settings";
  shortcut?: string;
  example?: string;
}

interface SlashCommandsMenuProps {
  commands?: SlashCommand[];
  onExecute?: (command: string, params?: string) => void;
  placeholder?: string;
}

export function SlashCommandsMenu({
  commands = [],
  onExecute,
  placeholder = "Skriv / for kommandoer...",
}: SlashCommandsMenuProps) {
  const [input, setInput] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [commandParams, setCommandParams] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<SlashCommand | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Default slash commands
  const defaultCommands: SlashCommand[] = [
    {
      id: "1",
      command: "/help",
      description: "Vis hjælp og kommandoer",
      icon: HelpCircle,
      category: "help",
      shortcut: "Ctrl+H",
    },
    {
      id: "2",
      command: "/search",
      description: "Søg i emails eller dokumenter",
      icon: Search,
      category: "search",
      example: "/search emails from john",
    },
    {
      id: "3",
      command: "/create",
      description: "Opret ny faktura, møde eller opgave",
      icon: Zap,
      category: "create",
      example: "/create invoice for ABC Corp",
    },
    {
      id: "4",
      command: "/calendar",
      description: "Vis kalender eller opret event",
      icon: Calendar,
      category: "action",
      example: "/calendar show this week",
    },
    {
      id: "5",
      command: "/email",
      description: "Skriv eller send email",
      icon: Mail,
      category: "action",
      example: "/email draft to john@abc.com",
    },
    {
      id: "6",
      command: "/invoice",
      description: "Opret eller vis fakturaer",
      icon: FileText,
      category: "action",
      example: "/invoice create for customer XYZ",
    },
    {
      id: "7",
      command: "/settings",
      description: "Åbn indstillinger",
      icon: Settings,
      category: "settings",
      shortcut: "Ctrl+,",
    },
    {
      id: "8",
      command: "/clear",
      description: "Ryd chat historik",
      icon: Command,
      category: "action",
    },
    {
      id: "9",
      command: "/export",
      description: "Eksporter data eller samtale",
      icon: FileText,
      category: "action",
      example: "/export chat as pdf",
    },
    {
      id: "10",
      command: "/status",
      description: "Vis system status",
      icon: Zap,
      category: "help",
    },
  ];

  const slashCommands = commands.length > 0 ? commands : defaultCommands;

  useEffect(() => {
    const lastWord = input.split(" ").pop() || "";
    if (lastWord.startsWith("/")) {
      const query = lastWord.substring(1).toLowerCase();

      // Check if we're selecting a specific command
      const exactMatch = slashCommands.find(cmd => cmd.command === lastWord);
      if (exactMatch) {
        setSelectedCommand(exactMatch);
        setShowCommands(false);
      } else {
        const filtered = slashCommands.filter(cmd =>
          cmd.command.substring(1).toLowerCase().includes(query)
        );
        setFilteredCommands(filtered);
        setShowCommands(true);
        setSelectedCommandIndex(0);
        setSelectedCommand(null);
      }
    } else {
      setShowCommands(false);
      setFilteredCommands([]);
      setSelectedCommand(null);
    }
  }, [input, slashCommands]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showCommands) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev + 1) % filteredCommands.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedCommandIndex(
          prev => (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          selectCommand(filteredCommands[selectedCommandIndex]);
        }
        break;
      case "Tab":
        e.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          selectCommand(filteredCommands[selectedCommandIndex]);
        }
        break;
      case "Escape":
        setShowCommands(false);
        break;
    }
  };

  const selectCommand = (command: SlashCommand) => {
    const words = input.split(" ");
    words[words.length - 1] = command.command;
    const newInput = words.join(" ");
    setInput(newInput);
    setSelectedCommand(command);
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const executeCommand = () => {
    if (selectedCommand) {
      const fullCommand = input.trim();
      const params = fullCommand.replace(selectedCommand.command, "").trim();
      onExecute?.(selectedCommand.command, params);
      setInput("");
      setSelectedCommand(null);
      setCommandParams("");
    }
  };

  const getCategoryColor = (category: SlashCommand["category"]) => {
    switch (category) {
      case "action":
        return "bg-blue-500";
      case "search":
        return "bg-purple-500";
      case "create":
        return "bg-green-500";
      case "help":
        return "bg-orange-500";
      case "settings":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryLabel = (category: SlashCommand["category"]) => {
    switch (category) {
      case "action":
        return "Action";
      case "search":
        return "Search";
      case "create":
        return "Create";
      case "help":
        return "Help";
      case "settings":
        return "Settings";
      default:
        return category;
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
            <Slash className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">Slash Commands</h4>
            <p className="text-xs text-muted-foreground">/kommandoer i chat</p>
          </div>
        </div>

        {/* Command Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Skriv en kommando:
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-10 px-3 border rounded-lg text-sm pr-10"
              onFocus={() => {
                if (input.split(" ").pop()?.startsWith("/")) {
                  setShowCommands(true);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Command className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Commands Dropdown */}
        {showCommands && filteredCommands.length > 0 && (
          <div className="border rounded-lg bg-background shadow-lg max-h-48 overflow-y-auto">
            {filteredCommands.map((command, index) => {
              const Icon = command.icon;
              return (
                <button
                  key={command.id}
                  onClick={() => selectCommand(command)}
                  className={cn(
                    "w-full text-left p-3 flex items-center gap-3 transition-colors",
                    index === selectedCommandIndex
                      ? "bg-purple-50 dark:bg-purple-950/20 border-l-2 border-l-purple-500"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {command.command}
                      </span>
                      <Badge className={getCategoryColor(command.category)}>
                        {getCategoryLabel(command.category)}
                      </Badge>
                      {command.shortcut && (
                        <Badge variant="outline" className="text-xs">
                          {command.shortcut}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {command.description}
                    </p>
                    {command.example && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        Eksempel: {command.example}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Command Details */}
        {selectedCommand && (
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white">
                <selectedCommand.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {selectedCommand.command}
                  </span>
                  <Badge className={getCategoryColor(selectedCommand.category)}>
                    {getCategoryLabel(selectedCommand.category)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedCommand.description}
                </p>

                {selectedCommand.example && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400">
                      Eksempel:
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {selectedCommand.example}
                    </p>
                  </div>
                )}

                {/* Parameter Input */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Parametre (valgfrit):
                  </label>
                  <input
                    value={commandParams}
                    onChange={e => setCommandParams(e.target.value)}
                    placeholder="Tilføj parametre..."
                    className="w-full h-8 px-2 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Commands */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Hurtige kommandoer:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {slashCommands.slice(0, 6).map(command => {
              const Icon = command.icon;
              return (
                <button
                  key={command.id}
                  onClick={() => selectCommand(command)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Icon className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium">{command.command}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-2">
            <Slash className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-700 dark:text-purple-400">
              <p className="font-semibold mb-1">
                Hvordan bruges slash commands:
              </p>
              <ul className="space-y-1">
                <li>• Skriv / for at åbne kommandoliste</li>
                <li>• Brug ↑/↓ piletaster til navigation</li>
                <li>• Tryk Enter eller Tab for at vælge</li>
                <li>• Tilføj parametre efter kommandoen</li>
                <li>• Tryk Enter igen for at eksekvere</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={executeCommand}
            className="flex-1 bg-linear-to-r from-purple-600 to-pink-600"
            disabled={!selectedCommand}
          >
            <Command className="w-4 h-4 mr-2" />
            Eksekver {selectedCommand?.command}
          </Button>
          <Button
            onClick={() => {
              setInput("");
              setSelectedCommand(null);
              setCommandParams("");
            }}
            variant="outline"
            className="flex-1"
          >
            Ryd
          </Button>
        </div>
      </div>
    </Card>
  );
}
