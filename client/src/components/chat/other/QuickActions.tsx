/**
 * QUICK ACTIONS - Hurtige handlinger og genveje
 */

import {
  Zap,
  Mail,
  Calendar,
  FileText,
  Users,
  MessageSquare,
  Settings,
  Plus,
  Search,
  Download,
  Upload,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: "communication" | "productivity" | "management" | "tools";
  shortcut?: string;
  color: string;
  action: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onActionExecute?: (actionId: string) => void;
  onCustomAction?: (action: string) => void;
}

export function QuickActions({
  actions = [],
  onActionExecute,
  onCustomAction,
}: QuickActionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customAction, setCustomAction] = useState("");

  // Default quick actions
  const defaultActions: QuickAction[] = [
    {
      id: "1",
      title: "Ny Email",
      description: "Opret og send en ny email",
      icon: Mail,
      category: "communication",
      shortcut: "Ctrl+N",
      color: "from-blue-500 to-indigo-600",
      action: () => onActionExecute?.("new-email"),
    },
    {
      id: "2",
      title: "Book Møde",
      description: "Planlæg et nyt møde i kalenderen",
      icon: Calendar,
      category: "productivity",
      shortcut: "Ctrl+M",
      color: "from-purple-500 to-pink-600",
      action: () => onActionExecute?.("new-meeting"),
    },
    {
      id: "3",
      title: "Opret Faktura",
      description: "Opret en ny faktura til kunde",
      icon: FileText,
      category: "management",
      shortcut: "Ctrl+I",
      color: "from-green-500 to-emerald-600",
      action: () => onActionExecute?.("new-invoice"),
    },
    {
      id: "4",
      title: "Tilføj Bruger",
      description: "Inviter en ny bruger til workspace",
      icon: Users,
      category: "management",
      shortcut: "Ctrl+U",
      color: "from-orange-500 to-red-600",
      action: () => onActionExecute?.("add-user"),
    },
    {
      id: "5",
      title: "Start Chat",
      description: "Start en ny chat samtale",
      icon: MessageSquare,
      category: "communication",
      shortcut: "Ctrl+C",
      color: "from-cyan-500 to-blue-600",
      action: () => onActionExecute?.("new-chat"),
    },
    {
      id: "6",
      title: "Søg",
      description: "Søg i dokumenter, emails eller kontakter",
      icon: Search,
      category: "tools",
      shortcut: "Ctrl+F",
      color: "from-gray-500 to-slate-600",
      action: () => onActionExecute?.("search"),
    },
    {
      id: "7",
      title: "Upload Fil",
      description: "Upload en fil til workspace",
      icon: Upload,
      category: "tools",
      shortcut: "Ctrl+O",
      color: "from-teal-500 to-green-600",
      action: () => onActionExecute?.("upload"),
    },
    {
      id: "8",
      title: "Download Rapport",
      description: "Download ugentlig rapport",
      icon: Download,
      category: "productivity",
      shortcut: "Ctrl+R",
      color: "from-indigo-500 to-purple-600",
      action: () => onActionExecute?.("download-report"),
    },
    {
      id: "9",
      title: "Indstillinger",
      description: "Åbn system indstillinger",
      icon: Settings,
      category: "tools",
      shortcut: "Ctrl+,",
      color: "from-slate-500 to-gray-600",
      action: () => onActionExecute?.("settings"),
    },
    {
      id: "10",
      title: "Hurtig Note",
      description: "Opret en hurtig note",
      icon: FileText,
      category: "productivity",
      shortcut: "Ctrl+Shift+N",
      color: "from-yellow-500 to-orange-600",
      action: () => onActionExecute?.("quick-note"),
    },
  ];

  const quickActions = actions.length > 0 ? actions : defaultActions;

  const filteredActions =
    selectedCategory === "all"
      ? quickActions
      : quickActions.filter(action => action.category === selectedCategory);

  const categories = [
    { id: "all", label: "Alle", count: quickActions.length },
    {
      id: "communication",
      label: "Kommunikation",
      count: quickActions.filter(a => a.category === "communication").length,
    },
    {
      id: "productivity",
      label: "Produktivitet",
      count: quickActions.filter(a => a.category === "productivity").length,
    },
    {
      id: "management",
      label: "Management",
      count: quickActions.filter(a => a.category === "management").length,
    },
    {
      id: "tools",
      label: "Værktøjer",
      count: quickActions.filter(a => a.category === "tools").length,
    },
  ];

  const handleCustomAction = () => {
    if (customAction.trim()) {
      onCustomAction?.(customAction);
      setCustomAction("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomAction();
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Quick Actions</h4>
              <p className="text-xs text-muted-foreground">
                Hurtige handlinger og genveje
              </p>
            </div>
          </div>
          <Badge className="bg-orange-500">
            {quickActions.length} handlinger
          </Badge>
        </div>

        {/* Category Filter */}
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
                  "px-3 py-1 rounded-full text-xs transition-colors",
                  selectedCategory === category.id
                    ? "bg-orange-500 text-white"
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold">Hurtige handlinger:</h5>
            <span className="text-xs text-muted-foreground">
              {filteredActions.length} af {quickActions.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {filteredActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="p-3 rounded-lg bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg bg-linear-to-br flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow",
                        action.color
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {action.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {action.description}
                      </p>
                      {action.shortcut && (
                        <Badge variant="outline" className="text-xs">
                          {action.shortcut}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Action */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Brugerdefineret handling:
          </label>
          <div className="flex gap-2">
            <input
              value={customAction}
              onChange={e => setCustomAction(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Indtast brugerdefineret handling..."
              className="flex-1 h-10 px-3 border rounded-lg text-sm"
            />
            <Button
              onClick={handleCustomAction}
              disabled={!customAction.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tilføj
            </Button>
          </div>
        </div>

        {/* Recent Actions */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Seneste handlinger:</h5>
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-xs">
              <Mail className="w-3 h-3 text-blue-600" />
              <span>Sendt email til ABC Corporation</span>
              <span className="text-muted-foreground">• for 5 min siden</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-xs">
              <FileText className="w-3 h-3 text-green-600" />
              <span>Oprettet faktura F-2024-001</span>
              <span className="text-muted-foreground">• for 15 min siden</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-xs">
              <Calendar className="w-3 h-3 text-purple-600" />
              <span>Booket møde med Kunde A</span>
              <span className="text-muted-foreground">• for 30 min siden</span>
            </div>
          </div>
        </div>

        {/* Action Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {quickActions.filter(a => a.category === "communication").length}
            </p>
            <p className="text-blue-600 dark:text-blue-400">Kommunikation</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {quickActions.filter(a => a.category === "productivity").length}
            </p>
            <p className="text-green-600 dark:text-green-400">Produktivitet</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-center">
            <p className="font-bold text-orange-700 dark:text-orange-300">
              {quickActions.filter(a => a.category === "management").length}
            </p>
            <p className="text-orange-600 dark:text-orange-400">Management</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-950/20 text-center">
            <p className="font-bold text-gray-700 dark:text-gray-300">
              {quickActions.filter(a => a.category === "tools").length}
            </p>
            <p className="text-gray-600 dark:text-gray-400">Værktøjer</p>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-xs text-orange-700 dark:text-orange-400">
              <p className="font-semibold mb-1">Keyboard shortcuts:</p>
              <ul className="space-y-1">
                <li>
                  • <kbd className="px-1 py-0.5 bg-white rounded">Ctrl+N</kbd>{" "}
                  Ny email
                </li>
                <li>
                  • <kbd className="px-1 py-0.5 bg-white rounded">Ctrl+M</kbd>{" "}
                  Nyt møde
                </li>
                <li>
                  • <kbd className="px-1 py-0.5 bg-white rounded">Ctrl+I</kbd>{" "}
                  Ny faktura
                </li>
                <li>
                  • <kbd className="px-1 py-0.5 bg-white rounded">Ctrl+F</kbd>{" "}
                  Søg
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={() => setSelectedCategory("all")}
            variant="outline"
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-2" />
            Vis alle
          </Button>
          <Button
            onClick={() => setCustomAction("")}
            variant="outline"
            className="flex-1"
          >
            Ryd felt
          </Button>
          <Button className="flex-1 bg-linear-to-r from-orange-600 to-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Tilføj handling
          </Button>
        </div>
      </div>
    </Card>
  );
}
