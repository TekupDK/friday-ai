/**
 * Error Display Component
 * 
 * Reusable error display for CRM pages.
 * Provides consistent error UI across the application.
 */

import React from "react";
import { AppleCard } from "@/components/crm/apple-ui";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  message?: string;
  error?: { message?: string } | null;
  onRetry?: () => void;
}

export function ErrorDisplay({
  message = "Failed to load",
  error,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <AppleCard variant="elevated">
      <div className="p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive mb-2 font-semibold">{message}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {error?.message || "An error occurred. Please try again."}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            Retry
          </Button>
        )}
      </div>
    </AppleCard>
  );
}

