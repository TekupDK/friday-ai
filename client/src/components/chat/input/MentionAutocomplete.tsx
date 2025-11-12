/**
 * MENTION AUTOCOMPLETE - Smart @mentions med autocomplete
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AtSign,
  Users,
  User,
  Briefcase,
  Star,
  Clock,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface MentionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  department?: string;
  status: "online" | "offline" | "away" | "busy";
  lastSeen?: string;
  recent?: boolean;
  favorite?: boolean;
}

interface MentionAutocompleteProps {
  users?: MentionUser[];
  onMention?: (user: MentionUser) => void;
  onAddFavorite?: (userId: string) => void;
  placeholder?: string;
}

export function MentionAutocomplete({
  users = [],
  onMention,
  onAddFavorite,
  placeholder = "Skriv @ for at mentionere...",
}: MentionAutocompleteProps) {
  const [input, setInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<MentionUser[]>([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "favorites">(
    "all"
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Default users for demo
  const defaultUsers: MentionUser[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@company.com",
      role: "Sales Manager",
      department: "Sales",
      status: "online",
      recent: true,
      favorite: true,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      role: "Customer Success",
      department: "Support",
      status: "online",
      recent: true,
      favorite: false,
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike.w@company.com",
      role: "Technical Lead",
      department: "Engineering",
      status: "away",
      lastSeen: "5 min siden",
      recent: false,
      favorite: true,
    },
    {
      id: "4",
      name: "Emma Davis",
      email: "emma.d@company.com",
      role: "Marketing Specialist",
      department: "Marketing",
      status: "offline",
      lastSeen: "2 timer siden",
      recent: false,
      favorite: false,
    },
    {
      id: "5",
      name: "Alex Chen",
      email: "alex.chen@company.com",
      role: "Senior Developer",
      department: "Engineering",
      status: "online",
      recent: true,
      favorite: false,
    },
    {
      id: "6",
      name: "Lisa Anderson",
      email: "lisa.a@company.com",
      role: "HR Manager",
      department: "Human Resources",
      status: "busy",
      recent: false,
      favorite: true,
    },
  ];

  const mentionUsers = users.length > 0 ? users : defaultUsers;

  useEffect(() => {
    // Check if user is typing a mention
    const words = input.split(" ");
    const lastWord = words[words.length - 1] || "";

    if (lastWord.startsWith("@")) {
      const query = lastWord.substring(1).toLowerCase();
      setMentionQuery(query);

      let filtered = mentionUsers.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
      );

      // Apply tab filtering
      if (activeTab === "recent") {
        filtered = filtered.filter(user => user.recent);
      } else if (activeTab === "favorites") {
        filtered = filtered.filter(user => user.favorite);
      }

      // Sort by relevance
      filtered.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStartsWith = aName.startsWith(query);
        const bStartsWith = bName.startsWith(query);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        if (a.recent && !b.recent) return -1;
        if (!a.recent && b.recent) return 1;

        return aName.localeCompare(bName);
      });

      setFilteredUsers(filtered);
      setShowMentions(true);
      setSelectedUserIndex(0);
    } else {
      setShowMentions(false);
      setFilteredUsers([]);
      setMentionQuery("");
    }
  }, [input, mentionUsers, activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedUserIndex(prev => (prev + 1) % filteredUsers.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedUserIndex(
          prev => (prev - 1 + filteredUsers.length) % filteredUsers.length
        );
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        if (filteredUsers[selectedUserIndex]) {
          selectUser(filteredUsers[selectedUserIndex]);
        }
        break;
      case "Escape":
        setShowMentions(false);
        break;
    }
  };

  const selectUser = (user: MentionUser) => {
    const words = input.split(" ");
    words[words.length - 1] = `@${user.name}`;
    const newInput = words.join(" ");
    setInput(newInput);
    setShowMentions(false);
    onMention?.(user);
  };

  const toggleFavorite = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddFavorite?.(userId);
  };

  const getStatusColor = (status: MentionUser["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: MentionUser["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      case "busy":
        return "Optaget";
      case "offline":
        return "Offline";
      default:
        return status;
    }
  };

  const getDepartmentIcon = (department?: string) => {
    switch (department?.toLowerCase()) {
      case "sales":
        return "💼";
      case "engineering":
        return "👨‍💻";
      case "marketing":
        return "📱";
      case "support":
        return "🎧";
      case "human resources":
        return "👥";
      default:
        return "🏢";
    }
  };

  const getTabCount = (tab: typeof activeTab) => {
    if (tab === "all") return mentionUsers.length;
    if (tab === "recent") return mentionUsers.filter(u => u.recent).length;
    if (tab === "favorites") return mentionUsers.filter(u => u.favorite).length;
    return 0;
  };

  return (
    <Card className="border-l-4 border-l-cyan-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <AtSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Mention Autocomplete</h4>
              <p className="text-xs text-muted-foreground">Smart @mentions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500">{mentionUsers.length} brugere</Badge>
          </div>
        </div>

        {/* Mention Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Skriv en besked:
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
                if (input.split(" ").pop()?.startsWith("@")) {
                  setShowMentions(true);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AtSign className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Mentions Dropdown */}
        {showMentions && (
          <div className="border rounded-lg bg-background shadow-lg">
            {/* Tabs */}
            <div className="flex border-b">
              {(["all", "recent", "favorites"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium transition-colors",
                    activeTab === tab
                      ? "bg-cyan-50 dark:bg-cyan-950/20 border-b-2 border-cyan-500"
                      : "hover:bg-muted/50"
                  )}
                >
                  {tab === "all"
                    ? "Alle"
                    : tab === "recent"
                      ? "Nylige"
                      : "Favoritter"}{" "}
                  ({getTabCount(tab)})
                </button>
              ))}
            </div>

            {/* User List */}
            {filteredUsers.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={cn(
                      "w-full text-left p-3 flex items-center gap-3 transition-colors border-b last:border-b-0",
                      index === selectedUserIndex
                        ? "bg-cyan-50 dark:bg-cyan-950/20 border-l-2 border-l-cyan-500"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                          getStatusColor(user.status)
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{user.name}</span>
                        {user.favorite && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                        {user.recent && (
                          <Clock className="w-3 h-3 text-blue-500" />
                        )}
                        <span className="text-lg">
                          {getDepartmentIcon(user.department)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                        <Badge
                          className={cn("text-xs", getStatusColor(user.status))}
                        >
                          {getStatusLabel(user.status)}
                        </Badge>
                      </div>
                      {user.lastSeen && user.status === "offline" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Sidst set: {user.lastSeen}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={e => toggleFavorite(user.id, e)}
                        className="p-1 rounded hover:bg-muted/50"
                        title={
                          user.favorite
                            ? "Fjern fra favoritter"
                            : "Tilføj til favoritter"
                        }
                      >
                        <Star
                          className={cn(
                            "w-4 h-4",
                            user.favorite
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-400"
                          )}
                        />
                      </button>
                      {index === selectedUserIndex && (
                        <Check className="w-4 h-4 text-cyan-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Ingen brugere fundet for "{mentionQuery}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {mentionUsers.filter(u => u.status === "online").length}
            </p>
            <p className="text-green-600 dark:text-green-400">Online</p>
          </div>
          <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-center">
            <p className="font-bold text-yellow-700 dark:text-yellow-300">
              {
                mentionUsers.filter(
                  u => u.status === "away" || u.status === "busy"
                ).length
              }
            </p>
            <p className="text-yellow-600 dark:text-yellow-400">Away/Busy</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {mentionUsers.filter(u => u.favorite).length}
            </p>
            <p className="text-blue-600 dark:text-blue-400">Favoritter</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="font-bold text-purple-700 dark:text-purple-300">
              {mentionUsers.filter(u => u.recent).length}
            </p>
            <p className="text-purple-600 dark:text-purple-400">Nylige</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
          <div className="flex items-start gap-2">
            <AtSign className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div className="text-xs text-cyan-700 dark:text-cyan-400">
              <p className="font-semibold mb-1">Smart mention features:</p>
              <ul className="space-y-1">
                <li>• Skriv @ for at åbne autocomplete</li>
                <li>• Søg i navn, email eller rolle</li>
                <li>• Brug tabs til at filtrere (Alle/Nylige/Favoritter)</li>
                <li>• Stjernemarkér favoritter for hurtig adgang</li>
                <li>• Se real-time status og sidst set</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button className="flex-1 bg-linear-to-r from-cyan-600 to-blue-600">
            <AtSign className="w-4 h-4 mr-2" />
            Send besked
          </Button>
          <Button
            onClick={() => setInput("")}
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
