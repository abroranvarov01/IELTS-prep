// Architecture check (run by `pnpm lint`): lints imports that the apps/web
// Feature-Sliced Design rules must reject, in every import spelling, and one
// that they must allow, so that the ESLint enforcement cannot silently stop
// working (docs/architecture/BOUNDARIES.md, ADR-0010). The files are virtual:
// nothing is written to disk.
import { createRequire } from "node:module";
import path from "node:path";
import { ESLint } from "eslint";

const ROOT = path.join(import.meta.dirname, "..");
const SRC = "apps/web/src";
const PATHS = "import/no-restricted-paths";

const CASES = [
  // A layer never imports a layer above it.
  [
    `${SRC}/entities/goal/model/probe.ts`,
    `import { Home } from "@/views/home";`,
    PATHS,
  ],
  [
    `${SRC}/entities/goal/model/probe.ts`,
    `import { Home } from "../../../views/home";`,
    PATHS,
  ],
  [
    `${SRC}/entities/goal/model/probe.ts`,
    `export { Home } from "@/views/home";`,
    PATHS,
  ],
  [
    `${SRC}/entities/goal/model/probe.ts`,
    `export const load = () => import("@/views/home");`,
    PATHS,
  ],
  [
    `${SRC}/shared/ui/Probe.tsx`,
    `import { readGoal } from "@/entities/goal";`,
    PATHS,
  ],
  // Slices of one layer never import each other.
  [
    `${SRC}/features/answer-question/ui/Probe.tsx`,
    `import { EvidenceList } from "@/features/mark-passage";`,
    PATHS,
  ],
  [
    `${SRC}/views/home/ui/Probe.tsx`,
    `export { ReadingScreen } from "../../reading-test";`,
    PATHS,
  ],
  // A slice is used through its public API only.
  [
    `${SRC}/views/reading-test/ui/Probe.tsx`,
    `import { apply } from "@/entities/reading/model/session";`,
    PATHS,
  ],
  [
    `${SRC}/views/reading-test/ui/Probe.tsx`,
    `import { apply } from "../../../entities/reading/model/session";`,
    PATHS,
  ],
  [
    `${SRC}/views/reading-test/ui/Probe.tsx`,
    `export { apply } from "@/entities/reading/model/session";`,
    PATHS,
  ],
  [
    `${SRC}/app/probe.ts`,
    `import { Home } from "@/views/home/ui/Home";`,
    PATHS,
  ],
  [
    `${SRC}/proxy.ts`,
    `import { readGoal } from "./entities/goal/api/goal-cookie";`,
    PATHS,
  ],
  // Server-only entry points belong to the app layer; fixtures to tests.
  [
    `${SRC}/views/reading-results/ui/Probe.tsx`,
    `import { readingKey } from "@/entities/reading/keys.server";`,
    PATHS,
  ],
  [
    `${SRC}/views/reading-test/ui/Probe.tsx`,
    `import { demoTest } from "@/entities/reading/testing";`,
    PATHS,
  ],
  // Segments: model is pure and never imports ui or api; api never renders.
  [
    `${SRC}/entities/reading/model/probe.ts`,
    `import { useState } from "react";`,
    "no-restricted-imports",
  ],
  [
    `${SRC}/entities/reading/model/probe.ts`,
    `export const read = () => localStorage.getItem("x");`,
    "no-restricted-globals",
  ],
  [
    `${SRC}/entities/reading/model/probe.ts`,
    `import { useReading } from "../ui/reading-context";`,
    PATHS,
  ],
  [
    `${SRC}/entities/reading/api/probe.ts`,
    `import { useState } from "react";`,
    "no-restricted-imports",
  ],
  // Code outside the layers (a src/pages folder would become a Pages Router).
  [
    `${SRC}/pages/index.tsx`,
    `export default function Page() { return null; }`,
    "no-restricted-syntax",
  ],
];
const ALLOWED = [
  [
    `${SRC}/views/reading-test/ui/Probe.tsx`,
    `import { apply } from "@/entities/reading";\nexport const go = apply;`,
  ],
  [
    `${SRC}/app/probe.ts`,
    `import { readingKey } from "@/entities/reading/keys.server";\nexport const key = readingKey;`,
  ],
];

// import/no-cycle needs the files on disk; it is not what this checks. React
// is installed in apps/web only, so its version is given rather than detected.
const react = createRequire(path.join(ROOT, "apps/web/package.json"))(
  "react/package.json",
);
const eslint = new ESLint({
  cwd: ROOT,
  overrideConfig: {
    rules: { "import/no-cycle": "off" },
    settings: { react: { version: react.version } },
  },
});
const lint = async (file, code) => {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(ROOT, file),
  });
  return result.messages;
};

const problems = [];
for (const [file, code, rule] of CASES) {
  const messages = await lint(file, code);
  if (!messages.some((m) => m.ruleId === rule))
    problems.push(`not rejected by ${rule}: ${file}: ${code}`);
}
for (const [file, code] of ALLOWED) {
  const messages = (await lint(file, code)).filter((m) => m.severity === 2);
  if (messages.length > 0)
    problems.push(
      `rejected but allowed: ${file}: ${code}\n  ${messages.map((m) => m.message).join("\n  ")}`,
    );
}

if (problems.length > 0) {
  console.error(
    `The architecture lint rules do not work as documented:\n${problems.join("\n")}`,
  );
  process.exit(1);
}
