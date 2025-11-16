/**
 * Customer List Page
 *
 * Displays all customers with search and filtering
 */

import { Users } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "wouter";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AppleCard, AppleSearchField } from "@/components/crm/apple-ui";
import { trpc } from "@/lib/trpc";
import CRMLayout from "@/components/crm/CRMLayout";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";

export default function CustomerList() {
  usePageTitle("Customers");
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: customers, isLoading, error, isError } = trpc.crm.customer.listProfiles.useQuery(
    {
      search: debouncedSearch || undefined,
      limit: 50,
    }
    // Note: tRPC query options can be configured globally or via React Query defaults
  );

  return (
    <CRMLayout>
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Customers</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your customer profiles
                </p>
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              aria-label="Search customers by name or email"
            />
          </div>
        </section>

        {/* Customer List */}
        {isLoading ? (
          <div role="status" aria-live="polite" aria-label="Loading customers">
            <LoadingSpinner message="Loading customers..." />
          </div>
        ) : isError ? (
          <ErrorDisplay message="Failed to load customers" error={error} />
        ) : customers && customers.length > 0 ? (
          <section aria-label="Customer list">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
              {customers.map((customer) => (
                <AppleCard
                  key={customer.id}
                  variant="elevated"
                  className="cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Customer: ${customer.name}${customer.email ? `, ${customer.email}` : ""}${customer.phone ? `, ${customer.phone}` : ""}. Status: ${customer.status}. Click to view details.`}
                  onClick={() => {
                    // TODO: Navigate to customer detail page when implemented
                    // navigate(`/crm/customers/${customer.id}`);
                    console.log("Customer clicked:", customer.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      // TODO: Navigate to customer detail page when implemented
                      // navigate(`/crm/customers/${customer.id}`);
                      console.log("Customer activated:", customer.id);
                    }
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
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
                    <div className="flex gap-2 mt-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary capitalize" aria-label={`Status: ${customer.status}`}>
                        {customer.status}
                      </span>
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
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground">
                  {search
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first customer"}
                </p>
              </div>
            </AppleCard>
          </section>
        )}
        </div>
      </main>
    </CRMLayout>
  );
}

