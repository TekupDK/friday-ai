import path from "path";

import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// React Fast Refresh is enabled by default in @vitejs/plugin-react
const plugins = [
  react({
    // Exclude test files from Fast Refresh
    exclude: /\.(test|spec)\.(ts|tsx)$/,
  }),
  tailwindcss(),
  jsxLocPlugin(),
];

export default defineConfig(({ mode }) => ({
  plugins: [
    ...plugins,
    visualizer({
      filename: "stats.html",
      open: false, // Don't auto-open in CI
      gzipSize: true,
      brotliSize: true,
      template: "treemap", // Better visualization
    }),
  ],
  // Define compile-time constants
  define: {
    __ENABLE_SHOWCASE__: mode === "development",
  },
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
        manualChunks(id) {
          // Node modules chunking strategy
          if (id.includes("node_modules")) {
            // React ecosystem - small, frequently used
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }

            // Radix UI - split all into one vendor chunk
            if (id.includes("@radix-ui")) {
              return "radix-vendor";
            }

            // tRPC - API layer
            if (id.includes("@trpc") || id.includes("@tanstack/react-query")) {
              return "trpc-vendor";
            }

            // Large animation libraries
            if (id.includes("framer-motion") || id.includes("gsap")) {
              return "animation-vendor";
            }

            // Charts and data visualization
            if (id.includes("recharts") || id.includes("d3")) {
              return "charts-vendor";
            }

            // FullCalendar - large calendar library
            if (id.includes("@fullcalendar")) {
              return "calendar-vendor";
            }

            // Markdown and syntax highlighting
            if (id.includes("react-markdown") || id.includes("react-syntax-highlighter")) {
              return "markdown-vendor";
            }

            // AI/LLM libraries
            if (id.includes("@google/generative-ai") || id.includes("langfuse")) {
              return "ai-vendor";
            }

            // Other large vendors
            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }

            // All other node_modules go into common vendor
            return "vendor";
          }

          // App code chunking
          // CRM pages - lazy loaded
          if (id.includes("/pages/crm/")) {
            return "crm-pages";
          }

          // Workspace components - lazy loaded
          if (id.includes("/components/workspace/")) {
            return "workspace";
          }

          // Email/Inbox components
          if (id.includes("/components/inbox/")) {
            return "inbox";
          }

          // AI/Chat components
          if (id.includes("/components/panels/") || id.includes("/components/chat/")) {
            return "chat";
          }
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
    // Note: port and clientPort are omitted to use the same port as the dev server
    // This prevents WebSocket connection errors when port changes (e.g., 5173 -> 5174)
    // In Docker, HMR host/port can be overridden via environment variables
    hmr: {
      protocol: "ws",
      host: process.env.VITE_HMR_HOST || "localhost",
      // port and clientPort will automatically match the dev server port
      // Can be overridden via VITE_HMR_PORT env var in Docker
      ...(process.env.VITE_HMR_PORT && {
        port: parseInt(process.env.VITE_HMR_PORT, 10),
        clientPort: parseInt(process.env.VITE_HMR_PORT, 10),
      }),
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
}));
