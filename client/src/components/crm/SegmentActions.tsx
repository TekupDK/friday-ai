/**
 * SegmentActions Component
 *
 * Bulk operations for adding/removing customers from segments
 */

import { Minus, Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppleButton, AppleModal } from "./apple-ui";

import { trpc } from "@/lib/trpc";

interface SegmentActionsProps {
  segmentId: number;
  segmentName: string;
  onSuccess?: () => void;
}

export function SegmentActions({
  segmentId,
  segmentName,
  onSuccess,
}: SegmentActionsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);

  const utils = trpc.useUtils();

  // Fetch all customers
  const { data: customers, isLoading: isLoadingCustomers } =
    trpc.crm.customer.listProfiles.useQuery({
      limit: 1000,
    });

  // Fetch segment members
  const { data: segmentMembers } =
    trpc.crm.extensions.getSegmentMembers.useQuery(
      { segmentId, limit: 100 },
      { enabled: showRemoveModal }
    );

  // Add to segment mutation
  const addMutation = trpc.crm.extensions.addToSegment.useMutation({
    onSuccess: data => {
      utils.crm.extensions.listSegments.invalidate();
      utils.crm.extensions.getSegmentMembers.invalidate({ segmentId });
      toast.success(
        `Added ${data.added} customer${data.added === 1 ? "" : "s"} to segment`
      );
      setShowAddModal(false);
      setSelectedCustomerIds([]);
      onSuccess?.();
    },
    onError: error => {
      toast.error(error.message || "Failed to add customers to segment");
    },
  });

  // Remove from segment mutation
  const removeMutation = trpc.crm.extensions.removeFromSegment.useMutation({
    onSuccess: () => {
      utils.crm.extensions.listSegments.invalidate();
      utils.crm.extensions.getSegmentMembers.invalidate({ segmentId });
      toast.success("Removed customers from segment");
      setShowRemoveModal(false);
      setSelectedCustomerIds([]);
      onSuccess?.();
    },
    onError: error => {
      toast.error(error.message || "Failed to remove customers from segment");
    },
  });

  const handleToggleCustomer = (customerId: number) => {
    setSelectedCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleAdd = () => {
    if (selectedCustomerIds.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }
    addMutation.mutate({
      segmentId,
      customerProfileIds: selectedCustomerIds,
    });
  };

  const handleRemove = () => {
    if (selectedCustomerIds.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }
    removeMutation.mutate({
      segmentId,
      customerProfileIds: selectedCustomerIds,
    });
  };

  // Get member IDs for filtering
  const memberIds = new Set(
    segmentMembers?.map(m => m.customerProfileId) || []
  );

  // Filter customers: available for add, members for remove
  const availableCustomers = customers?.filter(c => !memberIds.has(c.id)) || [];
  const memberCustomers = customers?.filter(c => memberIds.has(c.id)) || [];

  return (
    <>
      <div className="flex gap-2">
        <AppleButton
          variant="secondary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Customers
        </AppleButton>
        <AppleButton
          variant="secondary"
          size="sm"
          onClick={() => setShowRemoveModal(true)}
          leftIcon={<Minus className="w-4 h-4" />}
        >
          Remove Customers
        </AppleButton>
      </div>

      {/* Add Customers Modal */}
      <AppleModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedCustomerIds([]);
        }}
        title={`Add Customers to "${segmentName}"`}
        size="lg"
      >
        <div className="space-y-4">
          {isLoadingCustomers ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Loading customers...
              </p>
            </div>
          ) : availableCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                All customers are already in this segment
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto border border-border rounded-md">
                <div className="divide-y divide-border">
                  {availableCustomers.map(customer => (
                    <label
                      key={customer.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomerIds.includes(customer.id)}
                        onChange={() => handleToggleCustomer(customer.id)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {customer.name ||
                            customer.email ||
                            `Customer ${customer.id}`}
                        </p>
                        {customer.email && customer.name && (
                          <p className="text-sm text-muted-foreground">
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {selectedCustomerIds.length} customer
                  {selectedCustomerIds.length === 1 ? "" : "s"} selected
                </p>
                <div className="flex gap-2">
                  <AppleButton
                    variant="tertiary"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedCustomerIds([]);
                    }}
                  >
                    Cancel
                  </AppleButton>
                  <AppleButton
                    onClick={handleAdd}
                    loading={addMutation.isPending}
                    disabled={selectedCustomerIds.length === 0}
                  >
                    Add Selected
                  </AppleButton>
                </div>
              </div>
            </>
          )}
        </div>
      </AppleModal>

      {/* Remove Customers Modal */}
      <AppleModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setSelectedCustomerIds([]);
        }}
        title={`Remove Customers from "${segmentName}"`}
        size="lg"
      >
        <div className="space-y-4">
          {memberCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No customers in this segment
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto border border-border rounded-md">
                <div className="divide-y divide-border">
                  {memberCustomers.map(customer => (
                    <label
                      key={customer.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomerIds.includes(customer.id)}
                        onChange={() => handleToggleCustomer(customer.id)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {customer.name ||
                            customer.email ||
                            `Customer ${customer.id}`}
                        </p>
                        {customer.email && customer.name && (
                          <p className="text-sm text-muted-foreground">
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {selectedCustomerIds.length} customer
                  {selectedCustomerIds.length === 1 ? "" : "s"} selected
                </p>
                <div className="flex gap-2">
                  <AppleButton
                    variant="tertiary"
                    onClick={() => {
                      setShowRemoveModal(false);
                      setSelectedCustomerIds([]);
                    }}
                  >
                    Cancel
                  </AppleButton>
                  <AppleButton
                    variant="secondary"
                    onClick={handleRemove}
                    loading={removeMutation.isPending}
                    disabled={selectedCustomerIds.length === 0}
                  >
                    Remove Selected
                  </AppleButton>
                </div>
              </div>
            </>
          )}
        </div>
      </AppleModal>
    </>
  );
}
