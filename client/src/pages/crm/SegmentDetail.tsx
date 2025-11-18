/**
 * Segment Detail Page
 *
 * View and manage customers in a segment
 */

import { ArrowLeft, Users } from "lucide-react";
import { useLocation, useRoute } from "wouter";

import { AppleButton, AppleCard } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { SegmentActions } from "@/components/crm/SegmentActions";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";
import { sanitizeText } from "@/utils/sanitize";

export default function SegmentDetail() {
  const [, params] = useRoute("/crm/segments/:id");
  const [, navigate] = useLocation();
  const segmentId = params ? parseInt(params.id, 10) : null;

  usePageTitle("Segment Details");

  // Fetch segment info
  const { data: segments } = trpc.crm.extensions.listSegments.useQuery();
  const segment = segments?.find(s => s.id === segmentId);

  // Fetch segment members
  const {
    data: members,
    isLoading,
    error,
    isError,
  } = trpc.crm.extensions.getSegmentMembers.useQuery(
    { segmentId: segmentId! },
    { enabled: !!segmentId }
  );

  if (!segmentId) {
    return (
      <CRMLayout>
        <ErrorDisplay message="Invalid segment ID" />
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Segment Detail">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header>
              <div className="flex items-center gap-4 mb-4">
                <AppleButton
                  variant="tertiary"
                  size="sm"
                  onClick={() => navigate("/crm/segments")}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Segments
                </AppleButton>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">
                    {segment?.name || "Segment"}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {segment?.description || "Segment members"}
                  </p>
                </div>
                {segment && (
                  <SegmentActions
                    segmentId={segmentId}
                    segmentName={segment.name}
                  />
                )}
              </div>
            </header>

            {/* Members List */}
            {isLoading ? (
              <div
                role="status"
                aria-live="polite"
                aria-label="Loading segment members"
              >
                <LoadingSpinner message="Loading segment members..." />
              </div>
            ) : isError ? (
              <ErrorDisplay
                message="Failed to load segment members"
                error={error}
              />
            ) : members && members.length > 0 ? (
              <section aria-label="Segment members">
                <AppleCard variant="elevated" padding="none">
                  <div className="divide-y divide-border">
                    {members.map(member => {
                      const customer = member.customer;
                      return (
                        <div
                          key={member.id}
                          className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() =>
                            navigate(`/crm/customers/${customer.id}`)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">
                                {sanitizeText(customer.name ||
                                  customer.email ||
                                  `Customer ${customer.id}`)}
                              </p>
                              {customer.email && customer.name && (
                                <p className="text-sm text-muted-foreground">
                                  {customer.email}
                                </p>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Added{" "}
                              {new Date(member.addedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AppleCard>
              </section>
            ) : (
              <AppleCard variant="elevated" padding="lg">
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No members yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add customers to this segment to get started
                  </p>
                  {segment && (
                    <SegmentActions
                      segmentId={segmentId}
                      segmentName={segment.name}
                    />
                  )}
                </div>
              </AppleCard>
            )}
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}
