/**
 * RelationshipGraph Component
 *
 * Network visualization for customer relationships
 * Simple list view with grouping by relationship type
 */

import { Network, Plus } from "lucide-react";
import React, { useState } from "react";

import { AppleButton, AppleCard } from "./apple-ui";
import { ErrorDisplay } from "./ErrorDisplay";
import { LoadingSpinner } from "./LoadingSpinner";
import { RelationshipCard, type RelationshipData } from "./RelationshipCard";
import { RelationshipForm } from "./RelationshipForm";

import { trpc } from "@/lib/trpc";

interface RelationshipGraphProps {
  customerProfileId: number;
}

export function RelationshipGraph({
  customerProfileId,
}: RelationshipGraphProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Fetch relationships
  const {
    data: relationships,
    isLoading,
    error,
    isError,
  } = trpc.crm.extensions.getRelationships.useQuery({
    customerProfileId,
    relationshipType: selectedType || undefined,
  });

  // Delete mutation
  const deleteMutation = trpc.crm.extensions.deleteRelationship.useMutation({
    onSuccess: () => {
      utils.crm.extensions.getRelationships.invalidate({ customerProfileId });
    },
    onError: error => {
      console.error("Failed to delete relationship:", error);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this relationship?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Group relationships by type
  const groupedRelationships = React.useMemo(() => {
    if (!relationships) return {};
    const groups: Record<string, RelationshipData[]> = {};
    relationships.forEach(rel => {
      const type = rel.relationship.relationshipType;
      if (!groups[type]) {
        groups[type] = [];
      }
      // Type assertion to match RelationshipData interface
      groups[type].push(rel as RelationshipData);
    });
    return groups;
  }, [relationships]);

  // Get unique relationship types
  const relationshipTypes = React.useMemo(() => {
    if (!relationships) return [];
    const types = new Set(
      relationships.map(rel => rel.relationship.relationshipType)
    );
    return Array.from(types).sort();
  }, [relationships]);

  const getRelationshipLabel = (type: string) => {
    const labels: Record<string, string> = {
      parent_company: "Parent Companies",
      subsidiary: "Subsidiaries",
      referrer: "Referrers",
      referred_by: "Referred By",
      partner: "Partners",
      competitor: "Competitors",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <AppleCard variant="elevated" padding="lg">
        <LoadingSpinner message="Loading relationships..." />
      </AppleCard>
    );
  }

  if (isError) {
    return (
      <AppleCard variant="elevated" padding="lg">
        <ErrorDisplay message="Failed to load relationships" error={error} />
      </AppleCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Customer Relationships</h3>
            <p className="text-sm text-muted-foreground">
              {relationships?.length || 0} relationship
              {relationships?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <AppleButton
          onClick={() => setShowForm(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Relationship
        </AppleButton>
      </div>

      {/* Filter */}
      {relationshipTypes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              selectedType === null
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted"
            }`}
          >
            All
          </button>
          {relationshipTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedType === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              {getRelationshipLabel(type)}
            </button>
          ))}
        </div>
      )}

      {/* Relationships List */}
      {relationships && relationships.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedRelationships).map(([type, rels]) => (
            <div key={type} className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {getRelationshipLabel(type)} ({rels.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rels.map(rel => (
                  <RelationshipCard
                    key={rel.relationship.id}
                    relationship={rel}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AppleCard variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Network className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No relationships yet</h3>
            <p className="text-muted-foreground mb-4">
              Connect this customer with other customers to build a relationship network
            </p>
            <AppleButton
              onClick={() => setShowForm(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Relationship
            </AppleButton>
          </div>
        </AppleCard>
      )}

      {/* Form Modal */}
      <RelationshipForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        customerProfileId={customerProfileId}
        onSuccess={() => {
          setShowForm(false);
        }}
      />
    </div>
  );
}

