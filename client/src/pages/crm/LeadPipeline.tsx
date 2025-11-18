/**
 * Lead Pipeline Page
 *
 * Kanban board for managing leads through the pipeline
 */

import { Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

import { AppleButton, AppleCard, AppleModal } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { LEAD_STATUSES } from "@/const/crm";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";
import { exportLeadsToCSV } from "@/utils/csv-export";
import { sanitizeText } from "@/utils/sanitize";

export default function LeadPipeline() {
  usePageTitle("Lead Pipeline");
  const [, navigate] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "manual",
    notes: "",
  });

  const utils = trpc.useUtils();

  const {
    data: leads,
    isLoading,
    error,
    isError,
  } = trpc.crm.lead.listLeads.useQuery({
    limit: 100,
  });

  const createMutation = trpc.crm.lead.createLead.useMutation({
    onSuccess: lead => {
      utils.crm.lead.listLeads.invalidate();
      toast.success("Lead created successfully");
      setShowCreateModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: "manual",
        notes: "",
      });
      navigate(`/crm/leads/${lead.id}`);
    },
    onError: error => {
      toast.error(error.message || "Failed to create lead");
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    await createMutation.mutateAsync(formData);
  };

  const stages = LEAD_STATUSES;

  // Memoize lead filtering to avoid recalculation on every render
  const leadsByStage = useMemo(() => {
    if (!leads) return {};

    const grouped: Record<string, typeof leads> = {};
    stages.forEach(stage => {
      grouped[stage] = leads.filter(lead => lead.status === stage);
    });
    return grouped;
  }, [leads, stages]);

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Lead Pipeline">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="lead-pipeline-title">Lead Pipeline</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage leads through the sales pipeline
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {leads && leads.length > 0 && (
                    <AppleButton
                      variant="secondary"
                      data-testid="export-leads-csv-button"
                      onClick={() => {
                        if (!leads) return;
                        exportLeadsToCSV(leads);
                        toast.success("Leads exported to CSV");
                      }}
                    >
                      Export CSV
                    </AppleButton>
                  )}
                <AppleButton
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                  data-testid="create-lead-button"
                >
                  Create Lead
                </AppleButton>
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
                <div
                  className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
                  role="group"
                >
                  {stages.map(stage => {
                    const stageLeads = leadsByStage[stage] || [];
                    return (
                      <AppleCard key={stage} variant="elevated">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold capitalize">
                              {stage}
                            </h3>
                            <span
                              className="text-sm text-muted-foreground"
                              aria-label={`${stageLeads.length} leads in ${stage} stage`}
                            >
                              {stageLeads.length}
                            </span>
                          </div>
                          <div
                            className="space-y-2"
                            role="list"
                            aria-label={`Leads in ${stage} stage`}
                          >
                            {stageLeads.length > 0 ? (
                              stageLeads.map(lead => (
                                <div
                                  key={lead.id}
                                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                  role="listitem"
                                  tabIndex={0}
                                  aria-label={`Lead: ${lead.name}${lead.email ? `, ${lead.email}` : ""}. Status: ${stage}. Click to view details.`}
                                  onClick={() => {
                                    navigate(`/crm/leads/${lead.id}`);
                                  }}
                                  onKeyDown={e => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      navigate(`/crm/leads/${lead.id}`);
                                    }
                                  }}
                                >
                                  <p className="font-medium text-sm">
                                    {sanitizeText(lead.name)}
                                  </p>
                                  {lead.email && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {lead.email}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p
                                className="text-sm text-muted-foreground text-center py-4"
                                role="status"
                              >
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

            {/* Create Lead Modal */}
            <AppleModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              title="Create Lead"
              size="md"
              data-testid="create-lead-modal"
            >
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label
                    htmlFor="lead-name"
                    className="block text-sm font-medium mb-2"
                  >
                    Name *
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="Lead name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lead-email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="lead@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lead-phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone
                  </label>
                  <input
                    id="lead-phone"
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
                    htmlFor="lead-company"
                    className="block text-sm font-medium mb-2"
                  >
                    Company
                  </label>
                  <input
                    id="lead-company"
                    type="text"
                    value={formData.company}
                    onChange={e =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lead-source"
                    className="block text-sm font-medium mb-2"
                  >
                    Source
                  </label>
                  <input
                    id="lead-source"
                    type="text"
                    value={formData.source}
                    onChange={e =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="e.g., website, referral, manual"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lead-notes"
                    className="block text-sm font-medium mb-2"
                  >
                    Notes
                  </label>
                  <textarea
                    id="lead-notes"
                    value={formData.notes}
                    onChange={e =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    rows={3}
                    placeholder="Additional notes..."
                  />
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
                    disabled={!formData.name}
                  >
                    Create Lead
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
