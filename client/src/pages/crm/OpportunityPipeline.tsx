/**
 * Opportunity Pipeline Page
 *
 * Kanban board for managing opportunities/deals through the pipeline
 */

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

import { AppleButton } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import {
  OpportunityCard,
  type OpportunityCardData,
  type OpportunityStage,
} from "@/components/crm/OpportunityCard";
import { OpportunityColumn } from "@/components/crm/OpportunityColumn";
import { OpportunityForm } from "@/components/crm/OpportunityForm";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";
import { exportOpportunitiesToCSV } from "@/utils/csv-export";

// Pipeline stage configuration
const OPPORTUNITY_STAGES: Array<{ stage: OpportunityStage; title: string }> = [
  { stage: "lead", title: "Lead" },
  { stage: "qualified", title: "Qualified" },
  { stage: "proposal", title: "Proposal" },
  { stage: "negotiation", title: "Negotiation" },
  { stage: "won", title: "Won" },
  { stage: "lost", title: "Lost" },
];

export default function OpportunityPipeline() {
  usePageTitle("Opportunities");
  const [, navigate] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] =
    useState<OpportunityCardData | null>(null);
  const [activeOpportunity, setActiveOpportunity] =
    useState<OpportunityCardData | null>(null);

  const utils = trpc.useUtils();

  // Fetch opportunities
  const {
    data: opportunities,
    isLoading,
    error,
    isError,
  } = trpc.crm.extensions.listOpportunities.useQuery({
    limit: 100,
  });

  // Fetch customers for dropdown
  const { data: customers } = trpc.crm.customer.listProfiles.useQuery({});

  // Create customer map for quick lookup
  const customerMap = useMemo(() => {
    if (!customers) return new Map<number, string>();
    return new Map(
      customers.map(c => [c.id, c.name || c.email || `Customer ${c.id}`])
    );
  }, [customers]);

  // Enrich opportunities with customer names
  const enrichedOpportunities = useMemo(() => {
    if (!opportunities) return [];
    return opportunities.map(opp => ({
      ...opp,
      customerName: customerMap.get(opp.customerProfileId),
    }));
  }, [opportunities, customerMap]);

  // Group opportunities by stage
  const opportunitiesByStage = useMemo(() => {
    if (!enrichedOpportunities) {
      return {
        lead: [],
        qualified: [],
        proposal: [],
        negotiation: [],
        won: [],
        lost: [],
      } as Record<OpportunityStage, OpportunityCardData[]>;
    }

    const grouped: Record<OpportunityStage, OpportunityCardData[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };

    enrichedOpportunities.forEach(opp => {
      if (opp.stage in grouped) {
        grouped[opp.stage].push(opp);
      }
    });

    return grouped;
  }, [enrichedOpportunities]);

  // Update opportunity mutation
  const updateMutation = trpc.crm.extensions.updateOpportunity.useMutation({
    onMutate: async (newOpportunity) => {
      // Cancel any outgoing refetches
      await utils.crm.extensions.listOpportunities.cancel({ limit: 100 });

      // Snapshot the previous value
      const previousOpportunities = utils.crm.extensions.listOpportunities.getData({ limit: 100 });

      // Optimistically update to the new value
      utils.crm.extensions.listOpportunities.setData({ limit: 100 }, (old) => {
        if (!old) return [];
        return old.map((opp) =>
          opp.id === newOpportunity.id
            ? { ...opp, ...newOpportunity }
            : opp
        );
      });

      // Return a context object with the snapshotted value
      return { previousOpportunities };
    },
    onError: (err, newOpportunity, context) => {
      // Rollback to the previous value
      if (context?.previousOpportunities) {
        utils.crm.extensions.listOpportunities.setData({ limit: 100 }, context.previousOpportunities);
      }
      toast.error(err.message || "Failed to update opportunity");
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.crm.extensions.listOpportunities.invalidate({ limit: 100 });
    },
    onSuccess: () => {
      toast.success("Opportunity updated");
    },
  });

  // Delete opportunity mutation
  const deleteMutation = trpc.crm.extensions.deleteOpportunity.useMutation({
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches
      await utils.crm.extensions.listOpportunities.cancel({ limit: 100 });

      // Snapshot the previous value
      const previousOpportunities = utils.crm.extensions.listOpportunities.getData({ limit: 100 });

      // Optimistically update to the new value
      utils.crm.extensions.listOpportunities.setData({ limit: 100 }, (old) => {
        if (!old) return [];
        return old.filter((opp) => opp.id !== id);
      });

      // Return a context object with the snapshotted value
      return { previousOpportunities };
    },
    onError: (err, id, context) => {
      // Rollback to the previous value
      if (context?.previousOpportunities) {
        utils.crm.extensions.listOpportunities.setData({ limit: 100 }, context.previousOpportunities);
      }
      toast.error(err.message || "Failed to delete opportunity");
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.crm.extensions.listOpportunities.invalidate({ limit: 100 });
    },
    onSuccess: () => {
      toast.success("Opportunity deleted");
    },
  });

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const opportunityId = parseInt(active.id as string, 10);

    const opportunity = enrichedOpportunities.find(
      opp => opp.id === opportunityId
    );

    if (opportunity) {
      setActiveOpportunity(opportunity);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveOpportunity(null);

    if (!over) return;

    const opportunityId = parseInt(active.id as string, 10);
    const newStage = over.id as OpportunityStage;

    // Find current stage of the opportunity
    const currentOpportunity = enrichedOpportunities.find(
      opp => opp.id === opportunityId
    );

    if (!currentOpportunity || currentOpportunity.stage === newStage) return;

    // Update stage via tRPC
    updateMutation.mutate({
      id: opportunityId,
      stage: newStage,
    });
  };

  // Handle opportunity click
  const handleOpportunityClick = (opportunity: OpportunityCardData) => {
    setEditingOpportunity(opportunity);
    setShowCreateModal(true);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Opportunity Pipeline">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="opportunities-page-title">Opportunities</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage deals through the sales pipeline
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {enrichedOpportunities && enrichedOpportunities.length > 0 && (
                    <AppleButton
                      variant="secondary"
                      data-testid="export-opportunities-csv-button"
                      onClick={() => {
                        if (!enrichedOpportunities) return;
                        exportOpportunitiesToCSV(enrichedOpportunities);
                        toast.success("Opportunities exported to CSV");
                      }}
                    >
                      Export CSV
                    </AppleButton>
                  )}
                  <AppleButton
                    onClick={() => {
                      setEditingOpportunity(null);
                      setShowCreateModal(true);
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                    data-testid="create-opportunity-button"
                  >
                    Create Opportunity
                  </AppleButton>
                </div>
              </div>
            </header>

            {/* Kanban Board */}
            {isLoading ? (
              <div
                role="status"
                aria-live="polite"
                aria-label="Loading opportunities"
              >
                <LoadingSpinner message="Loading opportunities..." />
              </div>
            ) : isError ? (
              <ErrorDisplay
                message="Failed to load opportunities"
                error={error}
              />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <section aria-label="Opportunity pipeline kanban board">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 h-[calc(100vh-12rem)]">
                    {OPPORTUNITY_STAGES.map(({ stage, title }) => {
                      const stageOpportunities = opportunitiesByStage[stage] || [];
                      return (
                        <OpportunityColumn
                          key={stage}
                          stage={stage}
                          title={title}
                          opportunities={stageOpportunities}
                          onOpportunityClick={handleOpportunityClick}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Drag Overlay - Shows card while dragging */}
                <DragOverlay>
                  {activeOpportunity ? (
                    <div className="cursor-grabbing opacity-90">
                      <OpportunityCard opportunity={activeOpportunity} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {/* Create/Edit Opportunity Modal */}
            <OpportunityForm
              isOpen={showCreateModal}
              onClose={() => {
                setShowCreateModal(false);
                setEditingOpportunity(null);
              }}
              opportunity={editingOpportunity}
              customers={customers || []}
              onDelete={editingOpportunity ? handleDelete : undefined}
            />
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}
