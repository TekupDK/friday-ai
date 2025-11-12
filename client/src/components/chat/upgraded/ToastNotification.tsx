/**
 * TOAST NOTIFICATION - Full-featured
 * Toast notifications med auto-dismiss og actions
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // ms, 0 = no auto-dismiss
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts(prev => [...prev, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, updateToast }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast, idx) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={idx}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    color: "text-green-700 dark:text-green-400",
  },
  error: {
    icon: XCircle,
    gradient: "from-red-500 to-rose-600",
    bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    color: "text-red-700 dark:text-red-400",
  },
  warning: {
    icon: AlertCircle,
    gradient: "from-yellow-500 to-orange-600",
    bg: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
    color: "text-yellow-700 dark:text-yellow-400",
  },
  info: {
    icon: Info,
    gradient: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    color: "text-blue-700 dark:text-blue-400",
  },
  loading: {
    icon: Loader2,
    gradient: "from-purple-500 to-pink-600",
    bg: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
    color: "text-purple-700 dark:text-purple-400",
  },
};

function ToastItem({
  toast,
  index,
  onRemove,
}: {
  toast: Toast;
  index: number;
  onRemove: () => void;
}) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border shadow-lg",
        "backdrop-blur-sm animate-in slide-in-from-right-full fade-in",
        config.bg
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-md",
          "bg-linear-to-br",
          config.gradient
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 text-white",
            toast.type === "loading" && "animate-spin"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn("font-semibold text-sm", config.color)}>
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-muted-foreground">{toast.description}</p>
        )}
        {toast.action && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs mt-2"
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </Button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onRemove}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 dark:bg-black/20 overflow-hidden rounded-b-xl">
          <div
            className={cn("h-full bg-linear-to-r", config.gradient)}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// CSS keyframes for progress bar
const styles = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`;

// Add to global styles or inject
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
