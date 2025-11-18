// Flat ESLint config for ESLint v9+
// Mirrors previous .eslintrc.cjs settings and adds import boundaries
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      "dist/",
      "build/",
      "node_modules/",
      "cli/",
      "**/*.d.ts",
      "storybook-static/",
      "playwright-report/",
      "coverage/",
      "docs/",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: { project: ["./tsconfig.json"] },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
    },
    rules: {
      // Keep strict TS errors in tsc; use eslint for style and hooks/imports
      "react/react-in-jsx-scope": "off", // React 17+
      "react/prop-types": "off", // using TypeScript
      "import/order": [
        "warn",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
        },
      ],
      "import/no-restricted-paths": [
        "error",
        {
          basePath: process.cwd(),
          zones: [
            { target: "client", from: "server", except: ["server/routers"] },
            { target: "server", from: "client" },
          ],
        },
      ],
    },
  },

  {
    files: ["client/src/lib/trpc.ts"],
    rules: {
      "import/no-restricted-paths": "off",
    },
  },
];
