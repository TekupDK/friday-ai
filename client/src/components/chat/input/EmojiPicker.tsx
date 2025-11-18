/**
 * EMOJI PICKER - Full emoji selector
 */

import { Smile, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const EMOJI_CATEGORIES = {
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
  ],
  gestures: [
    "👋",
    "🤚",
    "🖐",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝",
    "👍",
  ],
  hearts: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❤️‍🔥",
    "❤️‍🩹",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
  ],
  celebration: [
    "🎉",
    "🎊",
    "🎈",
    "🎁",
    "🎀",
    "🏆",
    "🥇",
    "🥈",
    "🥉",
    "⭐",
    "🌟",
    "✨",
    "💫",
    "🔥",
    "💯",
    "✅",
    "☑️",
    "✔️",
  ],
  objects: [
    "💼",
    "📁",
    "📂",
    "📅",
    "📆",
    "🗓",
    "📊",
    "📈",
    "📉",
    "🗂",
    "📋",
    "📌",
    "📍",
    "📎",
    "🖇",
    "📏",
    "📐",
    "✂️",
    "🗃",
    "🗄",
  ],
  symbols: [
    "⚠️",
    "🚫",
    "✅",
    "❌",
    "⭕",
    "🔴",
    "🟠",
    "🟡",
    "🟢",
    "🔵",
    "🟣",
    "⚪",
    "⚫",
    "🟤",
    "💬",
    "💭",
    "🗯",
    "💡",
    "🔔",
    "🔕",
  ],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  compact?: boolean;
}

export function EmojiPicker({ onSelect, compact = false }: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredEmojis = search
    ? Object.values(EMOJI_CATEGORIES)
        .flat()
        .filter(e => e.includes(search))
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size={compact ? "sm" : "icon"}>
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="end">
        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søg emoji..."
            className="pl-9 h-9"
          />
        </div>

        {/* Search Results or Categories */}
        {filteredEmojis ? (
          <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
            {filteredEmojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
                className="p-2 hover:bg-muted rounded text-2xl transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="smileys" className="w-full">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="smileys" className="text-lg">
                😊
              </TabsTrigger>
              <TabsTrigger value="gestures" className="text-lg">
                👋
              </TabsTrigger>
              <TabsTrigger value="hearts" className="text-lg">
                ❤️
              </TabsTrigger>
              <TabsTrigger value="celebration" className="text-lg">
                🎉
              </TabsTrigger>
              <TabsTrigger value="objects" className="text-lg">
                📋
              </TabsTrigger>
              <TabsTrigger value="symbols" className="text-lg">
                ⭐
              </TabsTrigger>
            </TabsList>

            {Object.entries(EMOJI_CATEGORIES).map(([key, emojis]) => (
              <TabsContent key={key} value={key} className="mt-2">
                <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                  {emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelect(emoji);
                        setOpen(false);
                      }}
                      className="p-2 hover:bg-muted rounded text-2xl transition-transform hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </PopoverContent>
    </Popover>
  );
}
