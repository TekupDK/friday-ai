/**
 * RelationshipForm Component
 *
 * Form for creating/editing customer relationships
 */

import { Plus, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppleButton, AppleModal } from "./apple-ui";
import { trpc } from "@/lib/trpc";

interface RelationshipFormProps {
  isOpen: boolean;
  onClose: () => void;
  customerProfileId: number;
  onSuccess?: () => void;
}

const RELATIONSHIP_TYPES = [
  { value: "parent_company", label: "Parent Company" },
  { value: "subsidiary", label: "Subsidiary" },
  { value: "referrer", label: "Referrer" },
  { value: "referred_by", label: "Referred By" },
  { value: "partner", label: "Partner" },
  { value: "competitor", label: "Competitor" },
] as const;

export function RelationshipForm({
  isOpen,
  onClose,
  customerProfileId,
  onSuccess,
}: RelationshipFormProps) {
  const [formData, setFormData] = useState({
    relatedCustomerProfileId: "",
    relationshipType: "partner" as const,
    description: "",
    strength: 5,
  });

  const utils = trpc.useUtils();

  // Fetch customers for dropdown
  const { data: customers } = trpc.crm.customer.listProfiles.useQuery({
    limit: 100,
  });

  // Create relationship mutation
  const createMutation = trpc.crm.extensions.createRelationship.useMutation({
    onSuccess: () => {
      utils.crm.extensions.getRelationships.invalidate({ customerProfileId });
      toast.success("Relationship created successfully");
      handleClose();
      onSuccess?.();
    },
    onError: error => {
      toast.error(error.message || "Failed to create relationship");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.relatedCustomerProfileId) {
      toast.error("Please select a related customer");
      return;
    }

    await createMutation.mutateAsync({
      customerProfileId,
      relatedCustomerProfileId: parseInt(formData.relatedCustomerProfileId, 10),
      relationshipType: formData.relationshipType,
      description: formData.description || undefined,
      strength: formData.strength || undefined,
    });
  };

  const handleClose = () => {
    setFormData({
      relatedCustomerProfileId: "",
      relationshipType: "partner",
      description: "",
      strength: 5,
    });
    onClose();
  };

  // Filter out current customer from list
  const availableCustomers =
    customers?.filter(c => c.id !== customerProfileId) || [];

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Relationship"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Related Customer */}
        <div>
          <label htmlFor="relatedCustomer" className="block text-sm font-medium mb-2">
            Related Customer *
          </label>
          <select
            id="relatedCustomer"
            value={formData.relatedCustomerProfileId}
            onChange={e =>
              setFormData({ ...formData, relatedCustomerProfileId: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            required
          >
            <option value="">Select a customer...</option>
            {availableCustomers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} {customer.email ? `(${customer.email})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Relationship Type */}
        <div>
          <label htmlFor="relationshipType" className="block text-sm font-medium mb-2">
            Relationship Type *
          </label>
          <select
            id="relationshipType"
            value={formData.relationshipType}
            onChange={e =>
              setFormData({
                ...formData,
                relationshipType: e.target.value as typeof formData.relationshipType,
              })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            required
          >
            {RELATIONSHIP_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Strength */}
        <div>
          <label htmlFor="strength" className="block text-sm font-medium mb-2">
            Relationship Strength: {formData.strength}/10
          </label>
          <input
            id="strength"
            type="range"
            min="1"
            max="10"
            value={formData.strength}
            onChange={e =>
              setFormData({ ...formData, strength: parseInt(e.target.value, 10) })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Weak</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
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
            placeholder="Additional notes about this relationship..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <AppleButton
            type="button"
            variant="tertiary"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </AppleButton>
          <AppleButton
            type="submit"
            loading={createMutation.isPending}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Relationship
          </AppleButton>
        </div>
      </form>
    </AppleModal>
  );
}

