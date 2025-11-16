import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    // Plugin to handle CSS imports in tests - must come before other plugins
    {
      name: "css-mock",
      enforce: "pre",
      // Intercept ALL CSS imports before they reach the transformer
      load(id) {
        if (
          id.endsWith(".css") ||
          id.includes(".css?") ||
          id.includes("katex") ||
          id.includes("/.css")
        ) {
          // Return empty module for CSS files
          return "export default {}";
        }
      },
      resolveId(id, importer) {
        // Handle all CSS file resolution - be very aggressive
        if (
          id.endsWith(".css") ||
          id.includes(".css") ||
          id.includes("katex")
        ) {
          // Return virtual ID that load() handles
          return `\0css:${id}`;
        }
        return null;
      },
    },
  ],
  root: path.resolve(import.meta.dirname),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  ssr: {
    // Ensure Vite transforms problematic deps that import CSS (e.g., streamdown -> katex)
    // and don't externalize CSS files
    noExternal: ["streamdown", "katex", /\.css$/],
  },
  optimizeDeps: {
    // Exclude problematic CSS imports from optimization
    exclude: ["katex"],
    // Include streamdown to pre-bundle it (might help with CSS)
    include: ["streamdown"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts", "./tests/setup.ts"],
    include: [
      "server/**/*.test.ts",
      "server/**/*.spec.ts",
      "client/**/*.test.ts",
      "client/**/*.test.tsx",
      "client/**/*.spec.tsx",
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
    ],
    exclude: [
      // Exclude Playwright and E2E suites from Vitest unit run
      "tests/ai/**",
      "tests/e2e/**",
      // Explicitly exclude Playwright-style test that uses test.describe()
      "tests/phase1-code-verification.test.ts",
      // Exclude heavy integration tests that require full app providers
      "client/src/components/panels/**",
      "client/src/components/ChatPanel.test.tsx",
      "client/src/hooks/**/useFridayChatSimple-phase2.test.ts",
    ],
    deps: {
      // Inline these dependencies so Vite transforms their CSS imports under test
      inline: ["streamdown", "katex"],
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 0.8,
        statements: 0.8,
        functions: 0.8,
        branches: 0.7,
      },
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/vitest.setup.ts",
      ],
    },
  },
});
