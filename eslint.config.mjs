import js from "@eslint/js";
import path from "node:path";
import nextVitals from "eslint-config-next/core-web-vitals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

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
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["apps/web/**"],
    // core-web-vitals includes the Next.js and React Hooks rules and registers
    // the jsx-a11y plugin with a few rules; enable its full recommended set.
    extends: [nextVitals],
    rules: jsxA11y.flatConfigs.recommended.rules,
    settings: { next: { rootDir: path.join(import.meta.dirname, "apps/web") } },
  },
);
