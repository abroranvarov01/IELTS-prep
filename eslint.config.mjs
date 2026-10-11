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
const APP_ZONES = [
  { target: "apps/web", from: "apps/api", message: SHARE_VIA_PACKAGES },
  { target: "apps/api", from: "apps/web", message: SHARE_VIA_PACKAGES },
];

// apps/web follows Feature-Sliced Design (ADR-0010; the rules are owned by
// docs/architecture/BOUNDARIES.md). Layers from the lowest: each one imports
// only the layers below it. The Next.js App Router directory and proxy.ts are
// the app layer; "views" is the FSD pages layer, named so that Next.js never
// treats it as a Pages Router.
const WEB_SRC = "apps/web/src";
const LAYERS = ["shared", "entities", "features", "widgets", "views", "app"];
const SLICED_LAYERS = ["entities", "features", "widgets", "views"];
const APP_LAYER = [`${WEB_SRC}/app`, `${WEB_SRC}/proxy.ts`];
const layerPaths = (layer) =>
  layer === "app" ? APP_LAYER : [`${WEB_SRC}/${layer}`];
const layersAbove = (layer) =>
  LAYERS.slice(LAYERS.indexOf(layer) + 1).flatMap(layerPaths);
const entriesOf = (dir) => {
  const full = path.join(import.meta.dirname, dir);
  return fs.existsSync(full)
    ? fs.readdirSync(full, { withFileTypes: true })
    : [];
};
const SLICES = SLICED_LAYERS.flatMap((layer) =>
  entriesOf(`${WEB_SRC}/${layer}`)
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      layer,
      name: entry.name,
      dir: `${WEB_SRC}/${layer}/${entry.name}`,
    })),
);
// A slice's public API: index.ts, server-only entry points (*.server.ts) and
// test fixtures (testing.ts), all at the slice's root.
const serverEntries = (dir) =>
  entriesOf(dir)
    .filter((entry) => entry.isFile() && entry.name.endsWith(".server.ts"))
    .map((entry) => entry.name);
const PUBLIC_API =
  "Import a slice through its public API (its index.ts), never its internals (ADR-0010).";

const FSD_ZONES = [
  ...LAYERS.slice(0, -1).map((layer) => ({
    target: `${WEB_SRC}/${layer}`,
    from: layersAbove(layer),
    message: `The ${layer} layer imports only the layers below it (ADR-0010).`,
  })),
  ...SLICES.map(({ layer, name, dir }) => ({
    target: dir,
    from: `${WEB_SRC}/${layer}`,
    except: [`./${name}`],
    message: `Slices of the ${layer} layer never import each other. Move what both need to a lower layer (ADR-0010).`,
  })),
  ...SLICES.map(({ layer, dir }) => ({
    target: layersAbove(layer),
    from: dir,
    except: [
      "./index.ts",
      "./testing.ts",
      ...serverEntries(dir).map((file) => `./${file}`),
    ],
    message: PUBLIC_API,
  })),
  ...SLICES.filter(({ dir }) => serverEntries(dir).length > 0).map(
    ({ layer, dir }) => ({
      target: layersAbove(layer).filter(
        (target) => !APP_LAYER.includes(target),
      ),
      from: serverEntries(dir).map((file) => `${dir}/${file}`),
      message:
        "Server-only entry points (*.server.ts) are imported by route files and the proxy only (ADR-0010).",
    }),
  ),
  ...SLICES.flatMap(({ dir }) => [
    {
      target: `${dir}/model`,
      from: [`${dir}/ui`, `${dir}/api`],
      message:
        "A model segment never imports its slice's ui or api segments (ADR-0010).",
    },
    {
      target: `${dir}/api`,
      from: `${dir}/ui`,
      message:
        "An api segment never imports its slice's ui segment (ADR-0010).",
    },
  ]),
];
// Test fixtures and helpers stay out of production code.
const TEST_FILES = ["**/*.test.{ts,tsx}", "**/testing.ts", "**/testing/**"];
const TEST_ONLY_ZONES = [
  {
    target: WEB_SRC,
    from: [
      `${WEB_SRC}/**/testing.ts`,
      `${WEB_SRC}/**/testing/**`,
      `${WEB_SRC}/**/*.fixture.ts`,
    ],
    message: "Test fixtures and helpers are imported by tests only (ADR-0010).",
  },
];
const MODEL_IS_PURE =
  "A model segment is plain TypeScript: no React, Next.js, next-intl, Node or browser APIs (ADR-0010; INVARIANTS I-3, I-4).";

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
    // Apps never import from each other (docs/architecture/BOUNDARIES.md), and
    // apps/web keeps its Feature-Sliced Design boundaries.
    files: ["apps/**"],
    plugins: { import: importPlugin },
    // The apps' tsconfig files define the "@/*" alias the zones must resolve,
    // so "@/entities/..." and "../entities/..." are checked alike.
    settings: {
      "import/resolver": {
        typescript: { project: ["apps/*/tsconfig.json"] },
      },
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        { basePath: import.meta.dirname, zones: [...APP_ZONES, ...FSD_ZONES] },
      ],
    },
  },
  {
    // The same zones, plus: production code never imports test fixtures.
    files: [`${WEB_SRC}/**`],
    ignores: TEST_FILES,
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: import.meta.dirname,
          zones: [...APP_ZONES, ...FSD_ZONES, ...TEST_ONLY_ZONES],
        },
      ],
    },
  },
  {
    files: [`${WEB_SRC}/**`],
    rules: { "import/no-cycle": ["error", { ignoreExternal: true }] },
  },
  {
    // Every file in apps/web/src belongs to a layer. A src/pages folder would
    // also turn into a Next.js Pages Router.
    files: [`${WEB_SRC}/**`],
    ignores: [
      ...LAYERS.map((layer) => `${WEB_SRC}/${layer}/**`),
      `${WEB_SRC}/proxy.ts`,
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program",
          message: `Code in apps/web/src lives in a layer: ${LAYERS.join(", ")} (the App Router), or proxy.ts (ADR-0010).`,
        },
      ],
    },
  },
  {
    files: [`${WEB_SRC}/**/model/**`],
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
              message: MODEL_IS_PURE,
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        ...[
          "window",
          "document",
          "navigator",
          "localStorage",
          "sessionStorage",
          "indexedDB",
        ].map((name) => ({ name, message: MODEL_IS_PURE })),
      ],
    },
  },
  {
    files: [`${WEB_SRC}/**/api/**`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react/*", "react-dom", "react-dom/*"],
              message: "An api segment does I/O and never renders (ADR-0010).",
            },
          ],
        },
      ],
    },
  },
);
