/**
 * SegmentForm Component
 *
 * Modal form for creating and editing segments
 */

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppleButton, AppleModal } from "./apple-ui";
import { SegmentBuilder } from "./SegmentBuilder";

import { trpc } from "@/lib/trpc";

interface SegmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId?: number | null;
}

export function SegmentForm({ isOpen, onClose, segmentId }: SegmentFormProps) {
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "manual" as "manual" | "automatic",
    color: "#3B82F6",
    rules: {} as Record<string, any>,
  });

  // Fetch segment if editing
  const { data: segment } = trpc.crm.extensions.listSegments.useQuery(
    undefined,
    {
      enabled: !!segmentId,
      select: data => data?.find(s => s.id === segmentId),
    }
  );

  // Reset form when segment changes
  useEffect(() => {
    if (segment) {
      setFormData({
        name: segment.name,
        description: segment.description || "",
        type: segment.type,
        color: segment.color || "#3B82F6",
        rules: {},
      });
    } else {
      setFormData({
        name: "",
        description: "",
        type: "manual",
        color: "#3B82F6",
        rules: {},
      });
    }
  }, [segment, isOpen]);

  // Create mutation
  const createMutation = trpc.crm.extensions.createSegment.useMutation({
    onSuccess: () => {
      utils.crm.extensions.listSegments.invalidate();
      toast.success("Segment created successfully");
      onClose();
    },
    onError: error => {
      toast.error(error.message || "Failed to create segment");
    },
  });

  // Update mutation
  const updateMutation = trpc.crm.extensions.updateSegment.useMutation({
    onSuccess: () => {
      utils.crm.extensions.listSegments.invalidate();
      toast.success("Segment updated successfully");
      onClose();
    },
    onError: error => {
      toast.error(error.message || "Failed to update segment");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      color: formData.color,
      rules: formData.type === "automatic" ? formData.rules : undefined,
    };

    if (segmentId) {
      await updateMutation.mutateAsync({
        id: segmentId,
        ...data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={onClose}
      title={segmentId ? "Edit Segment" : "Create Segment"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            placeholder="Segment name"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            rows={3}
            placeholder="Segment description"
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-2">
            Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={e =>
              setFormData({
                ...formData,
                type: e.target.value as "manual" | "automatic",
              })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automatic (Rule-based)</option>
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.type === "automatic"
              ? "Automatic segments update based on rules"
              : "Manual segments require adding customers manually"}
          </p>
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium mb-2">
            Color
          </label>
          <div className="flex items-center gap-3">
            <input
              id="color"
              type="color"
              value={formData.color}
              onChange={e =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-16 h-10 border border-border rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={e =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        {/* Rules Editor (for automatic segments) */}
        {formData.type === "automatic" && (
          <div>
            <SegmentBuilder
              rules={formData.rules}
              onChange={newRules =>
                setFormData({ ...formData, rules: newRules })
              }
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <AppleButton type="button" variant="tertiary" onClick={onClose}>
            Cancel
          </AppleButton>
          <AppleButton
            type="submit"
            loading={isSubmitting}
            disabled={!formData.name}
          >
            {segmentId ? "Update" : "Create"}
          </AppleButton>
        </div>
      </form>
    </AppleModal>
  );
}
