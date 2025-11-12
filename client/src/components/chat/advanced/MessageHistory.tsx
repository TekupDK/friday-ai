/**
 * MESSAGE HISTORY - Chat historik og søgning
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  type: "text" | "image" | "file" | "code" | "task";
  metadata?: Record<string, any>;
}

export interface MessageHistoryData {
  messages: ChatMessage[];
  totalCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    sender?: "user" | "ai";
    type?: ChatMessage["type"];
    search?: string;
  };
}

interface MessageHistoryProps {
  data?: MessageHistoryData;
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  onExport?: (format: "json" | "csv" | "txt") => void;
  onClear?: () => void;
}

export function MessageHistory({
  data,
  onSearch,
  onFilter,
  onExport,
  onClear,
}: MessageHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "user" | "ai">(
    "all"
  );
  const [selectedType, setSelectedType] = useState<string>("all");

  // Default message history
  const defaultData: MessageHistoryData = {
    messages: [
      {
        id: "1",
        content: "Hej! Kan du hjælpe mig med at oprette en ny faktura?",
        sender: "user",
        timestamp: "2024-01-15 14:30",
        type: "text",
      },
      {
        id: "2",
        content:
          "Selvfølgelig! Jeg kan hjælpe dig med at oprette en faktura. Hvilken kunde drejer det sig om?",
        sender: "ai",
        timestamp: "2024-01-15 14:31",
        type: "text",
      },
      {
        id: "3",
        content: "Det er for ABC Corporation",
        sender: "user",
        timestamp: "2024-01-15 14:32",
        type: "text",
      },
      {
        id: "4",
        content:
          "Jeg har oprettet en faktura for ABC Corporation med standard rengøringsservice for 5.000 kr.",
        sender: "ai",
        timestamp: "2024-01-15 14:33",
        type: "task",
        metadata: {
          invoiceId: "F-2024-001",
          amount: 5000,
          customer: "ABC Corporation",
        },
      },
      {
        id: "5",
        content:
          "function calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);\n}",
        sender: "ai",
        timestamp: "2024-01-15 14:35",
        type: "code",
      },
      {
        id: "6",
        content: "Kan du også sende en påmindelse om betaling?",
        sender: "user",
        timestamp: "2024-01-15 14:36",
        type: "text",
      },
      {
        id: "7",
        content:
          "Ja, jeg kan hjælpe med at sende en betalingspåmindelse. Hvornår skal den sendes?",
        sender: "ai",
        timestamp: "2024-01-15 14:37",
        type: "text",
      },
    ],
    totalCount: 127,
    dateRange: {
      start: "2024-01-01",
      end: "2024-01-15",
    },
    filters: {},
  };

  const historyData = data || defaultData;

  const handleSearch = () => {
    onSearch?.(searchQuery);
  };

  const handleFilterChange = (filter: "all" | "user" | "ai") => {
    setSelectedFilter(filter);
    onFilter?.({ sender: filter === "all" ? undefined : filter });
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    onFilter?.({
      type: type === "all" ? undefined : (type as ChatMessage["type"]),
    });
  };

  const getSenderIcon = (sender: ChatMessage["sender"]) => {
    return sender === "user" ? "👤" : "🤖";
  };

  const getSenderLabel = (sender: ChatMessage["sender"]) => {
    return sender === "user" ? "User" : "AI";
  };

  const getTypeIcon = (type: ChatMessage["type"]) => {
    switch (type) {
      case "text":
        return "💬";
      case "image":
        return "🖼️";
      case "file":
        return "📎";
      case "code":
        return "💻";
      case "task":
        return "✅";
      default:
        return "💬";
    }
  };

  const getTypeLabel = (type: ChatMessage["type"]) => {
    switch (type) {
      case "text":
        return "Text";
      case "image":
        return "Image";
      case "file":
        return "File";
      case "code":
        return "Code";
      case "task":
        return "Task";
      default:
        return type;
    }
  };

  const getMessageColor = (sender: ChatMessage["sender"]) => {
    return sender === "user"
      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
      : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
  };

  const filteredMessages = historyData.messages.filter(message => {
    const matchesSearch =
      !searchQuery ||
      message.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSender =
      selectedFilter === "all" || message.sender === selectedFilter;
    const matchesType = selectedType === "all" || message.type === selectedType;
    return matchesSearch && matchesSender && matchesType;
  });

  return (
    <Card className="border-l-4 border-l-teal-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Message History</h4>
              <p className="text-xs text-muted-foreground">
                Chat historik og søgning
              </p>
            </div>
          </div>
          <Badge className="bg-teal-500">
            {historyData.totalCount} beskeder
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Søg i beskeder..."
              className="pl-9 h-10"
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Filters:
          </label>

          {/* Sender Filter */}
          <div className="flex gap-1">
            {(["all", "user", "ai"] as const).map(filter => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs transition-colors",
                  selectedFilter === filter
                    ? "bg-teal-500 text-white"
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                {filter === "all"
                  ? "Alle"
                  : filter === "user"
                    ? "👤 User"
                    : "🤖 AI"}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-1">
            {["all", "text", "code", "task", "image", "file"].map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={cn(
                  "px-2 py-1 rounded text-xs transition-colors",
                  selectedType === type
                    ? "bg-purple-500 text-white"
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                {type === "all"
                  ? "Alle"
                  : `${getTypeIcon(type as ChatMessage["type"])} ${getTypeLabel(type as ChatMessage["type"])}`}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {historyData.dateRange.start} → {historyData.dateRange.end}
            </span>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold">
              Beskeder ({filteredMessages.length})
            </h5>
            {filteredMessages.length !== historyData.messages.length && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilter("all");
                  setSelectedType("all");
                }}
              >
                Ryd filtre
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredMessages.map(message => (
              <div
                key={message.id}
                className={cn(
                  "p-3 rounded-lg border",
                  getMessageColor(message.sender)
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {getSenderIcon(message.sender)}
                    </span>
                    <span className="text-xs font-medium">
                      {getSenderLabel(message.sender)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {getTypeIcon(message.type)} {getTypeLabel(message.type)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp}
                  </span>
                </div>

                <div className="text-sm">
                  {message.type === "code" ? (
                    <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {message.content}
                    </pre>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>

                {message.metadata &&
                  Object.keys(message.metadata).length > 0 && (
                    <div className="mt-2 p-2 rounded bg-white/50 dark:bg-black/20 text-xs">
                      {Object.entries(message.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>{" "}
                          {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {historyData.messages.filter(m => m.sender === "user").length}
            </p>
            <p className="text-blue-600 dark:text-blue-400">User beskeder</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {historyData.messages.filter(m => m.sender === "ai").length}
            </p>
            <p className="text-green-600 dark:text-green-400">AI beskeder</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="font-bold text-purple-700 dark:text-purple-300">
              {historyData.messages.filter(m => m.type === "task").length}
            </p>
            <p className="text-purple-600 dark:text-purple-400">Tasks</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <Button
            onClick={() => onExport?.("json")}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Eksport JSON
          </Button>
          <Button
            onClick={() => onExport?.("csv")}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Eksport CSV
          </Button>
          <Button
            onClick={onClear}
            variant="outline"
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Ryd historik
          </Button>
          <Button className="flex-1 bg-linear-to-r from-teal-600 to-cyan-600">
            <History className="w-4 h-4 mr-2" />
            Hent mere
          </Button>
        </div>
      </div>
    </Card>
  );
}
