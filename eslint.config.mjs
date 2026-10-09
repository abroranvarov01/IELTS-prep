import js from "@eslint/js";
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
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
);
