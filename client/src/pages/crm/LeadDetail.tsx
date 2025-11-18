/**
 * Lead Detail Page
 *
 * Displays detailed lead information with ability to update status and convert to customer
 */

import { ArrowLeft, Mail, Phone, Target, Calendar, CheckCircle, XCircle } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

import { AppleCard, AppleButton } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { LEAD_STATUSES } from "@/const/crm";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";

export default function LeadDetail() {
  const [, params] = useRoute<{ id: string }>("/crm/leads/:id");
  const [, navigate] = useLocation();
  const leadId = params?.id ? parseInt(params.id, 10) : null;
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const utils = trpc.useUtils();

  const { data: lead, isLoading, error, isError } = trpc.crm.lead.getLead.useQuery(
    { id: leadId! },
    { enabled: !!leadId }
  );
  
  // Type guard for lead object
  const leadData = lead as {
    id?: number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    status?: string;
    [key: string]: any;
  } | undefined;

  const updateStatusMutation = trpc.crm.lead.updateLeadStatus.useMutation({
    onSuccess: () => {
      utils.crm.lead.getLead.invalidate({ id: leadId! });
      utils.crm.lead.listLeads.invalidate();
      toast.success("Lead status updated");
      setSelectedStatus("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update lead status");
    },
  });

  const convertMutation = trpc.crm.lead.convertLeadToCustomer.useMutation({
    onSuccess: (result) => {
      toast.success(
        result.created
          ? "Lead converted to customer successfully"
          : "Lead linked to existing customer"
      );
      if (result.customerProfileId) {
        navigate(`/crm/customers/${result.customerProfileId}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to convert lead");
    },
  });

  usePageTitle(leadData?.name ? `${leadData.name} - Lead` : "Lead Details");

  if (!leadId) {
    return (
      <CRMLayout>
        <ErrorDisplay message="Invalid lead ID" />
      </CRMLayout>
    );
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !leadData?.id) return;
    await updateStatusMutation.mutateAsync({
      id: leadData.id,
      status: selectedStatus as any,
    });
  };

  const handleConvert = async () => {
    if (!leadData?.id) return;
    if (!leadData.email) {
      toast.error("Lead must have an email to convert to customer");
      return;
    }
    await convertMutation.mutateAsync({ id: leadData.id });
  };

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Lead Detail">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Back Button */}
            <AppleButton
              variant="tertiary"
              onClick={() => navigate("/crm/leads")}
              className="mb-4"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Leads
            </AppleButton>

            {/* Loading State */}
            {isLoading ? (
              <LoadingSpinner message="Loading lead..." />
            ) : isError ? (
              <ErrorDisplay message="Failed to load lead" error={error} />
            ) : leadData ? (
              <>
                {/* Header */}
                <header>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">{leadData.name || "Unnamed Lead"}</h1>
                      <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                        {leadData.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{leadData.email}</span>
                          </div>
                        )}
                        {leadData.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{leadData.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary capitalize">
                        {leadData.status || "unknown"}
                      </span>
                    </div>
                  </div>
                </header>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AppleCard variant="elevated">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Update Status</h2>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="status-select" className="block text-sm font-medium mb-2">
                            New Status
                          </label>
                          <select
                            id="status-select"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                          >
                            <option value="">Select status...</option>
                            {LEAD_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <AppleButton
                          onClick={handleStatusUpdate}
                          disabled={!selectedStatus || updateStatusMutation.isPending}
                        >
                          {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                        </AppleButton>
                      </div>
                    </div>
                  </AppleCard>

                  <AppleCard variant="elevated">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Convert to Customer</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Convert this lead to a customer profile to start managing bookings and
                        invoices.
                      </p>
                      <AppleButton
                        onClick={handleConvert}
                        disabled={!leadData.email || convertMutation.isPending}
                        variant={leadData.email ? "primary" : "tertiary"}
                        loading={convertMutation.isPending}
                        leftIcon={!convertMutation.isPending ? <CheckCircle className="w-4 h-4" /> : undefined}
                      >
                        Convert to Customer
                      </AppleButton>
                      {!leadData.email && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Lead must have an email address to convert
                        </p>
                      )}
                    </div>
                  </AppleCard>
                </div>

                {/* Lead Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AppleCard variant="elevated">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Lead Information</h2>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm text-muted-foreground">Name</dt>
                          <dd className="text-base font-medium">{leadData?.name || "N/A"}</dd>
                        </div>
                        {leadData?.email && (
                          <div>
                            <dt className="text-sm text-muted-foreground">Email</dt>
                            <dd className="text-base">{leadData.email}</dd>
                          </div>
                        )}
                        {leadData?.phone && (
                          <div>
                            <dt className="text-sm text-muted-foreground">Phone</dt>
                            <dd className="text-base">{leadData.phone}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-sm text-muted-foreground">Status</dt>
                          <dd className="text-base capitalize">{leadData?.status || "unknown"}</dd>
                        </div>
                        {leadData?.source && (
                          <div>
                            <dt className="text-sm text-muted-foreground">Source</dt>
                            <dd className="text-base">{leadData.source}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </AppleCard>

                  {leadData?.createdAt && (
                    <AppleCard variant="elevated">
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Timeline</h2>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm text-muted-foreground">Created</dt>
                            <dd className="text-base">
                              {new Date(leadData.createdAt).toLocaleDateString("da-DK", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </dd>
                          </div>
                          {leadData.updatedAt && (
                            <div>
                              <dt className="text-sm text-muted-foreground">Last Updated</dt>
                              <dd className="text-base">
                                {new Date(leadData.updatedAt).toLocaleDateString("da-DK", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </AppleCard>
                  )}

                  {leadData?.notes && (
                    <AppleCard variant="elevated" className="md:col-span-2">
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Notes</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {leadData.notes}
                        </p>
                      </div>
                    </AppleCard>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}

