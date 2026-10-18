import { describe, expect, it } from "vitest";
import type { ListeningAttempt, ResultRecord } from "./attempts";
import type { KeyEntry, ListeningKey } from "./content";
import {
  fixtureKey,
  fixtureTest,
  fixtureTranscript,
} from "./listening-test.fixture";
import {
  parseListeningKey,
  parseListeningTest,
  parseTranscript,
} from "./parse-content";
import { patternsView, repeatedMistakes } from "./patterns";
import type { Signal } from "./scoring";

function parsed<T>(
  result: { ok: true; value: T } | { ok: false; errors: string[] },
): T {
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
}
const test = parsed(parseListeningTest(fixtureTest()));
const transcript = parsed(parseTranscript(test, fixtureTranscript()));
const baseKey = parsed(parseListeningKey(test, transcript, fixtureKey()));

function keyWith(changes: Record<number, Partial<KeyEntry>> = {}) {
  const key: ListeningKey = structuredClone(baseKey);
  for (const [n, change] of Object.entries(changes))
    Object.assign(key.answers[Number(n)] ?? {}, change);
  return key;
}

// Typed fixture questions by group: form 1–4, table 11–14, sentences 27–30,
// diagram 31–33, short answers 36, 37–38 (one unit), 39, 40.
function record(
  incorrect: number[],
  signals: Record<number, Signal["code"][]> = {},
): ResultRecord {
  const outcomes: ResultRecord["outcomes"] = {};
  for (let n = 1; n <= 40; n++)
    outcomes[n] = incorrect.includes(n) ? "incorrect" : "correct";
  return {
    attemptId: "s-00000000-0000-4000-8000-000000000001",
    keyRevision: 1,
    rulesVersion: 1,
    checkedAt: 1,
    outcomes,
    signals: Object.fromEntries(
      Object.entries(signals).map(([n, codes]) => [
        n,
        codes.map((code) => ({ code })),
      ]),
    ),
    score: {
      kind: "practiceRawScore",
      marks: 40 - incorrect.length,
      positions: 40,
    },
  };
}
const spelling = (numbers: number[]) =>
  record(
    numbers,
    Object.fromEntries(numbers.map((n) => [n, ["oneLetterAway"]])),
  );

describe("repeated Listening mistakes (a heuristic, LD15)", () => {
  it("need at least 3 answer units", () => {
    expect(repeatedMistakes(test, baseKey, spelling([1, 11]))).toEqual([]);
    expect(
      repeatedMistakes(test, baseKey, spelling([1, 2, 11])).map((p) => [
        p.category,
        p.units.map((u) => u.key),
      ]),
    ).toEqual([["oneLetterAway", ["1", "2", "11"]]]);
  });

  it("need at least 2 question groups", () => {
    expect(repeatedMistakes(test, baseKey, spelling([1, 2, 3, 4]))).toEqual([]);
    expect(
      repeatedMistakes(test, baseKey, spelling([1, 2, 3, 11])),
    ).toHaveLength(1);
  });

  it("count its opportunities: answered typed units only", () => {
    const all = repeatedMistakes(test, baseKey, spelling([1, 2, 11]))[0];
    const fewer = spelling([1, 2, 11]);
    fewer.outcomes[27] = "unanswered";
    expect(all?.total).toBeGreaterThan(3);
    expect(repeatedMistakes(test, baseKey, fewer)[0]?.total).toBe(
      (all?.total ?? 0) - 1,
    );
  });

  it("count a List TWO question once, and leave unanswered units out", () => {
    const r = spelling([1, 37, 38, 11]);
    expect(
      repeatedMistakes(test, baseKey, r)[0]?.units.map((u) => u.key),
    ).toEqual(["1", "11", "37"]);
    const blank = record([1, 11, 12]);
    blank.outcomes[27] = "unanswered";
    blank.signals = {
      "1": [{ code: "wordLimit" }],
      "11": [{ code: "wordLimit" }],
      "12": [{ code: "wordLimit" }],
      "27": [{ code: "wordLimit" }],
    };
    expect(
      repeatedMistakes(test, baseKey, blank)[0]?.units.map((u) => u.key),
    ).toEqual(["1", "11", "12"]);
  });

  it("count numbers by the key: answers with a digit that were not correct", () => {
    const key = keyWith({
      1: { accept: ["12"] },
      2: { accept: ["3:30"] },
      11: { accept: ["5 pm"] },
    });
    const [pattern] = repeatedMistakes(test, key, record([1, 2, 11]));
    expect(pattern).toMatchObject({ category: "numbers", total: 3 });
  });

  it("count a content tag only where it is tagged, and a mentioned option only where a verified entry exists", () => {
    const tagged = keyWith({
      8: { tag: "correction" },
      9: { tag: "correction" },
      23: { tag: "correction" },
    });
    expect(
      repeatedMistakes(test, tagged, record([8, 9, 23]))[0]?.category,
    ).toBe("correction");
    const said = { segment: "p1-s2", quote: "right here" };
    const draft = keyWith({
      8: { distractors: [{ option: "B", ...said, review: "aiDraft" }] },
      9: { distractors: [{ option: "A", ...said, review: "aiDraft" }] },
      23: { distractors: [{ option: "B", ...said, review: "aiDraft" }] },
    });
    const mentioned = record([8, 9, 23], {
      8: ["mentionedOption"],
      9: ["mentionedOption"],
      23: ["mentionedOption"],
    });
    expect(repeatedMistakes(test, draft, mentioned)).toEqual([]);
  });

  it("show at most two, most units first, ties in the categories' order", () => {
    const r = record([1, 2, 11, 12, 27], {
      1: ["oneLetterAway", "wordLimit"],
      2: ["oneLetterAway", "wordLimit"],
      11: ["oneLetterAway", "wordLimit", "notInTranscript"],
      12: ["wordLimit"],
      27: ["notInTranscript"],
    });
    expect(repeatedMistakes(test, baseKey, r).map((p) => p.category)).toEqual([
      "wordLimit",
      "oneLetterAway",
    ]);
  });
});

describe("the repeated-mistakes view", () => {
  const attempt = (id: string, testVersion = 1): ListeningAttempt => ({
    id,
    testId: test.id,
    testVersion,
    kind: "test",
    mode: "practice",
    startedAt: 1,
    finishedAt: 2,
    finishReason: "user",
    answers: {},
    committedAt: 3,
  });
  const first = "s-00000000-0000-4000-8000-000000000001";
  const later = "s-00000000-0000-4000-8000-000000000002";

  it("looks for nothing when the first try is unknown, or from an earlier content version", () => {
    expect(patternsView(test, baseKey, later, undefined)).toEqual({
      kind: "unknownFirstTry",
    });
    expect(
      patternsView(test, baseKey, later, {
        attempt: attempt(first, 2),
        record: record([]),
      }),
    ).toEqual({ kind: "unavailable" });
  });

  it("says whether the shown attempt is the first try itself", () => {
    expect(
      patternsView(test, baseKey, first, {
        attempt: attempt(first),
        record: record([]),
      }),
    ).toMatchObject({ kind: "patterns", scope: "thisTry", patterns: [] });
    expect(
      patternsView(test, baseKey, later, {
        attempt: attempt(first),
        record: record([]),
      }),
    ).toMatchObject({ scope: "firstTry", firstTryId: first });
  });
});
