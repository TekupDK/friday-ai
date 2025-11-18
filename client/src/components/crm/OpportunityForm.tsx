/**
 * OpportunityForm Component
 *
 * Modal form for creating and editing opportunities
 */

import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppleButton, AppleModal } from "./apple-ui";
import {
  type OpportunityCardData,
  type OpportunityStage,
} from "./OpportunityCard";

import { trpc } from "@/lib/trpc";

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: OpportunityCardData | null;
  customers: Array<{ id: number; name: string | null; email: string }>;
  onDelete?: (id: number) => void;
}

export function OpportunityForm({
  isOpen,
  onClose,
  opportunity,
  customers,
  onDelete,
}: OpportunityFormProps) {
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState<{
    customerProfileId: string;
    title: string;
    description: string;
    stage: OpportunityStage;
    value: string;
    probability: string;
    expectedCloseDate: string;
    nextSteps: string;
  }>({
    customerProfileId: "",
    title: "",
    description: "",
    stage: "lead",
    value: "",
    probability: "",
    expectedCloseDate: "",
    nextSteps: "",
  });

  // Reset form when opportunity changes
  useEffect(() => {
    if (opportunity) {
      setFormData({
        customerProfileId: opportunity.customerProfileId.toString(),
        title: opportunity.title,
        description: "",
        stage: opportunity.stage,
        value: opportunity.value?.toString() || "",
        probability: opportunity.probability?.toString() || "",
        expectedCloseDate: opportunity.expectedCloseDate
          ? new Date(opportunity.expectedCloseDate).toISOString().split("T")[0]
          : "",
        nextSteps: opportunity.nextSteps || "",
      });
    } else {
      setFormData({
        customerProfileId: "",
        title: "",
        description: "",
        stage: "lead",
        value: "",
        probability: "",
        expectedCloseDate: "",
        nextSteps: "",
      });
    }
  }, [opportunity, isOpen]);

  // Create mutation
  const createMutation = trpc.crm.extensions.createOpportunity.useMutation({
    onSuccess: () => {
      utils.crm.extensions.listOpportunities.invalidate();
      toast.success("Opportunity created successfully");
      onClose();
    },
    onError: error => {
      toast.error(error.message || "Failed to create opportunity");
    },
  });

  // Update mutation
  const updateMutation = trpc.crm.extensions.updateOpportunity.useMutation({
    onSuccess: () => {
      utils.crm.extensions.listOpportunities.invalidate();
      toast.success("Opportunity updated successfully");
      onClose();
    },
    onError: error => {
      toast.error(error.message || "Failed to update opportunity");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.customerProfileId) {
      toast.error("Title and customer are required");
      return;
    }

    const data = {
      customerProfileId: parseInt(formData.customerProfileId, 10),
      title: formData.title,
      description: formData.description || undefined,
      stage: formData.stage,
      value: formData.value ? parseInt(formData.value, 10) : undefined,
      probability: formData.probability
        ? parseInt(formData.probability, 10)
        : undefined,
      expectedCloseDate: formData.expectedCloseDate
        ? new Date(formData.expectedCloseDate).toISOString()
        : undefined,
      nextSteps: formData.nextSteps || undefined,
    };

    if (opportunity) {
      await updateMutation.mutateAsync({
        id: opportunity.id,
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
      title={opportunity ? "Edit Opportunity" : "Create Opportunity"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer */}
        <div>
          <label htmlFor="customer" className="block text-sm font-medium mb-2">
            Customer *
          </label>
          <select
            id="customer"
            required
            value={formData.customerProfileId}
            onChange={e =>
              setFormData({ ...formData, customerProfileId: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            disabled={!!opportunity}
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name || customer.email || `Customer ${customer.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            placeholder="Opportunity title"
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
            placeholder="Opportunity description"
          />
        </div>

        {/* Stage */}
        <div>
          <label htmlFor="stage" className="block text-sm font-medium mb-2">
            Stage
          </label>
          <select
            id="stage"
            value={formData.stage}
            onChange={e =>
              setFormData({
                ...formData,
                stage: e.target.value as typeof formData.stage,
              })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="lead">Lead</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Value and Probability */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="value" className="block text-sm font-medium mb-2">
              Value (DKK)
            </label>
            <input
              id="value"
              type="number"
              min="0"
              value={formData.value}
              onChange={e =>
                setFormData({ ...formData, value: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="0"
            />
          </div>
          <div>
            <label
              htmlFor="probability"
              className="block text-sm font-medium mb-2"
            >
              Probability (%)
            </label>
            <input
              id="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={e =>
                setFormData({ ...formData, probability: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="0"
            />
          </div>
        </div>

        {/* Expected Close Date */}
        <div>
          <label
            htmlFor="expectedCloseDate"
            className="block text-sm font-medium mb-2"
          >
            Expected Close Date
          </label>
          <input
            id="expectedCloseDate"
            type="date"
            value={formData.expectedCloseDate}
            onChange={e =>
              setFormData({ ...formData, expectedCloseDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>

        {/* Next Steps */}
        <div>
          <label htmlFor="nextSteps" className="block text-sm font-medium mb-2">
            Next Steps
          </label>
          <textarea
            id="nextSteps"
            value={formData.nextSteps}
            onChange={e =>
              setFormData({ ...formData, nextSteps: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            rows={2}
            placeholder="What are the next steps?"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          {opportunity && onDelete && (
            <AppleButton
              type="button"
              variant="tertiary"
              onClick={() => {
                onDelete(opportunity.id);
                onClose();
              }}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </AppleButton>
          )}
          <AppleButton type="button" variant="tertiary" onClick={onClose}>
            Cancel
          </AppleButton>
          <AppleButton
            type="submit"
            loading={isSubmitting}
            disabled={!formData.title || !formData.customerProfileId}
          >
            {opportunity ? "Update" : "Create"}
          </AppleButton>
        </div>
      </form>
    </AppleModal>
  );
}
