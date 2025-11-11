import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryItem {
  id: string;
  name: string;
  emoji?: string;
}

interface Category {
  name: string;
  emoji?: string;
  items: CategoryItem[];
}

interface CategorySidebarProps {
  categories: Category[];
  activeSection?: string;
  onNavigate: (sectionId: string) => void;
  className?: string;
}

export function CategorySidebar({ 
  categories, 
  activeSection,
  onNavigate,
  className 
}: CategorySidebarProps) {
  return (
    <aside className={cn("sticky top-8 h-[calc(100vh-6rem)]", className)}>
      <ScrollArea className="h-full pr-4">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                {category.emoji && <span>{category.emoji}</span>}
                {category.name}
              </h4>
              <ul className="space-y-1">
                {category.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        "w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        activeSection === item.id
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {item.emoji && <span className="text-xs">{item.emoji}</span>}
                        {item.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
