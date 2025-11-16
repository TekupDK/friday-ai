/**
 * Skip Links Component
 * Provides keyboard-accessible skip navigation links to bypass repetitive content
 * WCAG 2.4.1 (Level A) - Bypass Blocks
 */

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-[100] focus-within:top-4 focus-within:left-4">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all inline-block"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-2 transition-all inline-block"
      >
        Skip to navigation
      </a>
    </div>
  );
}

