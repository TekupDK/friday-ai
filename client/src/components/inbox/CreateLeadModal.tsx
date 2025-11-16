import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

export interface CreateLeadModalProps {
  open: boolean;
  onClose: () => void;
  defaults?: {
    name?: string;
    email?: string;
    subject?: string;
    snippet?: string;
    threadId?: string;
    phone?: string;
  };
}

export default function CreateLeadModal({
  open,
  onClose,
  defaults,
}: CreateLeadModalProps) {
  const [name, setName] = useState(defaults?.name || "");
  const [email, setEmail] = useState(defaults?.email || "");
  const [phone, setPhone] = useState(defaults?.phone || "");
  const [company, setCompany] = useState("");

  // Update form when defaults change (when modal opens with new email)
  useEffect(() => {
    if (open && defaults) {
      setName(defaults.name || "");
      setEmail(defaults.email || "");
      setPhone(defaults.phone || "");
      setCompany("");
    }
  }, [open, defaults]);

  const mutation = trpc.inbox.email.createLeadFromEmail.useMutation({
    onSuccess: () => {
      toast.success("Lead created successfully");
      onClose();
    },
    onError: error => {
      toast.error(error.message || "Failed to create lead");
    },
  });

  const isDisabled = useMemo(() => !name || !email, [name, email]);

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Lead from Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+45 ..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input
              id="company"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              mutation.mutate({
                name,
                email,
                phone: phone || undefined,
                company: company || undefined,
                source: "email",
              })
            }
            disabled={isDisabled || mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
