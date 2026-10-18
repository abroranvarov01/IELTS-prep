import { describe, expect, it } from "vitest";
import type { ListeningAttempt, ResultRecord } from "./attempts";
import { fixtureTest } from "./listening-test.fixture";
import { parseListeningTest } from "./parse-content";
import { retryQuestions, validateRetry } from "./retry";

const parsed = parseListeningTest(fixtureTest());
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
const test = parsed.value;
const SOURCE = "s-00000000-0000-4000-8000-000000000001";

const source = (changes: Partial<ListeningAttempt> = {}): ListeningAttempt => ({
  id: SOURCE,
  testId: test.id,
  testVersion: test.version,
  kind: "test",
  mode: "practice",
  startedAt: 1,
  finishedAt: 2,
  finishReason: "user",
  answers: {},
  committedAt: 3,
  ...changes,
});

/** Every position correct except 2 (incorrect), 5 (unanswered) and 38 (half of the List TWO question 37–38). */
function record(): ResultRecord {
  const outcomes: ResultRecord["outcomes"] = {};
  for (let n = 1; n <= 40; n++) outcomes[n] = "correct";
  outcomes[2] = "incorrect";
  outcomes[5] = "unanswered";
  outcomes[38] = "incorrect";
  return {
    attemptId: SOURCE,
    keyRevision: 1,
    rulesVersion: 1,
    checkedAt: 4,
    outcomes,
    signals: {},
    score: { kind: "practiceRawScore", marks: 37, positions: 40 },
  };
}

describe("Listening questions to try again", () => {
  it("are the units not fully correct or unanswered, whole", () => {
    expect(retryQuestions(test, record())).toEqual([2, 5, 37, 38]);
  });

  it("start from an address of those units, expanded to whole units", () => {
    expect(validateRetry(test, source(), record(), "38,2")).toEqual({
      ok: true,
      questions: [2, 37, 38],
    });
  });

  it("refuse a missing source, an earlier content version, a retry as the source, and questions it got right", () => {
    const r = record();
    expect(validateRetry(test, undefined, r, "2")).toEqual({
      ok: false,
      problem: "sourceMissing",
    });
    expect(
      validateRetry(test, source({ testVersion: 2 }), r, "2"),
    ).toMatchObject({ problem: "sourceOldVersion" });
    expect(
      validateRetry(test, source({ kind: "retry" }), r, "2"),
    ).toMatchObject({ problem: "notAllowed" });
    for (const q of ["1", "2,1", "2,", "abc", "99", null])
      expect(validateRetry(test, source(), r, q)).toMatchObject({
        problem: "notAllowed",
      });
  });
});
