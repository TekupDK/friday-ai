/**
 * EmailSearchV2 - Modular Search and Filtering Component
 *
 * Extracted from EmailTab for better separation of concerns.
 * Handles search, folder selection, and label filtering.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UI_CONSTANTS } from "@/constants/business";
import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Archive,
  ChevronDown,
  Inbox,
  Mail,
  Search,
  Send,
  Star,
  Tag,
} from "lucide-react";

export type FolderType = "inbox" | "sent" | "archive" | "starred";

interface EmailSearchV2Props {
  searchQuery: string;
  selectedFolder: FolderType;
  selectedLabels: string[];
  availableLabels?: string[];
  onSearchChange: (query: string) => void;
  onFolderChange: (folder: FolderType) => void;
  onLabelsChange: (labels: string[]) => void;
  isLoading?: boolean;
}

const FOLDER_CONFIG = {
  inbox: { icon: Inbox, label: "Indbakke", query: "in:inbox" },
  sent: { icon: Send, label: "Sendt", query: "in:sent" },
  archive: { icon: Archive, label: "Arkiv", query: "-in:inbox" },
  starred: { icon: Star, label: "Stjernemarkerede", query: "is:starred" },
} as const;

export default function EmailSearchV2({
  searchQuery,
  selectedFolder,
  selectedLabels,
  availableLabels = [],
  onSearchChange,
  onFolderChange,
  onLabelsChange,
  isLoading = false,
}: EmailSearchV2Props) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounced search to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(
    localSearchQuery,
    UI_CONSTANTS.SEARCH_DEBOUNCE
  );

  // Update parent when debounced query changes
  const handleSearchChange = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
      onSearchChange(query);
    },
    [onSearchChange]
  );

  // Sync local state with props
  const syncSearchQuery = useCallback(() => {
    if (localSearchQuery !== searchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [localSearchQuery, searchQuery]);

  // Handle label selection
  const handleLabelToggle = useCallback(
    (label: string) => {
      const newLabels = selectedLabels.includes(label)
        ? selectedLabels.filter(l => l !== label)
        : [...selectedLabels, label];
      onLabelsChange(newLabels);
    },
    [selectedLabels, onLabelsChange]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setLocalSearchQuery("");
    onSearchChange("");
    onLabelsChange([]);
  }, [onSearchChange, onLabelsChange]);

  // Memoize active filters count
  const activeFiltersCount = useMemo(() => {
    return (searchQuery.trim() ? 1 : 0) + selectedLabels.length;
  }, [searchQuery, selectedLabels.length]);

  // Memoize folder info
  const currentFolderInfo = useMemo(() => {
    return FOLDER_CONFIG[selectedFolder];
  }, [selectedFolder]);

  return (
    <div className="p-4 border-b border-border/20 bg-background">
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Søg i emails..."
          value={localSearchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-10 pr-4"
          disabled={isLoading}
        />
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 px-2 text-xs"
          >
            Ryd
          </Button>
        )}
      </div>

      {/* Folder and Label Selection */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Folder Selection */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <currentFolderInfo.icon className="w-4 h-4" />
              {currentFolderInfo.label}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Vælg mappe</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(FOLDER_CONFIG).map(([key, config]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => onFolderChange(key as FolderType)}
                className="gap-2"
              >
                <config.icon className="w-4 h-4" />
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Label Selection */}
        {availableLabels.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Tag className="w-4 h-4" />
                Labels
                {selectedLabels.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 text-xs h-4 px-1.5"
                  >
                    {selectedLabels.length}
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 max-h-64 overflow-y-auto"
            >
              <DropdownMenuLabel>Filter by labels</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableLabels.map(label => (
                <DropdownMenuItem
                  key={label}
                  onClick={() => handleLabelToggle(label)}
                  className="gap-2"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedLabels.includes(label) ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Active Filters Display */}
        <div className="flex items-center gap-1 ml-auto">
          {searchQuery.trim() && (
            <Badge variant="secondary" className="text-xs">
              "{searchQuery.trim()}"
            </Badge>
          )}
          {selectedLabels.map(label => (
            <Badge key={label} variant="secondary" className="text-xs gap-1">
              {label}
              <button
                onClick={() => handleLabelToggle(label)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {activeFiltersCount > 0 && (
        <div className="mt-3 pt-3 border-t border-border/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {activeFiltersCount} aktiv{activeFiltersCount !== 1 ? "e" : ""}{" "}
              filter
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs h-6 px-2"
            >
              Nulstil filtre
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
