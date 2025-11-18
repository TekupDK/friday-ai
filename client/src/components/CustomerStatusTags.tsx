import { Check, ChevronDown, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "new", label: "Ny", color: "bg-gray-500" },
  { value: "active", label: "Aktiv", color: "bg-green-500" },
  { value: "inactive", label: "Inaktiv", color: "bg-gray-400" },
  { value: "vip", label: "VIP", color: "bg-purple-500" },
  { value: "at_risk", label: "Risk", color: "bg-red-500" },
];

const TYPE_OPTIONS = [
  { value: "private", label: "Privat" },
  { value: "erhverv", label: "Erhverv" },
];

const COMMON_TAGS = [
  "Erhverv",
  "Flytterengøring",
  "Fast rengøring",
  "Hovedrengøring",
  "Vinduespudsning",
  "Kontorrengøring",
  "Gulvvask",
  "Trappevask",
  "Tilbud",
  "Fast kunde",
  "Engangskunde",
  "Referencet",
  "Klubben",
];

interface CustomerStatusTagsProps {
  customerId: number;
  currentStatus: string;
  currentTags: string[];
  currentType: string;
  onUpdate: () => void;
}

export function CustomerStatusTags({
  customerId,
  currentStatus,
  currentTags,
  currentType,
  onUpdate,
}: CustomerStatusTagsProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>(currentTags || []);
  const [status, setStatus] = useState(currentStatus);
  const [customerType, setCustomerType] = useState(currentType);

  const updateProfileMutation = trpc.customer.updateProfile.useMutation({
    onSuccess: () => {
      onUpdate();
      toast.success("Kundeoplysninger opdateret");
    },
    onError: error => {
      toast.error("Kunne ikke opdatere: " + error.message);
      // Reset to original values on error
      setStatus(currentStatus);
      setTags(currentTags || []);
      setCustomerType(currentType);
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateProfileMutation.mutate({
      customerId,
      status: newStatus as any,
    });
    setStatusOpen(false);
  };

  const handleTypeChange = (newType: string) => {
    setCustomerType(newType);
    updateProfileMutation.mutate({
      customerId,
      customerType: newType as any,
    });
    setTypeOpen(false);
  };

  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;

    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    updateProfileMutation.mutate({
      customerId,
      tags: updatedTags,
    });
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    updateProfileMutation.mutate({
      customerId,
      tags: updatedTags,
    });
  };

  const handleAddCommonTag = (tag: string) => {
    if (tags.includes(tag)) return;

    const updatedTags = [...tags, tag];
    setTags(updatedTags);
    updateProfileMutation.mutate({
      customerId,
      tags: updatedTags,
    });
  };

  const getStatusColor = (statusValue: string) => {
    return (
      STATUS_OPTIONS.find(opt => opt.value === statusValue)?.color ||
      "bg-gray-500"
    );
  };

  return (
    <div className="space-y-4">
      {/* Status Dropdown */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !status && "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn("w-2 h-2 rounded-full", getStatusColor(status))}
                />
                {STATUS_OPTIONS.find(opt => opt.value === status)?.label ||
                  "Vælg status"}
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Søg status..." />
              <CommandEmpty>Ingen status fundet.</CommandEmpty>
              <CommandGroup>
                {STATUS_OPTIONS.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleStatusChange(option.value)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("w-2 h-2 rounded-full", option.color)}
                      />
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          status === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Customer Type Dropdown */}
      <div className="space-y-2">
        <Label>Kundetype</Label>
        <Popover open={typeOpen} onOpenChange={setTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !customerType && "text-muted-foreground"
              )}
            >
              {TYPE_OPTIONS.find(opt => opt.value === customerType)?.label ||
                "Vælg type"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Søg type..." />
              <CommandEmpty>Ingen type fundet.</CommandEmpty>
              <CommandGroup>
                {TYPE_OPTIONS.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleTypeChange(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        customerType === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>

        {/* Current Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 pr-1 hover:bg-muted/60 transition-colors"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add New Tag */}
        <div className="flex gap-2">
          <Input
            placeholder="Tilføj tag..."
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleAddTag}
            disabled={!newTag.trim() || tags.includes(newTag.trim())}
            size="sm"
          >
            Tilføj
          </Button>
        </div>

        {/* Common Tags */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Almindelige tags:</p>
          <div className="flex flex-wrap gap-1">
            {COMMON_TAGS.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                  tags.includes(tag) && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleAddCommonTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
