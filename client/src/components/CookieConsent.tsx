/**
 * Cookie Consent Banner - GDPR Compliant
 */

import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { Link } from "wouter";

import { AppleButton } from "./crm/apple-ui";

// Timing constant
const BANNER_SHOW_DELAY_MS = 2000;

export function CookieConsent() {
  const [showBanner, setShowBanner] = React.useState(false);

  React.useEffect(() => {
    // Check if user has already consented
    try {
      const consent = localStorage.getItem("friday-ai-cookie-consent");
      if (!consent) {
        // Show banner after 2 seconds
        const timer = setTimeout(() => setShowBanner(true), BANNER_SHOW_DELAY_MS);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      // LocalStorage not available (privacy mode, SSR, etc.)
      console.error("LocalStorage not available:", error);
      // Show banner anyway if localStorage fails
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("friday-ai-cookie-consent", "accepted");
    } catch (error) {
      console.error("Failed to save cookie consent:", error);
    }
    setShowBanner(false);

    // Enable analytics here if needed
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("friday-ai-cookie-consent", "declined");
    } catch (error) {
      console.error("Failed to save cookie consent:", error);
    }
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-6xl mx-auto bg-background/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Icon
                  icon="solar:shield-check-bold-duotone"
                  className="w-6 h-6 text-primary flex-shrink-0 mt-1"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    Vi respekterer dit privatliv
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Vi bruger cookies til at forbedre din oplevelse og til
                    anonyme analyseformål. Ved at klikke &quot;Acceptér&quot;
                    giver du samtykke til vores brug af cookies i
                    overensstemmelse med vores{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      privatlivspolitik
                    </Link>
                    . Du kan til enhver tid ændre dine præferencer.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <AppleButton
                  variant="secondary"
                  onClick={handleDecline}
                  className="text-sm whitespace-nowrap"
                >
                  Kun nødvendige
                </AppleButton>
                <AppleButton
                  variant="primary"
                  onClick={handleAccept}
                  className="text-sm whitespace-nowrap"
                >
                  <Icon
                    icon="solar:check-circle-bold-duotone"
                    className="w-4 h-4 mr-2"
                  />
                  Acceptér alle
                </AppleButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
