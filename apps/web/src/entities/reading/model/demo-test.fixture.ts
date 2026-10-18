import demo from "../../../../content/reading/demo-academic-1.json";
import demoKeyJson from "../../../../content/reading/demo-academic-1.key.json";
import demo2 from "../../../../content/reading/demo-academic-2.json";
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

/**
 * The demo test with its notes group (questions 7–9) as a table on the
 * shared layout (M8-17), same gaps and key: a fixture for table completion.
 */
export function demoTestWithTable(): ReadingTest {
  const json = structuredClone(demo) as unknown as {
    passages: { questionGroups: Record<string, unknown>[] }[];
  };
  json.passages[0]!.questionGroups[2] = {
    id: "p1-g3",
    type: "tableCompletion",
    instruction:
      "Complete the table below. Choose ONE WORD ONLY from the passage for each answer.",
    wordLimit: { words: 1, numbers: false },
    title: "Shared bicycles",
    columns: ["Step", "What to do"],
    rowHeaders: true,
    rows: [
      {
        cells: [
          [{ text: "Start" }],
          [{ text: "Unlock it with a " }, { gap: 7 }],
        ],
      },
      {
        cells: [
          [{ text: "Finish" }],
          [{ text: "Leave it at a marked " }, { gap: 8 }],
        ],
      },
      { cells: [[{ text: "Benefit" }], [{ text: "Cleaner " }, { gap: 9 }]] },
    ],
  };
  const result = parseReadingTest(json);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
}

/** The demo test with questions 7–9 as a flow chart on the shared layout (M8-18). */
export function demoTestWithFlowChart(): ReadingTest {
  const json = structuredClone(demo) as unknown as {
    passages: { questionGroups: Record<string, unknown>[] }[];
  };
  json.passages[0]!.questionGroups[2] = {
    id: "p1-g3",
    type: "flowChartCompletion",
    instruction:
      "Complete the flow chart below. Choose ONE WORD ONLY from the passage for each answer.",
    wordLimit: { words: 1, numbers: false },
    title: "A shared-bicycle trip",
    steps: [
      [[{ text: "Unlock the bicycle with a " }, { gap: 7 }]],
      [[{ text: "Leave it at any marked " }, { gap: 8 }]],
      [[{ text: "Result: cleaner " }, { gap: 9 }]],
    ],
  };
  const result = parseReadingTest(json);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
}

/** Demo Reading Test 2 (M8-19): the table, flow-chart and diagram layouts. */
export const demoTest2: ReadingTest = (() => {
  const result = parseReadingTest(demo2);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
})();
