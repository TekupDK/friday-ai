/**
 * CHAT COMMANDS - /commands system
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Search, Calendar, FileText, Users, Zap } from "lucide-react";

export interface Command {
  name: string;
  description: string;
  icon: typeof Search;
  shortcut?: string;
  category: 'action' | 'search' | 'create';
}

const COMMANDS: Command[] = [
  { name: '/search', description: 'Søg i emails og dokumenter', icon: Search, shortcut: '⌘K', category: 'search' },
  { name: '/create-lead', description: 'Opret nyt lead', icon: Users, category: 'create' },
  { name: '/send-quote', description: 'Send tilbud til kunde', icon: FileText, category: 'create' },
  { name: '/book-meeting', description: 'Book møde i kalender', icon: Calendar, category: 'create' },
  { name: '/help', description: 'Vis hjælp og dokumentation', icon: Zap, category: 'action' },
];

interface ChatCommandsProps {
  input: string;
  onSelectCommand: (command: Command) => void;
  onClose: () => void;
}

export function ChatCommands({ input, onSelectCommand, onClose }: ChatCommandsProps) {
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(COMMANDS);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (input.startsWith('/')) {
      const query = input.slice(1).toLowerCase();
      const filtered = COMMANDS.filter(cmd => 
        cmd.name.toLowerCase().includes(query) || 
        cmd.description.toLowerCase().includes(query)
      );
      setFilteredCommands(filtered);
      setSelectedIndex(0);
    }
  }, [input]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        onSelectCommand(filteredCommands[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelectCommand, onClose]);

  if (!input.startsWith('/') || filteredCommands.length === 0) return null;

  return (
    <Card className="absolute bottom-full left-0 right-0 mb-2 p-2 shadow-xl animate-in slide-in-from-bottom-2 fade-in">
      <div className="space-y-1">
        {filteredCommands.map((cmd, idx) => {
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.name}
              onClick={() => onSelectCommand(cmd)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                idx === selectedIndex 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{cmd.name}</div>
                <div className="text-xs opacity-80 truncate">{cmd.description}</div>
              </div>
              {cmd.shortcut && (
                <kbd className="px-2 py-1 text-xs bg-background/20 rounded">{cmd.shortcut}</kbd>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
