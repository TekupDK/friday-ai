/**
 * ReferralDashboard Component
 *
 * Complete referral program management dashboard
 * - View referral codes
 * - Create new codes
 * - Track rewards and stats
 * - View leaderboard
 */

import {
  Award,
  Copy,
  Gift,
  Plus,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { AppleButton, AppleCard } from "@/components/crm/apple-ui";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { trpc } from "@/lib/trpc";

export interface ReferralDashboardProps {
  className?: string;
}

export function ReferralDashboard({ className = "" }: ReferralDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customCode, setCustomCode] = useState("");

  const utils = trpc.useUtils();

  // Fetch referral codes
  const {
    data: codes,
    isLoading: codesLoading,
    error: codesError,
  } = trpc.referral.listCodes.useQuery();

  // Fetch rewards
  const {
    data: rewards,
    isLoading: rewardsLoading,
    error: rewardsError,
  } = trpc.referral.listRewards.useQuery();

  // Fetch stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = trpc.referral.getStats.useQuery();

  // Fetch top referrers
  const {
    data: topReferrers,
    isLoading: topLoading,
  } = trpc.referral.getTopReferrers.useQuery({ limit: 10 });

  // Fetch config
  const { data: config } = trpc.referral.getConfig.useQuery();

  // Create code mutation
  const createCodeMutation = trpc.referral.createCode.useMutation({
    onSuccess: () => {
      utils.referral.listCodes.invalidate();
      utils.referral.getStats.invalidate();
      toast.success("Referral code created successfully!");
      setShowCreateModal(false);
      setCustomCode("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create referral code");
    },
  });

  // Deactivate code mutation
  const deactivateMutation = trpc.referral.deactivateCode.useMutation({
    onSuccess: () => {
      utils.referral.listCodes.invalidate();
      toast.success("Referral code deactivated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to deactivate code");
    },
  });

  const handleCreateCode = async () => {
    await createCodeMutation.mutateAsync({
      customCode: customCode || undefined,
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleShareCode = (code: string) => {
    const url = `${window.location.origin}/subscribe?ref=${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Referral link copied to clipboard!");
  };

  const handleDeactivate = async (codeId: number) => {
    if (!confirm("Are you sure you want to deactivate this referral code?")) {
      return;
    }
    await deactivateMutation.mutateAsync({ referralCodeId: codeId });
  };

  const isLoading = codesLoading || rewardsLoading || statsLoading;
  const error = codesError || rewardsError || statsError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Referral Program
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Refer friends and earn rewards
          </p>
        </div>
        <AppleButton
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Code
        </AppleButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AppleCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Referrals
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats?.totalReferrals || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </AppleCard>

        <AppleCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Converted
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats?.completedReferrals || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </AppleCard>

        <AppleCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Earned
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {((stats?.totalEarnings || 0) / 100).toFixed(0)} kr
              </p>
            </div>
            <Gift className="w-8 h-8 text-purple-500" />
          </div>
        </AppleCard>

        <AppleCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conversion Rate
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats?.conversionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <Award className="w-8 h-8 text-orange-500" />
          </div>
        </AppleCard>
      </div>

      {/* Referral Codes */}
      <AppleCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Referral Codes
          </h3>

          {codes && codes.length > 0 ? (
            <div className="space-y-3">
              {codes.map((code: any) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {code.code}
                      </code>
                      {!code.isActive && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        Uses: {code.currentUses}
                        {code.maxUses ? ` / ${code.maxUses}` : ""}
                      </span>
                      <span>
                        Discount: {code.discountAmount / 100} kr
                      </span>
                      {code.validUntil && (
                        <span>
                          Valid until:{" "}
                          {new Date(code.validUntil).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AppleButton
                      onClick={() => handleCopyCode(code.code)}
                      variant="secondary"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </AppleButton>
                    <AppleButton
                      onClick={() => handleShareCode(code.code)}
                      variant="secondary"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4" />
                    </AppleButton>
                    {code.isActive && (
                      <AppleButton
                        onClick={() => handleDeactivate(code.id)}
                        variant="secondary"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Deactivate
                      </AppleButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No referral codes yet. Create one to get started!</p>
            </div>
          )}
        </div>
      </AppleCard>

      {/* Rewards */}
      <AppleCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Referral Rewards
          </h3>

          {rewards && rewards.length > 0 ? (
            <div className="space-y-3">
              {rewards.map((reward: any) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Referral #{reward.id}
                      </span>
                      <StatusBadge status={reward.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        Reward: {reward.rewardAmount / 100} kr
                      </span>
                      <span>
                        Created:{" "}
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </span>
                      {reward.completedAt && (
                        <span>
                          Completed:{" "}
                          {new Date(reward.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No rewards yet. Share your referral code to earn rewards!</p>
            </div>
          )}
        </div>
      </AppleCard>

      {/* Leaderboard */}
      {topReferrers && topReferrers.length > 0 && (
        <AppleCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Referrers
            </h3>
            <div className="space-y-2">
              {topReferrers.map((referrer: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-8">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {referrer.isCurrentUser ? "You" : `User ${referrer.userId}`}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {referrer.totalReferrals} referrals
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AppleCard>
      )}

      {/* Create Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AppleCard className="w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create Referral Code
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Code (optional)
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="Leave empty for auto-generated code"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 50 characters. Auto-generated if left empty.
                </p>
              </div>

              {config && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Default reward: {config.defaultReferredReward / 100} kr for
                    referred customer
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Your reward: {config.defaultReferrerReward / 100} kr per
                    successful referral
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <AppleButton
                  onClick={handleCreateCode}
                  disabled={createCodeMutation.isPending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {createCodeMutation.isPending ? "Creating..." : "Create"}
                </AppleButton>
                <AppleButton
                  onClick={() => {
                    setShowCreateModal(false);
                    setCustomCode("");
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </AppleButton>
              </div>
            </div>
          </AppleCard>
        </div>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    rewarded: {
      label: "Rewarded",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    expired: {
      label: "Expired",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${config.className}`}>
      {config.label}
    </span>
  );
}
