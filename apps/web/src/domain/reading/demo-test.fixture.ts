import demo from "../../../content/reading/demo-academic-1.json";
import demoKeyJson from "../../../content/reading/demo-academic-1.key.json";
import type { ReadingTest } from "./content";
import {
  type AnswerKey,
  parseAnswerKey,
  parseReadingTest,
} from "./parse-content";

/** The original demo test (M4-11), parsed, for domain tests. */
export const demoTest: ReadingTest = (() => {
  const result = parseReadingTest(demo);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
})();

/** The demo test's answer key (M5-02), parsed, for domain tests. */
export const demoKey: AnswerKey = (() => {
  const result = parseAnswerKey(demoTest, demoKeyJson);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
})();

/** A valid session id for tests (ADR-0009 §3); `n` makes distinct ones. */
export function testSessionId(n = 1): string {
  return `s-00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}
