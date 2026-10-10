import demo from "../../../content/reading/demo-academic-1.json";
import type { ReadingTest } from "./content";
import { parseReadingTest } from "./parse-content";

/** The original demo test (M4-11), parsed, for domain tests. */
export const demoTest: ReadingTest = (() => {
  const result = parseReadingTest(demo);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
})();
