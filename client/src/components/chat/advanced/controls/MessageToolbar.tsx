import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Paperclip,
  Smile,
  AtSign,
  Hash,
  Undo,
  Redo,
  Palette,
  Type,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export interface MessageToolbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onFormat?: (format: string, value?: any) => void;
  onInsert?: (type: string, data?: any) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  activeFormats?: Set<string>;
  canUndo?: boolean;
  canRedo?: boolean;
  showAdvanced?: boolean;
  compact?: boolean;
  className?: string;
}

export function MessageToolbar({
  onFormat,
  onInsert,
  onUndo,
  onRedo,
  activeFormats = new Set(),
  canUndo = false,
  canRedo = false,
  showAdvanced = true,
  compact = false,
  className,
  ...props
}: MessageToolbarProps) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const formatButtons = [
    { key: "bold", icon: Bold, label: "Fed", shortcut: "Ctrl+B" },
    { key: "italic", icon: Italic, label: "Kursiv", shortcut: "Ctrl+I" },
    {
      key: "underline",
      icon: Underline,
      label: "Understreget",
      shortcut: "Ctrl+U",
    },
    { key: "strikethrough", icon: Strikethrough, label: "Gennemstreget" },
    { key: "code", icon: Code, label: "Kode", shortcut: "Ctrl+`" },
  ];

  const structureButtons = [
    { key: "heading1", icon: Heading1, label: "Overskrift 1" },
    { key: "heading2", icon: Heading2, label: "Overskrift 2" },
    { key: "heading3", icon: Heading3, label: "Overskrift 3" },
    { key: "bullet-list", icon: List, label: "Punktopstilling" },
    { key: "ordered-list", icon: ListOrdered, label: "Nummereret liste" },
    { key: "quote", icon: Quote, label: "Citat" },
  ];

  const alignmentButtons = [
    { key: "align-left", icon: AlignLeft, label: "Venstrejuster" },
    { key: "align-center", icon: AlignCenter, label: "Centrer" },
    { key: "align-right", icon: AlignRight, label: "Højrejuster" },
  ];

  const colors = [
    "#000000",
    "#374151",
    "#6B7280",
    "#9CA3AF",
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#EAB308",
    "#22C55E",
    "#06B6D4",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#F43F5E",
    "#84CC16",
    "#10B981",
  ];

  const emojis = [
    "😀",
    "😂",
    "😊",
    "😍",
    "🤔",
    "😮",
    "🙄",
    "😴",
    "👍",
    "👎",
    "❤️",
    "🔥",
    "✨",
    "💯",
    "🎉",
    "🚀",
    "📝",
    "💡",
    "⚡",
    "🔍",
    "📎",
    "📊",
    "📈",
    "🔔",
  ];

  const handleFormat = (format: string) => {
    onFormat?.(format);
  };

  const handleInsert = (type: string, data?: any) => {
    onInsert?.(type, data);
    if (type === "emoji") setShowEmojiPicker(false);
  };

  const handleColorSelect = (color: string) => {
    onFormat?.("color", color);
    setShowColorPicker(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-2 border border-border rounded-lg bg-background",
        compact && "p-1 gap-0.5",
        className
      )}
      {...props}
    >
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
          onClick={onUndo}
          disabled={!canUndo}
          title="Fortryd (Ctrl+Z)"
        >
          <Undo className={cn("h-4 w-4", compact && "h-3 w-3")} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
          onClick={onRedo}
          disabled={!canRedo}
          title="Gentag (Ctrl+Y)"
        >
          <Redo className={cn("h-4 w-4", compact && "h-3 w-3")} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        {formatButtons.map(({ key, icon: Icon, label, shortcut }) => (
          <Toggle
            key={key}
            pressed={activeFormats.has(key)}
            onPressedChange={() => handleFormat(key)}
            size="sm"
            className={cn(
              "h-8 w-8 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              compact && "h-6 w-6"
            )}
            title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
          >
            <Icon className={cn("h-4 w-4", compact && "h-3 w-3")} />
          </Toggle>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Structure */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
            title="Tekststruktur"
          >
            <Type className={cn("h-4 w-4", compact && "h-3 w-3")} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {structureButtons.map(({ key, icon: Icon, label }) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handleFormat(key)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Picker */}
      <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
            title="Tekstfarve"
          >
            <Palette className={cn("h-4 w-4", compact && "h-3 w-3")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="grid grid-cols-4 gap-2 p-2">
            {colors.map(color => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-transparent hover:border-gray-300 transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={color}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Alignment */}
      {showAdvanced && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1">
            {alignmentButtons.map(({ key, icon: Icon, label }) => (
              <Toggle
                key={key}
                pressed={activeFormats.has(key)}
                onPressedChange={() => handleFormat(key)}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                  compact && "h-6 w-6"
                )}
                title={label}
              >
                <Icon className={cn("h-4 w-4", compact && "h-3 w-3")} />
              </Toggle>
            ))}
          </div>
        </>
      )}

      <Separator orientation="vertical" className="h-6" />

      {/* Insert Elements */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
          onClick={() => handleInsert("link")}
          title="Indsæt link"
        >
          <Link className={cn("h-4 w-4", compact && "h-3 w-3")} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
          onClick={() => handleInsert("image")}
          title="Indsæt billede"
        >
          <Image className={cn("h-4 w-4", compact && "h-3 w-3")} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
          onClick={() => handleInsert("attachment")}
          title="Vedhæft fil"
        >
          <Paperclip className={cn("h-4 w-4", compact && "h-3 w-3")} />
        </Button>

        {/* Emoji Picker */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
              title="Indsæt emoji"
            >
              <Smile className={cn("h-4 w-4", compact && "h-3 w-3")} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="grid grid-cols-6 gap-2 p-2">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-accent rounded transition-colors"
                  onClick={() => handleInsert("emoji", emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Mentions */}
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
          onClick={() => handleInsert("mention")}
          title="Nævn bruger"
        >
          <AtSign className={cn("h-4 w-4", compact && "h-3 w-3")} />
        </Button>

        {/* Channels/Tags */}
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", compact && "h-6 w-6")}
          onClick={() => handleInsert("channel")}
          title="Nævn kanal"
        >
          <Hash className={cn("h-4 w-4", compact && "h-3 w-3")} />
        </Button>
      </div>
    </div>
  );
}
