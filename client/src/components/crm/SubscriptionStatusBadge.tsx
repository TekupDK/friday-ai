/**
 * SubscriptionStatusBadge Component
 *
 * Displays subscription status with color-coded badge
 */

import React from "react";

type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  className?: string;
}

export function SubscriptionStatusBadge({
  status,
  className = "",
}: SubscriptionStatusBadgeProps) {
  const getStatusConfig = (status: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          bgColor: "bg-green-500/10",
          textColor: "text-green-600 dark:text-green-400",
        };
      case "paused":
        return {
          label: "Paused",
          bgColor: "bg-yellow-500/10",
          textColor: "text-yellow-600 dark:text-yellow-400",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          bgColor: "bg-red-500/10",
          textColor: "text-red-600 dark:text-red-400",
        };
      case "expired":
        return {
          label: "Expired",
          bgColor: "bg-gray-500/10",
          textColor: "text-gray-600 dark:text-gray-400",
        };
      default:
        return {
          label: "Unknown",
          bgColor: "bg-gray-500/10",
          textColor: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${config.bgColor} ${config.textColor} capitalize ${className}`}
      aria-label={`Subscription status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}

