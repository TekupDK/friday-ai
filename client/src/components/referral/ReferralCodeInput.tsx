/**
 * ReferralCodeInput Component
 *
 * Input field for applying referral codes during signup/subscription
 * - Validates code in real-time
 * - Shows discount amount
 * - Can be integrated into subscription forms
 */

import { Check, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { trpc } from "@/lib/trpc";

export interface ReferralCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onValidationChange?: (isValid: boolean, discountAmount?: number) => void;
  className?: string;
}

export function ReferralCodeInput({
  value,
  onChange,
  onValidationChange,
  className = "",
}: ReferralCodeInputProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");

  // Debounce the input value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Validate referral code
  const { data: validation, isLoading } = trpc.referral.validateCode.useQuery(
    { code: debouncedValue },
    {
      enabled: debouncedValue.length > 0,
      retry: false,
      onSuccess: (data) => {
        setValidationStatus("valid");
        onValidationChange?.(true, data.code?.discountAmount);
      },
      onError: () => {
        setValidationStatus("invalid");
        onValidationChange?.(false);
      },
    }
  );

  useEffect(() => {
    if (isLoading) {
      setValidationStatus("validating");
    }
  }, [isLoading]);

  useEffect(() => {
    if (value.length === 0) {
      setValidationStatus("idle");
      onValidationChange?.(false);
    }
  }, [value, onValidationChange]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Referral Code (Optional)
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Enter referral code"
          className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            ${
              validationStatus === "valid"
                ? "border-green-500 dark:border-green-500"
                : validationStatus === "invalid"
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
            }
            focus:outline-none focus:ring-2
            ${
              validationStatus === "valid"
                ? "focus:ring-green-500"
                : validationStatus === "invalid"
                  ? "focus:ring-red-500"
                  : "focus:ring-blue-500"
            }
          `}
        />

        {/* Validation Icon */}
        {validationStatus === "validating" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {validationStatus === "valid" && (
          <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}

        {validationStatus === "invalid" && (
          <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
      </div>

      {/* Validation Message */}
      {validationStatus === "valid" && validation?.code && (
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium">
            ✓ Valid referral code!
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            You'll receive a discount of{" "}
            <span className="font-semibold">
              {validation.code.discountAmount / 100} kr
            </span>
            {validation.code.discountType === "percentage"
              ? ` (${validation.code.discountAmount}%)`
              : ""}{" "}
            on your first month
          </p>
        </div>
      )}

      {validationStatus === "invalid" && value.length > 0 && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Invalid or expired referral code
        </p>
      )}

      {validationStatus === "idle" && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Have a referral code? Enter it to get a discount on your subscription
        </p>
      )}
    </div>
  );
}
