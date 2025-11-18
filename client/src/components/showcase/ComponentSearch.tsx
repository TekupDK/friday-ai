import { useState, useEffect } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface ComponentItem {
  id: string;
  name: string;
  category: string;
  keywords?: string[];
}

interface ComponentSearchProps {
  components: ComponentItem[];
  onSelect: (componentId: string) => void;
}

export function ComponentSearch({
  components,
  onSelect,
}: ComponentSearchProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const groupedComponents = components.reduce(
    (acc, comp) => {
      if (!acc[comp.category]) {
        acc[comp.category] = [];
      }
      acc[comp.category].push(comp);
      return acc;
    },
    {} as Record<string, ComponentItem[]>
  );

  return (
    <>
      <div className="relative w-full max-w-sm">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
                     transition-colors focus-visible:outline-none focus-visible:ring-1 
                     focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 
                     border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground 
                     h-9 px-4 py-2 w-full justify-start text-muted-foreground"
        >
          <span>Søg komponenter...</span>
          <kbd
            className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 
                         rounded border bg-muted px-1.5 font-mono text-[10px] font-medium 
                         text-muted-foreground opacity-100"
          >
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Søg efter komponenter..." />
        <CommandList>
          <CommandEmpty>Ingen komponenter fundet.</CommandEmpty>
          {Object.entries(groupedComponents).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map(item => (
                <CommandItem
                  key={item.id}
                  value={`${item.name} ${item.keywords?.join(" ") || ""}`}
                  onSelect={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                >
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
