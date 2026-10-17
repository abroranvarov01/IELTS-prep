import { describe, expect, it } from "vitest";
import type { ReadingAttempt, ResultRecord } from "./attempts";
import { demoKey as key, demoTest as test } from "./demo-test.fixture";
import { patternsView, repeatedMistakes } from "./patterns";
import { SCORING_RULES_VERSION, checkAttempt } from "./scoring";

// Demo groups: p1-g1 TRUE/FALSE/NOT GIVEN 1–4 (keys TRUE, FALSE, NOT GIVEN,
// FALSE); p3-g1 YES/NO/NOT GIVEN 28–31 (NO, YES, NOT GIVEN, YES); typed
// p1-g3 7–9, p1-g4 10–11, p1-g5 12–13, p2-g4 24–27; 22–23 "choose two" (A, C).

function attempt(
  answers: ReadingAttempt["answers"],
  extra: Partial<ReadingAttempt> = {},
): ReadingAttempt {
  return {
    id: "s-00000000-0000-4000-8000-000000000001",
    testId: test.id,
    testVersion: test.version,
    kind: "test",
    mode: "practice",
    startedAt: 1,
    finishedAt: 2,
    finishReason: "user",
    answers,
    pins: {},
    committedAt: 3,
    ...extra,
  };
}

function recordOf(shown: ReadingAttempt): ResultRecord {
  return {
    attemptId: shown.id,
    keyRevision: key.revision,
    rulesVersion: SCORING_RULES_VERSION,
    checkedAt: 4,
    ...checkAttempt(test, key, shown),
  };
}

function patternsOf(shown: ReadingAttempt) {
  return repeatedMistakes(test, key, shown, recordOf(shown)).map((p) => ({
    category: p.category,
    numbers: p.units.map((u) => u.numbers),
    total: p.total,
  }));
}

describe("repeatedMistakes", () => {
  it("shows a category seen in 3 units of 2 groups, out of its answered opportunities", () => {
    expect(
      patternsOf(
        attempt({ "2": "NOT GIVEN", "4": "NOT GIVEN", "28": "NOT GIVEN" }),
      ),
    ).toContainEqual({
      category: "ngFalse",
      numbers: [[2], [4], [28]],
      // Unanswered questions (3, 30) are no opportunity.
      total: 3,
    });
  });

  it("needs 3 units: 2 are not enough", () => {
    expect(
      patternsOf(attempt({ "2": "NOT GIVEN", "28": "NOT GIVEN" })),
    ).toEqual([]);
  });

  it("needs 2 groups: 3 units of one group are not enough", () => {
    expect(
      patternsOf(attempt({ "2": "NOT GIVEN", "3": "FALSE", "4": "NOT GIVEN" })),
    ).toEqual([]);
  });

  it("counts both sides of NOT GIVEN against FALSE or NO, in the writer's views too", () => {
    expect(
      patternsOf(attempt({ "2": "NOT GIVEN", "3": "FALSE", "30": "NO" }))[0],
    ).toEqual({ category: "ngFalse", numbers: [[2], [3], [30]], total: 3 });
  });

  it("counts a 'choose two' item once, as one unit", () => {
    // Tagged paraphrase: 14 (iii; key ii), 19 (A; key D), 22–23 partly correct.
    expect(
      patternsOf(attempt({ "14": "iii", "19": "A", "22": ["A", "B"] })),
    ).toEqual([
      { category: "paraphrase", numbers: [[14], [19], [22, 23]], total: 3 },
    ]);
  });

  it("orders by units, ties in the categories' order, and shows at most two", () => {
    // One letter away and not from the passage in 11, 12, 24, 25 (4 each);
    // NOT GIVEN mixed up with FALSE in 2, 4, 28 (3).
    const shown = patternsOf(
      attempt({
        "11": "pavments",
        "12": "baskts",
        "24": "strengthend",
        "25": "waterprof",
        "2": "NOT GIVEN",
        "4": "NOT GIVEN",
        "28": "NOT GIVEN",
      }),
    );
    expect(shown.map((p) => p.category)).toEqual([
      "oneLetterAway",
      "notFromPassage",
    ]);
  });

  it("breaks a tie of equal counts in the categories' order", () => {
    // 28 is tagged paraphrase: NOT GIVEN for NO counts in both categories.
    const shown = patternsOf(
      attempt({
        "2": "NOT GIVEN",
        "4": "NOT GIVEN",
        "28": "NOT GIVEN",
        "14": "iii",
        "19": "A",
      }),
    );
    expect(shown.map((p) => [p.category, p.numbers.length])).toEqual([
      ["ngFalse", 3],
      ["paraphrase", 3],
    ]);
  });

  it("counts pins that differ from the cited evidence only in Practice", () => {
    const answers = { "5": "A", "6": "A", "32": "A" };
    const pins = { "5": ["p1-3-s2"], "6": ["p1-3-s2"], "32": ["p3-1-s2"] };
    expect(patternsOf(attempt(answers, { pins }))).toContainEqual({
      category: "pins",
      numbers: [[5], [6], [32]],
      total: 3,
    });
    expect(
      patternsOf(attempt(answers, { pins, mode: "exam" })).map(
        (p) => p.category,
      ),
    ).not.toContain("pins");
  });

  it("finds nothing in unanswered questions, even after a time-out", () => {
    expect(patternsOf(attempt({}, { finishReason: "timeUp" }))).toEqual([]);
  });
});

describe("patternsView", () => {
  const first = attempt({
    "2": "NOT GIVEN",
    "4": "NOT GIVEN",
    "28": "NOT GIVEN",
  });
  const later = attempt({}, { id: "s-00000000-0000-4000-8000-000000000002" });

  it("looks for nothing when the first try is unknown", () => {
    expect(patternsView(test, key, later.id, undefined)).toEqual({
      kind: "unknownFirstTry",
    });
  });

  it("is unavailable when the first try is of an earlier content version", () => {
    expect(
      patternsView(test, key, later.id, {
        attempt: { ...first, testVersion: test.version - 1 },
      }),
    ).toEqual({ kind: "unavailable" });
  });

  it("uses the first try only: a later attempt shows the first try's patterns, scoped to it", () => {
    const view = patternsView(test, key, later.id, {
      attempt: first,
      record: recordOf(first),
    });
    expect(view).toMatchObject({
      kind: "patterns",
      scope: "firstTry",
      firstTryId: first.id,
      patterns: [{ category: "ngFalse" }],
    });
  });

  it("is scoped to this attempt when it is the first try", () => {
    expect(
      patternsView(test, key, first.id, {
        attempt: first,
        record: recordOf(first),
      }),
    ).toMatchObject({ kind: "patterns", scope: "thisTry" });
  });
});
