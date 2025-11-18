/**
 * RelationshipCard Component
 *
 * Card component for displaying customer relationships
 */

import { ExternalLink, Trash2, TrendingUp } from "lucide-react";
import React from "react";
import { useLocation } from "wouter";
import { AppleButton, AppleCard } from "./apple-ui";
import { cn } from "@/lib/utils";

export interface RelationshipData {
  relationship: {
    id: number;
    userId: number;
    customerProfileId: number;
    relatedCustomerProfileId: number;
    relationshipType: string;
    description: string | null;
    strength: number | null;
    createdAt: string;
    updatedAt: string;
  };
  relatedCustomer: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
  };
}

interface RelationshipCardProps {
  relationship: RelationshipData;
  onDelete?: (id: number) => void;
}

// Relationship type labels
const getRelationshipLabel = (type: string) => {
  const labels: Record<string, string> = {
    parent_company: "Parent Company",
    subsidiary: "Subsidiary",
    referrer: "Referrer",
    referred_by: "Referred By",
    partner: "Partner",
    competitor: "Competitor",
  };
  return labels[type] || type;
};

// Relationship type colors
const getRelationshipColor = (type: string) => {
  const colors: Record<string, string> = {
    parent_company: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    subsidiary: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    referrer: "bg-green-500/10 text-green-600 dark:text-green-400",
    referred_by: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    partner: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    competitor: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return colors[type] || "bg-muted text-muted-foreground";
};

// Format date
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export function RelationshipCard({
  relationship,
  onDelete,
}: RelationshipCardProps) {
  const [, navigate] = useLocation();
  const { relationship: rel, relatedCustomer } = relationship;

  return (
    <AppleCard variant="elevated" padding="md" hoverable>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  getRelationshipColor(rel.relationshipType)
                )}
              >
                {getRelationshipLabel(rel.relationshipType)}
              </span>
              {rel.strength !== null && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>Strength: {rel.strength}/10</span>
                </div>
              )}
            </div>
            <h4 className="font-semibold text-sm">{relatedCustomer.name}</h4>
            {relatedCustomer.email && (
              <p className="text-xs text-muted-foreground truncate">
                {relatedCustomer.email}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {rel.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {rel.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>Created {formatDate(rel.createdAt)}</span>
          <div className="flex items-center gap-2">
            <AppleButton
              variant="tertiary"
              size="sm"
              onClick={() => navigate(`/crm/customers/${relatedCustomer.id}`)}
              leftIcon={<ExternalLink className="w-3 h-3" />}
            >
              View
            </AppleButton>
            {onDelete && (
              <AppleButton
                variant="tertiary"
                size="sm"
                onClick={() => onDelete(rel.id)}
                leftIcon={<Trash2 className="w-3 h-3" />}
              >
                Delete
              </AppleButton>
            )}
          </div>
        </div>
      </div>
    </AppleCard>
  );
}

