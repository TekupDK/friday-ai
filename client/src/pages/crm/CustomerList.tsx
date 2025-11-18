/**
 * Customer List Page
 *
 * Displays all customers with search and filtering
 */

import { Download, Plus, Users } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

import {
  AppleButton,
  AppleCard,
  AppleModal,
  AppleSearchField,
} from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { SubscriptionStatusBadge } from "@/components/crm/SubscriptionStatusBadge";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";
import { exportCustomersToCSV } from "@/utils/csv-export";

/**
 * CustomerSubscriptionBadge Component
 * Fetches and displays subscription status for a customer
 */
function CustomerSubscriptionBadge({ customerId }: { customerId: number }) {
  const { data: subscription } = trpc.subscription.getByCustomer.useQuery(
    { customerProfileId: customerId },
    { enabled: !!customerId }
  );

  if (!subscription) {
    return null;
  }

  return <SubscriptionStatusBadge status={subscription.status} />;
}

export default function CustomerList() {
  usePageTitle("Customers");
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    status: "new";
    customerType: "private" | "erhverv";
  }>({
    name: "",
    email: "",
    phone: "",
    status: "new",
    customerType: "private",
  });
  const debouncedSearch = useDebouncedValue(search, 300);

  const utils = trpc.useUtils();

  const {
    data: customers,
    isLoading,
    error,
    isError,
  } = trpc.crm.customer.listProfiles.useQuery({
    search: debouncedSearch || undefined,
    limit: 50,
  });

  const createMutation = trpc.crm.customer.createProfile.useMutation({
    onSuccess: customer => {
      utils.crm.customer.listProfiles.invalidate();
      toast.success("Customer created successfully");
      setShowCreateModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        status: "new",
        customerType: "private",
      });
      navigate(`/crm/customers/${customer.id}`);
    },
    onError: error => {
      toast.error(error.message || "Failed to create customer");
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }
    await createMutation.mutateAsync({
      ...formData,
      customerType: formData.customerType as "private" | "erhverv",
    });
  };

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Customer List">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header>
              <div className="flex items-center justify-between">
                <div>
                  <h1
                    className="text-3xl font-bold"
                    data-testid="customers-page-title"
                  >
                    Customers
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your customer profiles
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {customers && customers.length > 0 && (
                    <AppleButton
                      variant="secondary"
                      data-testid="export-csv-button"
                      onClick={() => {
                        if (!customers) return;
                        exportCustomersToCSV(customers);
                        toast.success("Customers exported to CSV");
                      }}
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Export CSV
                    </AppleButton>
                  )}
                  <AppleButton
                    onClick={() => setShowCreateModal(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                    data-testid="create-customer-button"
                  >
                    Create Customer
                  </AppleButton>
                </div>
              </div>
            </header>

            {/* Search */}
            <section aria-label="Search customers">
              <div className="max-w-md">
                <label htmlFor="customer-search" className="sr-only">
                  Search customers
                </label>
                <AppleSearchField
                  id="customer-search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  aria-label="Search customers by name or email"
                  data-testid="customer-search-input"
                />
              </div>
            </section>

            {/* Customer List */}
            {isLoading ? (
              <div
                role="status"
                aria-live="polite"
                aria-label="Loading customers"
              >
                <LoadingSpinner message="Loading customers..." />
              </div>
            ) : isError ? (
              <ErrorDisplay message="Failed to load customers" error={error} />
            ) : customers && customers.length > 0 ? (
              <section aria-label="Customer list">
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  role="list"
                >
                  {customers.map(customer => (
                    <AppleCard
                      key={customer.id}
                      variant="elevated"
                      className="cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      role="listitem"
                      tabIndex={0}
                      aria-label={`Customer: ${customer.name}${customer.email ? `, ${customer.email}` : ""}${customer.phone ? `, ${customer.phone}` : ""}. Status: ${customer.status}. Click to view details.`}
                      onClick={() => {
                        navigate(`/crm/customers/${customer.id}`);
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/crm/customers/${customer.id}`);
                        }
                      }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                              aria-hidden="true"
                            >
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{customer.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {customer.phone}
                          </p>
                        )}
                        <div className="flex gap-2 mt-4 flex-wrap">
                          <span
                            className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary capitalize"
                            aria-label={`Status: ${customer.status}`}
                          >
                            {customer.status}
                          </span>
                          <CustomerSubscriptionBadge customerId={customer.id} />
                        </div>
                      </div>
                    </AppleCard>
                  ))}
                </div>
              </section>
            ) : (
              <section aria-label="Empty state">
                <AppleCard variant="elevated">
                  <div className="p-12 text-center">
                    <Users
                      className="w-16 h-16 mx-auto text-muted-foreground mb-4"
                      aria-hidden="true"
                    />
                    <h3 className="text-lg font-semibold mb-2">
                      No customers found
                    </h3>
                    <p className="text-muted-foreground">
                      {search
                        ? "Try adjusting your search terms"
                        : "Get started by creating your first customer"}
                    </p>
                  </div>
                </AppleCard>
              </section>
            )}

            {/* Create Customer Modal */}
            <AppleModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              title="Create Customer"
              size="md"
              data-testid="create-customer-modal"
            >
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="+45 12 34 56 78"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customerType"
                    className="block text-sm font-medium mb-2"
                  >
                    Type
                  </label>
                  <select
                    id="customerType"
                    value={formData.customerType}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        customerType: e.target.value as "private" | "erhverv",
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="private">Private</option>
                    <option value="erhverv">Erhverv</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <AppleButton
                    type="button"
                    variant="tertiary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </AppleButton>
                  <AppleButton
                    type="submit"
                    loading={createMutation.isPending}
                    disabled={!formData.name || !formData.email}
                  >
                    Create Customer
                  </AppleButton>
                </div>
              </form>
            </AppleModal>
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}
