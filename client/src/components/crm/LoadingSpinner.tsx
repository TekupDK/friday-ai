/**
 * Loading Spinner Component
 *
 * Reusable loading indicator for CRM pages.
 * Provides consistent loading UI across the application.
 */

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div className="text-center py-12">
      <div
        className={`${sizeClasses[size]} mx-auto rounded-full bg-primary/10 animate-pulse mb-4`}
      />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
