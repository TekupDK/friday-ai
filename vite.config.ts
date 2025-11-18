import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

// React Fast Refresh is enabled by default in @vitejs/plugin-react
const plugins = [
  react({
    // Exclude test files from Fast Refresh
    exclude: /\.(test|spec)\.(ts|tsx)$/,
  }),
  tailwindcss(),
  jsxLocPlugin(),
];

export default defineConfig({
  plugins: [...plugins, visualizer({ 
    filename: "stats.html", 
    open: false, // Don't auto-open in CI
    gzipSize: true,
    brotliSize: true,
    template: "treemap" // Better visualization
  })],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Performance optimizations
    minify: "esbuild", // Faster than terser
    target: "esnext",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
          ],
          "trpc-vendor": ["@trpc/client", "@trpc/react-query", "@trpc/server"],
          // Split workspace components to reduce main bundle size
          "workspace-lead": ["@/components/workspace/LeadAnalyzer"],
          "workspace-booking": ["@/components/workspace/BookingManager"],
          "workspace-invoice": ["@/components/workspace/InvoiceTracker"],
          "workspace-customer": ["@/components/workspace/CustomerProfile"],
          "workspace-dashboard": ["@/components/workspace/BusinessDashboard"],
          // Split large UI components
          "email-components": ["@/components/inbox/EmailTabV2"],
          "ai-components": ["@/components/panels/AIAssistantPanelV2"],
        },
        compact: true,
      },
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
    // Optimize HMR for faster reload
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
      clientPort: 5173,
      // Reduce latency
      overlay: true,
    },
    // Watch options for better file watching
    watch: {
      usePolling: false, // Use native file system events (faster)
      interval: 100, // Polling interval (if polling enabled)
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**",
        "**/.next/**",
        "**/coverage/**",
        "**/test-results/**",
        "**/playwright-report/**",
      ],
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "@trpc/client", "@trpc/react-query"],
    exclude: ["@vitejs/plugin-react"],
    // Force re-optimization on HMR
    force: false,
  },
  // HMR optimization
  esbuild: {
    // Faster builds for HMR
    target: "esnext",
    // Preserve names for better HMR
    keepNames: true,
  },
});
