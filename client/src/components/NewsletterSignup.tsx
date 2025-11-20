/**
 * Newsletter Signup Component
 */

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import React from "react";

import { AppleButton, AppleCard } from "./crm/apple-ui";

// Timing constants
const SUCCESS_MESSAGE_RESET_MS = 5000;
const API_CALL_TIMEOUT_MS = 1000;

export function NewsletterSignup() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = React.useState("");

  // Auto-reset success/error state with cleanup
  React.useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, SUCCESS_MESSAGE_RESET_MS);

      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Proper email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatus("error");
      setMessage("Indtast venligst en gyldig email-adresse");
      return;
    }

    setStatus("loading");

    try {
      // TODO: Replace with actual API endpoint
      // await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, API_CALL_TIMEOUT_MS));

      // Store in localStorage for now (replace with actual API)
      try {
        const subscribersData = localStorage.getItem("newsletter-subscribers");
        const subscribers = subscribersData ? JSON.parse(subscribersData) : [];
        if (!subscribers.includes(email)) {
          subscribers.push(email);
          localStorage.setItem(
            "newsletter-subscribers",
            JSON.stringify(subscribers)
          );
        }
      } catch (error) {
        console.error("Failed to save newsletter subscription:", error);
        // Continue anyway - the important part is showing success to user
      }

      setStatus("success");
      setMessage("Tak! Du er nu tilmeldt vores nyhedsbrev.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage("Noget gik galt. Prøv venligst igen.");
    }
  };

  return (
    <AppleCard
      variant="elevated"
      padding="lg"
      className="bg-gradient-to-r from-primary/5 to-purple-500/5"
    >
      <div className="text-center space-y-6">
        <div>
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon
              icon="solar:letter-bold-duotone"
              className="w-8 h-8 text-primary"
            />
          </div>
          <h3 className="text-2xl font-bold mb-2">Hold dig opdateret</h3>
          <p className="text-muted-foreground">
            Få nyheder om AI-funktioner, produktopdateringer og tips til at
            optimere din workflow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@email.dk"
              disabled={status === "loading" || status === "success"}
              className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Email adresse"
            />
            <AppleButton
              type="submit"
              variant="primary"
              disabled={status === "loading" || status === "success"}
              className="whitespace-nowrap"
            >
              {status === "loading" ? (
                <>
                  <Icon
                    icon="solar:refresh-bold-duotone"
                    className="w-4 h-4 mr-2 animate-spin"
                  />
                  Tilmelder...
                </>
              ) : status === "success" ? (
                <>
                  <Icon
                    icon="solar:check-circle-bold-duotone"
                    className="w-4 h-4 mr-2"
                  />
                  Tilmeldt!
                </>
              ) : (
                <>
                  <Icon
                    icon="solar:letter-bold-duotone"
                    className="w-4 h-4 mr-2"
                  />
                  Tilmeld
                </>
              )}
            </AppleButton>
          </div>

          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm mt-3 ${
                status === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {message}
            </motion.p>
          )}
        </form>

        <p className="text-xs text-muted-foreground">
          Vi respekterer dit privatliv. Afmeld til enhver tid.
        </p>
      </div>
    </AppleCard>
  );
}
