/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "import",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        project: ["./tsconfig.json"],
      },
    },
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // Keep strict TS errors in tsc; use eslint for style and hooks/imports
    "react/react-in-jsx-scope": "off", // React 17+
    "react/prop-types": "off", // using TypeScript
    "import/order": ["warn", { "alphabetize": { order: "asc", caseInsensitive: true }, "newlines-between": "always" }],
  },
  overrides: [
    {
      files: ["client/**/*.{ts,tsx,js,jsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              "server/*",
              "../server/*",
              "**/server/*"
            ]
          }
        ]
      }
    },
    {
      files: ["server/**/*.{ts,tsx,js,jsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              "client/*",
              "../client/*",
              "**/client/*"
            ]
          }
        ]
      }
    }
  ],
  ignorePatterns: [
    "dist/",
    "build/",
    "node_modules/",
    "cli/",
    "**/*.d.ts",
  ],
};
