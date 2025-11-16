/**
 * Lead Pipeline Page
 *
 * Kanban board for managing leads through the pipeline
 */

import React, { useMemo } from "react";
import { useLocation } from "wouter";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AppleCard } from "@/components/crm/apple-ui";
import { trpc } from "@/lib/trpc";
import CRMLayout from "@/components/crm/CRMLayout";
import { LEAD_STATUSES } from "@/const/crm";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";

export default function LeadPipeline() {
  usePageTitle("Lead Pipeline");
  const [, navigate] = useLocation();
  const { data: leads, isLoading, error, isError } = trpc.crm.lead.listLeads.useQuery({
    limit: 100,
  });

  const stages = LEAD_STATUSES;

  // Memoize lead filtering to avoid recalculation on every render
  const leadsByStage = useMemo(() => {
    if (!leads) return {};
    
    const grouped: Record<string, typeof leads> = {};
    stages.forEach((stage) => {
      grouped[stage] = leads.filter((lead) => lead.status === stage);
    });
    return grouped;
  }, [leads, stages]);

  return (
    <CRMLayout>
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Lead Pipeline</h1>
                <p className="text-muted-foreground mt-1">
                  Manage leads through the sales pipeline
                </p>
              </div>
            </div>
          </header>

        {/* Kanban Board */}
        {isLoading ? (
          <div role="status" aria-live="polite" aria-label="Loading leads">
            <LoadingSpinner message="Loading leads..." />
          </div>
        ) : isError ? (
          <ErrorDisplay message="Failed to load leads" error={error} />
        ) : (
          <section aria-label="Lead pipeline kanban board">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4" role="group">
              {stages.map((stage) => {
                const stageLeads = leadsByStage[stage] || [];
                return (
                  <AppleCard key={stage} variant="elevated">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold capitalize">{stage}</h3>
                        <span className="text-sm text-muted-foreground" aria-label={`${stageLeads.length} leads in ${stage} stage`}>
                          {stageLeads.length}
                        </span>
                      </div>
                      <div className="space-y-2" role="list" aria-label={`Leads in ${stage} stage`}>
                        {stageLeads.length > 0 ? (
                          stageLeads.map((lead) => (
                            <div
                              key={lead.id}
                              className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                              role="listitem"
                              tabIndex={0}
                              aria-label={`Lead: ${lead.name}${lead.email ? `, ${lead.email}` : ""}. Status: ${stage}. Click to view details.`}
                              onClick={() => {
                                // TODO: Navigate to lead detail page when implemented
                                // navigate(`/crm/leads/${lead.id}`);
                                console.log("Lead clicked:", lead.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  // TODO: Navigate to lead detail page when implemented
                                  // navigate(`/crm/leads/${lead.id}`);
                                  console.log("Lead activated:", lead.id);
                                }
                              }}
                            >
                              <p className="font-medium text-sm">{lead.name}</p>
                              {lead.email && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {lead.email}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4" role="status">
                            No leads in this stage
                          </p>
                        )}
                      </div>
                    </div>
                  </AppleCard>
                );
              })}
            </div>
          </section>
        )}

        {/* Placeholder for drag-drop */}
        <section aria-label="Drag and drop functionality">
          <AppleCard variant="elevated">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Drag & Drop</h2>
              <p className="text-muted-foreground">
                Drag-and-drop functionality will be implemented using @dnd-kit/core
              </p>
            </div>
          </AppleCard>
        </section>
        </div>
      </main>
    </CRMLayout>
  );
}

