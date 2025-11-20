/**
 * Follow-up Reminders Component
 * Displays and manages email follow-up reminders
 */

import { Calendar, Check, Clock, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { da } from "date-fns/locale";
import { toast } from "sonner";

interface FollowupReminder {
  id: number;
  threadId: string;
  subject?: string | null;
  fromEmail?: string | null;
  reminderDate: string;
  status: "pending" | "completed" | "cancelled" | "overdue";
  priority: "low" | "normal" | "high" | "urgent";
  notes?: string | null;
  sentAt: string;
}

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function FollowupReminders() {
  const [selectedReminder, setSelectedReminder] =
    useState<FollowupReminder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: reminders, isLoading } = trpc.email.listFollowupReminders.useQuery(
    {
      status: "pending",
      limit: 50,
    }
  );

  const markCompleteMutation = trpc.email.markFollowupComplete.useMutation({
    onSuccess: () => {
      utils.email.listFollowupReminders.invalidate();
      toast.success("Follow-up markeret som fuldført");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Fejl: ${error.message}`);
    },
  });

  const cancelMutation = trpc.email.cancelFollowup.useMutation({
    onSuccess: () => {
      utils.email.listFollowupReminders.invalidate();
      toast.success("Follow-up annulleret");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Fejl: ${error.message}`);
    },
  });

  const handleMarkComplete = (reminder: FollowupReminder) => {
    markCompleteMutation.mutate({ followupId: reminder.id });
  };

  const handleCancel = (reminder: FollowupReminder) => {
    cancelMutation.mutate({ followupId: reminder.id });
  };

  const handleOpenEmail = (threadId: string) => {
    // Navigate to email thread
    window.location.href = `/inbox?threadId=${threadId}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Reminders</CardTitle>
          <CardDescription>Indlæser...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const pendingReminders = reminders?.filter(
    r => r.status === "pending" || r.status === "overdue"
  ) || [];

  const overdueCount = reminders?.filter(r => r.status === "overdue").length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Follow-up Reminders
        </CardTitle>
        <CardDescription>
          {pendingReminders.length > 0
            ? `${pendingReminders.length} pending reminder${
                pendingReminders.length !== 1 ? "s" : ""
              }${overdueCount > 0 ? ` (${overdueCount} overdue)` : ""}`
            : "Ingen pending reminders"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingReminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Ingen pending follow-up reminders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={PRIORITY_COLORS[reminder.priority]}
                        variant="secondary"
                      >
                        {reminder.priority}
                      </Badge>
                      <Badge
                        className={STATUS_COLORS[reminder.status]}
                        variant="secondary"
                      >
                        {reminder.status === "overdue" ? "Overdue" : "Pending"}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1 truncate">
                      {reminder.subject || "Ingen emne"}
                    </h4>
                    {reminder.fromEmail && (
                      <p className="text-xs text-gray-600 mb-2">
                        Fra: {reminder.fromEmail}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(reminder.reminderDate), {
                          addSuffix: true,
                          locale: da,
                        })}
                      </span>
                    </div>
                    {reminder.notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        {reminder.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEmail(reminder.threadId)}
                    >
                      Åbn Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReminder(reminder);
                        setIsDialogOpen(true);
                      }}
                    >
                      Se Detaljer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            {selectedReminder && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {selectedReminder.subject || "Follow-up Reminder"}
                  </DialogTitle>
                  <DialogDescription>
                    Detaljer for follow-up reminder
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">
                      <Badge
                        className={STATUS_COLORS[selectedReminder.status]}
                        variant="secondary"
                      >
                        {selectedReminder.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <div className="mt-1">
                      <Badge
                        className={PRIORITY_COLORS[selectedReminder.priority]}
                        variant="secondary"
                      >
                        {selectedReminder.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reminder Date</label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(selectedReminder.reminderDate).toLocaleString(
                        "da-DK"
                      )}
                    </p>
                  </div>
                  {selectedReminder.fromEmail && (
                    <div>
                      <label className="text-sm font-medium">Fra</label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedReminder.fromEmail}
                      </p>
                    </div>
                  )}
                  {selectedReminder.notes && (
                    <div>
                      <label className="text-sm font-medium">Noter</label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedReminder.notes}
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenEmail(selectedReminder.threadId)}
                  >
                    Åbn Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCancel(selectedReminder)}
                    disabled={cancelMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuller
                  </Button>
                  <Button
                    onClick={() => handleMarkComplete(selectedReminder)}
                    disabled={markCompleteMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marker som Fuldført
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/**
 * Follow-up Reminder Badge Component
 * Shows a badge on emails that have pending reminders
 */
export function FollowupReminderBadge({ threadId }: { threadId: string }) {
  const { data: reminders } = trpc.email.listFollowupReminders.useQuery({
    status: "pending",
  });

  const hasReminder = reminders?.some(
    r => r.threadId === threadId && (r.status === "pending" || r.status === "overdue")
  );

  if (!hasReminder) return null;

  const reminder = reminders?.find(
    r => r.threadId === threadId && (r.status === "pending" || r.status === "overdue")
  );

  return (
    <Badge
      className={
        reminder?.status === "overdue"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
      }
      variant="secondary"
      title={`Follow-up reminder: ${reminder?.subject || "Ingen emne"}`}
    >
      <Clock className="h-3 w-3 mr-1" />
      {reminder?.status === "overdue" ? "Overdue" : "Follow-up"}
    </Badge>
  );
}
