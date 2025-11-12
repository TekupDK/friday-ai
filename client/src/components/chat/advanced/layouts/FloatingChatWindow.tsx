import * as React from "react";
import { X, Minus, Maximize2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface FloatingChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  position?: { x: number; y: number };
  isMinimized?: boolean;
  isMaximized?: boolean;
  title?: string;
  avatar?: string;
  status?: "online" | "away" | "offline" | "busy";
  className?: string;
  children?: React.ReactNode;
}

export function FloatingChatWindow({
  isOpen,
  onClose,
  onMinimize,
  onMaximize,
  position = { x: 20, y: 20 },
  isMinimized = false,
  isMaximized = false,
  title = "Chat",
  avatar,
  status = "online",
  className,
  children,
}: FloatingChatWindowProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = React.useState(position);
  const windowRef = React.useRef<HTMLDivElement>(null);

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      document.body.style.userSelect = "none";
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep window within viewport
    const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - 40; // Leave space for the header

    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));

    setCurrentPos({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = "";
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className={cn(
        "fixed flex flex-col bg-background rounded-lg shadow-xl border border-border overflow-hidden",
        "transition-all duration-200 ease-in-out",
        isMinimized ? "w-64 h-10" : "w-96 h-[500px]",
        isMaximized && !isMinimized ? "w-[95vw] h-[90vh]" : "",
        className
      )}
      style={{
        left: isMinimized ? currentPos.x : currentPos.x,
        top: isMinimized ? `calc(100vh - 60px)` : currentPos.y,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-2 bg-muted/50 border-b border-border cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          {avatar ? (
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatar} alt={title} />
                <AvatarFallback>{title.charAt(0)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                  statusColors[status]
                )}
              />
            </div>
          ) : (
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="font-medium text-sm truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMinimize}
          >
            {isMinimized ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
          </Button>
          {!isMinimized && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMaximize}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {children || (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Ingen samtale valgt
            </div>
          )}
        </div>
      )}

      {/* Minimized state */}
      {isMinimized && (
        <div className="absolute inset-0 flex items-center px-3">
          <div className="flex-1 truncate text-sm">{title}</div>
          <div
            className={cn("h-2 w-2 rounded-full mx-2", statusColors[status])}
          />
        </div>
      )}
    </div>
  );
}

// Usage example:
/*
const [isOpen, setIsOpen] = useState(true)
const [isMinimized, setIsMinimized] = useState(false)
const [isMaximized, setIsMaximized] = useState(false)

<FloatingChatWindow
  isOpen={isOpen}
  isMinimized={isMinimized}
  isMaximized={isMaximized}
  onClose={() => setIsOpen(false)}
  onMinimize={() => setIsMinimized(!isMinimized)}
  onMaximize={() => setIsMaximized(!isMaximized)}
  title="Support Chat"
  status="online"
  avatar="/path/to/avatar.jpg"
>
  <div className="p-4">
    Chat indhold her...
  </div>
</FloatingChatWindow>
*/
