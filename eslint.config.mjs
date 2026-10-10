import js from "@eslint/js";
import path from "node:path";
import nextVitals from "eslint-config-next/core-web-vitals";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const SHARE_VIA_PACKAGES =
  "Apps never import from each other. Move shared code to packages/*.";

// Shared base for every workspace. Framework-specific rules are added as
// further entries scoped with `files` (e.g. "apps/web/**").
export default defineConfig(
  globalIgnores([
    "**/.next/",
    "**/dist/",
    "**/coverage/",
    "**/playwright-report/",
    "**/test-results/",
    "**/next-env.d.ts",
    "apps/api/src/generated/",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["scripts/**"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["apps/web/**"],
    // core-web-vitals includes the Next.js and React Hooks rules and registers
    // the jsx-a11y plugin with a few rules; enable its full recommended set.
    extends: [nextVitals],
    rules: jsxA11y.flatConfigs.recommended.rules,
    settings: { next: { rootDir: path.join(import.meta.dirname, "apps/web") } },
  },
  {
    // Apps never import from each other (docs/architecture/BOUNDARIES.md).
    files: ["apps/**"],
    plugins: { import: importPlugin },
    settings: { "import/resolver": { typescript: true } },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: import.meta.dirname,
          zones: [
            {
              target: "apps/web",
              from: "apps/api",
              message: SHARE_VIA_PACKAGES,
            },
            {
              target: "apps/api",
              from: "apps/web",
              message: SHARE_VIA_PACKAGES,
            },
          ],
        },
      ],
    },
  },
);
