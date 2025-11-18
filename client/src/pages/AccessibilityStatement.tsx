import { CheckCircle2, AlertCircle, Info, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { APP_TITLE, SUPPORT_EMAIL } from "@/const";
import { usePageTitle } from "@/hooks/usePageTitle";

// Accessibility statement last updated date
const LAST_UPDATED = "January 28, 2025";

/**
 * Accessibility Statement Page
 *
 * Public-facing page documenting WCAG compliance level,
 * known issues, and contact information for accessibility concerns.
 *
 * WCAG 2.1 Level AA target compliance
 */
export default function AccessibilityStatement() {
  usePageTitle("Accessibility Statement");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Accessibility Statement
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-sm">
              Last updated: {LAST_UPDATED}
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Introduction */}
            <section aria-labelledby="introduction-heading">
              <h2
                id="introduction-heading"
                className="text-2xl font-semibold mb-4"
              >
                Our Commitment
              </h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                {APP_TITLE || "Friday AI Chat"} is committed to ensuring digital
                accessibility for people with disabilities. We are continually
                improving the user experience for everyone and applying the
                relevant accessibility standards to achieve these goals.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                We aim to conform to the{" "}
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/?levels=aaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Web Content Accessibility Guidelines (WCAG) 2.1 (opens in new tab)"
                  className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Web Content Accessibility Guidelines (WCAG) 2.1
                  <ExternalLink
                    className="inline-block w-4 h-4 ml-1"
                    aria-hidden="true"
                  />
                </a>{" "}
                at Level AA.
              </p>
            </section>

            <Separator />

            {/* Compliance Status */}
            <section aria-labelledby="compliance-heading">
              <h2
                id="compliance-heading"
                className="text-2xl font-semibold mb-4"
              >
                Compliance Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      WCAG 2.1 Level AA
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      We are actively working towards full compliance with WCAG
                      2.1 Level AA standards. Most features are currently
                      compliant, with ongoing improvements being made.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      ✅ Implemented Features
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                      <li>Skip navigation links</li>
                      <li>Semantic HTML structure</li>
                      <li>Keyboard navigation support</li>
                      <li>Screen reader compatibility</li>
                      <li>Focus indicators</li>
                      <li>ARIA labels and descriptions</li>
                      <li>Reduced motion support</li>
                      <li>Touch target sizes (44x44px minimum)</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      🔄 Ongoing Improvements
                    </h3>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                      <li>Color contrast optimization</li>
                      <li>Enhanced screen reader testing</li>
                      <li>Automated accessibility testing</li>
                      <li>User feedback integration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Known Issues */}
            <section aria-labelledby="known-issues-heading">
              <h2
                id="known-issues-heading"
                className="text-2xl font-semibold mb-4"
              >
                Known Issues
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Color Contrast (Priority: Medium)
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Some muted text colors may not meet the 4.5:1 contrast
                      ratio requirement. We are actively reviewing and updating
                      color combinations to ensure full compliance.
                    </p>
                    <Badge variant="outline" className="mt-2">
                      Expected fix: Q2 2025
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Third-Party Content
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Some third-party integrations may not fully comply with
                      accessibility standards. We work with our partners to
                      improve accessibility, but cannot guarantee compliance for
                      all external content.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Feedback */}
            <section aria-labelledby="feedback-heading">
              <h2 id="feedback-heading" className="text-2xl font-semibold mb-4">
                Feedback & Contact
              </h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                We welcome your feedback on the accessibility of{" "}
                {APP_TITLE || "Friday AI Chat"}. If you encounter accessibility
                barriers, please let us know:
              </p>
              <div className="space-y-2">
                <p className="text-foreground/90">
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=Accessibility%20Feedback`}
                    className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
                <p className="text-foreground/90">
                  <strong>Subject Line:</strong> Accessibility Feedback
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We aim to respond to accessibility feedback within 5 business
                days.
              </p>
            </section>

            <Separator />

            {/* Testing */}
            <section aria-labelledby="testing-heading">
              <h2 id="testing-heading" className="text-2xl font-semibold mb-4">
                Testing & Evaluation
              </h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                We evaluate accessibility using the following methods:
              </p>
              <ul className="space-y-2 text-foreground/90 list-disc list-inside ml-4">
                <li>Automated testing with axe-core and jest-axe</li>
                <li>Manual testing with screen readers (NVDA, VoiceOver)</li>
                <li>Keyboard-only navigation testing</li>
                <li>Lighthouse accessibility audits</li>
                <li>Color contrast analysis</li>
                <li>Touch target size verification</li>
              </ul>
            </section>

            <Separator />

            {/* Standards Reference */}
            <section aria-labelledby="standards-heading">
              <h2
                id="standards-heading"
                className="text-2xl font-semibold mb-4"
              >
                Standards & Guidelines
              </h2>
              <div className="space-y-3">
                <p className="text-foreground/90">
                  This statement is based on the following standards and
                  guidelines:
                </p>
                <ul className="space-y-2 text-foreground/90 list-disc list-inside ml-4">
                  <li>
                    <a
                      href="https://www.w3.org/WAI/WCAG21/quickref/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WCAG 2.1 Guidelines (opens in new tab)"
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    >
                      WCAG 2.1 Guidelines
                      <ExternalLink
                        className="inline-block w-4 h-4 ml-1"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.w3.org/WAI/ARIA/apg/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="ARIA Authoring Practices Guide (opens in new tab)"
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    >
                      ARIA Authoring Practices Guide
                      <ExternalLink
                        className="inline-block w-4 h-4 ml-1"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://webaim.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WebAIM Resources (opens in new tab)"
                      className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    >
                      WebAIM Resources
                      <ExternalLink
                        className="inline-block w-4 h-4 ml-1"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Updates */}
            <section aria-labelledby="updates-heading">
              <h2 id="updates-heading" className="text-2xl font-semibold mb-4">
                Updates to This Statement
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                We will review and update this accessibility statement regularly
                as we continue to improve accessibility. This statement was last
                updated on {LAST_UPDATED}.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
