/**
 * Segment List Page
 *
 * Displays all customer segments with member counts
 */

import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

import { AppleButton, AppleCard } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { SegmentCard } from "@/components/crm/SegmentCard";
import { SegmentForm } from "@/components/crm/SegmentForm";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";

export default function SegmentList() {
  usePageTitle("Segments");
  const [, navigate] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Fetch segments
  const {
    data: segments,
    isLoading,
    error,
    isError,
  } = trpc.crm.extensions.listSegments.useQuery();

  // Delete mutation
  const deleteMutation = trpc.crm.extensions.deleteSegment.useMutation({
    onSuccess: () => {
      utils.crm.extensions.listSegments.invalidate();
      toast.success("Segment deleted");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to delete segment");
    },
  });

  const handleCreate = () => {
    setEditingSegment(null);
    setShowCreateModal(true);
  };

  const handleEdit = (segmentId: number) => {
    setEditingSegment(segmentId);
    setShowCreateModal(true);
  };

  const handleDelete = (segmentId: number) => {
    if (confirm("Are you sure you want to delete this segment?")) {
      // Note: deleteSegment endpoint might need to be added to backend
      toast.info("Delete functionality coming soon");
    }
  };

  const handleViewMembers = (segmentId: number) => {
    navigate(`/crm/segments/${segmentId}`);
  };

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Segment List">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Customer Segments</h1>
                  <p className="text-muted-foreground mt-1">
                    Organize customers into segments for targeted actions
                  </p>
                </div>
                <AppleButton
                  onClick={handleCreate}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Segment
                </AppleButton>
              </div>
            </header>

            {/* Segments List */}
            {isLoading ? (
              <div
                role="status"
                aria-live="polite"
                aria-label="Loading segments"
              >
                <LoadingSpinner message="Loading segments..." />
              </div>
            ) : isError ? (
              <ErrorDisplay message="Failed to load segments" error={error} />
            ) : segments && segments.length > 0 ? (
              <section aria-label="Segments list">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {segments.map(segment => (
                    <SegmentCard
                      key={segment.id}
                      segment={segment}
                      onEdit={() => handleEdit(segment.id)}
                      onDelete={() => handleDelete(segment.id)}
                      onViewMembers={() => handleViewMembers(segment.id)}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <AppleCard variant="elevated" padding="lg">
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No segments yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first segment to organize customers
                  </p>
                  <AppleButton
                    onClick={handleCreate}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Create Segment
                  </AppleButton>
                </div>
              </AppleCard>
            )}

            {/* Create/Edit Segment Modal */}
            <SegmentForm
              isOpen={showCreateModal}
              onClose={() => {
                setShowCreateModal(false);
                setEditingSegment(null);
              }}
              segmentId={editingSegment}
            />
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}
