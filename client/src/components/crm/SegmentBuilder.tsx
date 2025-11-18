/**
 * SegmentBuilder Component
 *
 * Rule-based UI for creating automatic segments
 * Simplified version - full rule builder can be enhanced later
 */

import { Plus, Sparkles, X } from "lucide-react";
import React, { useState } from "react";

import { AppleButton, AppleCard } from "./apple-ui";

export interface SegmentRule {
  field: string;
  operator: string;
  value: string | number;
}

interface SegmentBuilderProps {
  rules: Record<string, any>;
  onChange: (rules: Record<string, any>) => void;
}

export function SegmentBuilder({ rules, onChange }: SegmentBuilderProps) {
  const [localRules, setLocalRules] = useState<SegmentRule[]>(() => {
    // Parse existing rules or start with empty
    if (rules && Object.keys(rules).length > 0) {
      // Simple parsing - can be enhanced
      return [];
    }
    return [];
  });

  const addRule = () => {
    setLocalRules([
      ...localRules,
      { field: "healthScore", operator: "gte", value: 50 },
    ]);
  };

  const removeRule = (index: number) => {
    setLocalRules(localRules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updates: Partial<SegmentRule>) => {
    setLocalRules(
      localRules.map((rule, i) =>
        i === index ? { ...rule, ...updates } : rule
      )
    );
  };

  // Convert rules to format expected by backend
  const formatRules = (rules: SegmentRule[]): Record<string, any> => {
    // Simple format - can be enhanced for complex rules
    const formatted: Record<string, any> = {};
    rules.forEach(rule => {
      if (!formatted[rule.field]) {
        formatted[rule.field] = {};
      }
      formatted[rule.field][rule.operator] = rule.value;
    });
    return formatted;
  };

  // Update parent when rules change
  React.useEffect(() => {
    onChange(formatRules(localRules));
  }, [localRules, onChange]);

  const fieldOptions = [
    { value: "healthScore", label: "Health Score" },
    { value: "status", label: "Status" },
    { value: "totalRevenue", label: "Total Revenue" },
  ];

  const operatorOptions = [
    { value: "gte", label: "Greater than or equal" },
    { value: "lte", label: "Less than or equal" },
    { value: "eq", label: "Equals" },
    { value: "in", label: "In" },
  ];

  return (
    <AppleCard variant="elevated" padding="md">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Segment Rules</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Define rules to automatically add customers to this segment
        </p>

        {localRules.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-md">
            <p className="text-sm text-muted-foreground mb-4">
              No rules defined. Add a rule to start.
            </p>
            <AppleButton
              variant="secondary"
              size="sm"
              onClick={addRule}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Rule
            </AppleButton>
          </div>
        ) : (
          <div className="space-y-3">
            {localRules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border border-border"
              >
                <select
                  value={rule.field}
                  onChange={e => updateRule(index, { field: e.target.value })}
                  className="px-3 py-1.5 border border-border rounded-md bg-background text-sm"
                >
                  {fieldOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <select
                  value={rule.operator}
                  onChange={e =>
                    updateRule(index, { operator: e.target.value })
                  }
                  className="px-3 py-1.5 border border-border rounded-md bg-background text-sm"
                >
                  {operatorOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={rule.value}
                  onChange={e =>
                    updateRule(index, {
                      value: isNaN(Number(e.target.value))
                        ? e.target.value
                        : Number(e.target.value),
                    })
                  }
                  className="flex-1 px-3 py-1.5 border border-border rounded-md bg-background text-sm"
                  placeholder="Value"
                />

                <AppleButton
                  variant="tertiary"
                  size="sm"
                  onClick={() => removeRule(index)}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Remove
                </AppleButton>
              </div>
            ))}

            <AppleButton
              variant="secondary"
              size="sm"
              onClick={addRule}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Rule
            </AppleButton>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Automatic segments update when customer data
            changes. Rules are evaluated periodically.
          </p>
        </div>
      </div>
    </AppleCard>
  );
}
