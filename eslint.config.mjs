import js from "@eslint/js";
import fs from "node:fs";
import path from "node:path";
import nextVitals from "eslint-config-next/core-web-vitals";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const SHARE_VIA_PACKAGES =
  "Apps never import from each other. Move shared code to packages/*.";
// Each folder in apps/web/src/features is one feature (ADR-0004).
const WEB_FEATURES_DIR = path.join(
  import.meta.dirname,
  "apps/web/src/features",
);
const WEB_FEATURES = fs.existsSync(WEB_FEATURES_DIR)
  ? fs.readdirSync(WEB_FEATURES_DIR)
  : [];
const DOMAIN_IS_PURE =
  "Domain code is plain TypeScript without framework, platform or other app code (ADR-0004).";

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
    // The apps' tsconfig files define the "@/*" alias the zones must resolve.
    settings: {
      "import/resolver": {
        typescript: { project: ["apps/*/tsconfig.json"] },
      },
    },
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
            // apps/web folders (ADR-0004).
            {
              target: "apps/web/src/domain",
              from: "apps/web/src",
              except: ["./domain"],
              message: DOMAIN_IS_PURE,
            },
            {
              target: "apps/web/src/data",
              from: [
                "apps/web/src/app",
                "apps/web/src/features",
                "apps/web/src/components",
              ],
              message: "Data access never imports UI or routes (ADR-0004).",
            },
            {
              target: "apps/web/src/components",
              from: [
                "apps/web/src/app",
                "apps/web/src/features",
                "apps/web/src/data",
              ],
              message:
                "Shared components never import features, data or routes (ADR-0004).",
            },
            {
              target: "apps/web/src/features",
              from: "apps/web/src/app",
              message: "Features never import routes (ADR-0004).",
            },
            ...WEB_FEATURES.map((feature) => ({
              target: `apps/web/src/features/${feature}`,
              from: "apps/web/src/features",
              except: [`./${feature}`],
              message:
                "A feature never imports another feature. Move shared code to components/, domain/ or data/ (ADR-0004).",
            })),
          ],
        },
      ],
    },
  },
  {
    files: ["apps/web/src/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/*",
                "react-dom",
                "react-dom/*",
                "next",
                "next/*",
                "next-intl",
                "next-intl/*",
                "node:*",
              ],
              message: DOMAIN_IS_PURE,
            },
          ],
        },
      ],
    },
  },
);
