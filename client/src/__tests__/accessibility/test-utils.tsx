/**
 * Accessibility Testing Utilities
 * Provides helpers for testing WCAG compliance with jest-axe
 */

import { render, RenderOptions } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ReactElement } from "react";
import { expect } from "vitest";

import { ThemeProvider } from "@/contexts/ThemeContext";

// Extend Vitest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

/**
 * Custom render function that includes accessibility testing utilities
 * and required context providers
 */
export function renderWithA11y(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Test accessibility violations using axe-core
 * @param container - The container element to test
 * @param options - Optional axe configuration
 * @returns Promise that resolves with accessibility violations
 */
export async function testA11y(container: HTMLElement) {
  const results = await axe(container, {
    rules: {
      // Disable color-contrast rule in tests (handled by Lighthouse)
      "color-contrast": { enabled: false },
    },
  });
  return results;
}

/**
 * Assert that a component has no accessibility violations
 * @param container - The container element to test
 */
export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await testA11y(container);
  expect(results).toHaveNoViolations();
}
