/**
 * Referral Program Page
 *
 * Full-page view for managing referrals
 */

import React from "react";

import { ReferralDashboard } from "@/components/referral";

export function ReferralPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ReferralDashboard />
    </div>
  );
}

export default ReferralPage;
