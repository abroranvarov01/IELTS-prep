import demoAcademic1 from "../../content/reading/demo-academic-1.json";
import type { ReadingTest } from "@/domain/reading/content";
import { parseReadingTest } from "@/domain/reading/parse-content";

// The Reading tests shipped with the app (ADR-0005 §3), validated when this
// module loads, so an invalid file fails the build. Answer keys are never
// imported here: they are not sent to the browser in M4 (ADR-0005 §2).
const FILES: Record<string, unknown> = {
  "demo-academic-1": demoAcademic1,
};

const TESTS = new Map(
  Object.entries(FILES).map(([id, json]) => {
    const parsed = parseReadingTest(json);
    if (!parsed.ok)
      throw new Error(
        `Reading test "${id}" is invalid:\n${parsed.errors.join("\n")}`,
      );
    return [id, parsed.value] as const;
  }),
);

export function readingTestIds(): string[] {
  return [...TESTS.keys()];
}

export function readingTest(id: string): ReadingTest | undefined {
  return TESTS.get(id);
}
