import { describe, expect, it } from "vitest";
import {
  LEVEL_RULES_VERSION,
  type ScoredPosition,
  levelCheckResult,
} from "./level";

// Form A's shape: 14 positions in four types (LEVEL_CHECK.md §3).
const TYPES = [
  ...Array<string>(4).fill("trueFalseNotGiven"),
  ...Array<string>(3).fill("sentenceCompletion"),
  ...Array<string>(4).fill("matchingHeadings"),
  ...Array<string>(3).fill("multipleChoice"),
];

/** The first `correct` positions correct, the next `wrong` incorrect, the rest unanswered. */
function form(correct: number, wrong = 14 - correct): ScoredPosition[] {
  return TYPES.map((type, i) => ({
    number: i + 1,
    type,
    outcome:
      i < correct
        ? "correct"
        : i < correct + wrong
          ? "incorrect"
          : "unanswered",
  }));
}

describe("levelCheckResult", () => {
  it("records the rules version 1", () => {
    expect(LEVEL_RULES_VERSION).toBe(1);
  });

  it("counts the score, the total and the answered positions, and never a band", () => {
    const result = levelCheckResult(form(9, 3));
    expect(result).toMatchObject({
      kind: "levelCheckResult",
      score: 9,
      total: 14,
      answered: 12,
    });
    expect(Object.keys(result)).not.toContain("band");
  });

  it.each([
    [0, 1],
    [6, 1],
    [7, 2],
    [10, 2],
    [11, 3],
    [14, 3],
  ])(
    "gives %i of 14 correct the level %i (0–6, 7–10, 11–14)",
    (correct, level) => {
      expect(levelCheckResult(form(correct)).level).toBe(level);
    },
  );

  it("rounds the thresholds up for other form sizes (half and three quarters)", () => {
    const ten = (correct: number) =>
      levelCheckResult(
        Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          type: "trueFalseNotGiven",
          outcome: i < correct ? "correct" : "incorrect",
        })),
      ).level;
    expect(ten(4)).toBe(1);
    expect(ten(5)).toBe(2);
    expect(ten(7)).toBe(2);
    expect(ten(8)).toBe(3);
  });

  it("is insufficient when more than half of the positions had no answer, with no level and nothing to practise first", () => {
    const eightUnanswered = levelCheckResult(form(6, 0));
    expect(eightUnanswered).toMatchObject({
      answered: 6,
      level: "insufficient",
      practiseFirst: [],
    });
    const sevenUnanswered = levelCheckResult(form(7, 0));
    expect(sevenUnanswered.level).toBe(2);
  });

  it("suggests the types with at least three positions and at least half not correct, the largest share first, at most two", () => {
    // TFNG 4 of 4 wrong, sentence completion 2 of 3 wrong, headings 1 of 4
    // wrong, multiple choice all correct.
    const positions = form(14, 0).map((p, i) => ({
      ...p,
      outcome: [0, 1, 2, 3, 4, 5, 7].includes(i)
        ? ("incorrect" as const)
        : ("correct" as const),
    }));
    expect(levelCheckResult(positions).practiseFirst).toEqual([
      "trueFalseNotGiven",
      "sentenceCompletion",
    ]);
  });

  it("counts an unanswered position as not correct and breaks ties by the first position", () => {
    // Sentence completion (5–7) and multiple choice (12–14): 2 of 3 each.
    const positions = form(14, 0).map((p, i) => ({
      ...p,
      outcome:
        i === 4 || i === 11
          ? ("incorrect" as const)
          : i === 5 || i === 12
            ? ("unanswered" as const)
            : ("correct" as const),
    }));
    expect(levelCheckResult(positions).practiseFirst).toEqual([
      "sentenceCompletion",
      "multipleChoice",
    ]);
  });

  it("never suggests a type with fewer than three positions, or with less than half missed", () => {
    const positions: ScoredPosition[] = [
      { number: 1, type: "shortAnswer", outcome: "incorrect" },
      { number: 2, type: "shortAnswer", outcome: "incorrect" },
      { number: 3, type: "trueFalseNotGiven", outcome: "incorrect" },
      { number: 4, type: "trueFalseNotGiven", outcome: "correct" },
      { number: 5, type: "trueFalseNotGiven", outcome: "correct" },
      { number: 6, type: "matchingHeadings", outcome: "correct" },
    ];
    expect(levelCheckResult(positions).practiseFirst).toEqual([]);
  });

  it("suggests nothing when every answer is correct", () => {
    expect(levelCheckResult(form(14)).practiseFirst).toEqual([]);
  });
});
