import demoAcademic1Key from "../../content/reading/demo-academic-1.key.json";
import { type AnswerKey, parseAnswerKey } from "@/domain/reading/parse-content";
import { readingTest } from "./reading-content";

// The answer keys of the Reading tests (ADR-0005 §2), validated against their
// tests when this module loads, so an invalid key fails the build. Only the
// results and review pages import this module (ADR-0008 §2): the test screen
// never carries a key.
const FILES: Record<string, unknown> = {
  "demo-academic-1": demoAcademic1Key,
};

const KEYS = new Map(
  Object.entries(FILES).map(([testId, json]) => {
    const test = readingTest(testId);
    if (!test) throw new Error(`Answer key for unknown test "${testId}"`);
    const parsed = parseAnswerKey(test, json);
    if (!parsed.ok)
      throw new Error(
        `Answer key "${testId}" is invalid:\n${parsed.errors.join("\n")}`,
      );
    return [testId, parsed.value] as const;
  }),
);

export function readingKey(testId: string): AnswerKey | undefined {
  return KEYS.get(testId);
}
