import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Info, XCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-500/10 border-green-500/20",
    iconColor: "text-green-500",
    title: "Success!",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-500/10 border-red-500/20",
    iconColor: "text-red-500",
    title: "Error!",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-orange-500/10 border-orange-500/20",
    iconColor: "text-orange-500",
    title: "Warning!",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-500",
    title: "Info",
  },
};

export function ToastNotificationDemo() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [counter, setCounter] = useState(0);

  const addToast = (type: ToastType) => {
    const newToast: Toast = {
      id: counter,
      type,
      title: toastConfig[type].title,
      message: getRandomMessage(type),
    };

    setToasts(prev => [...prev, newToast]);
    setCounter(c => c + 1);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getRandomMessage = (type: ToastType): string => {
    const messages = {
      success: [
        "Email sent successfully",
        "Lead created and assigned",
        "Task completed",
        "Changes saved",
      ],
      error: [
        "Failed to send email",
        "Network connection lost",
        "Invalid credentials",
        "Server error occurred",
      ],
      warning: [
        "Unsaved changes detected",
        "Low storage space",
        "Session expiring soon",
        "Action requires confirmation",
      ],
      info: [
        "New message received",
        "System update available",
        "Reminder: Meeting in 10 min",
        "Daily backup completed",
      ],
    };

    const msgs = messages[type];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  return (
    <div className="space-y-6">
      {/* Control buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>
            Click buttons to trigger animated toast notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => addToast("success")}
              className="bg-green-500 hover:bg-green-600"
            >
              ✓ Success
            </Button>
            <Button onClick={() => addToast("error")} variant="destructive">
              × Error
            </Button>
            <Button
              onClick={() => addToast("warning")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              ⚠ Warning
            </Button>
            <Button
              onClick={() => addToast("info")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              ℹ Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast, idx) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border shadow-lg",
                "animate-in slide-in-from-right-full duration-300",
                config.bg
              )}
              style={{
                animationDelay: `${idx * 50}ms`,
              }}
            >
              <Icon className={cn("w-5 h-5 mt-0.5", config.iconColor)} />

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
                <p className="text-xs text-muted-foreground">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Example area */}
      <div className="min-h-[200px] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Toasts vil vises i nederste højre hjørne →</p>
      </div>
    </div>
  );
}
