import { describe, expect, it } from "vitest";
import type { ReadingAttempt, ResultRecord } from "./attempts";
import { demoKey, demoTest as test } from "./demo-test.fixture";
import { retryQuestions, validateRetry } from "./retry";
import { SCORING_RULES_VERSION, checkAttempt } from "./scoring";
import {
  answeredNumbers,
  apply,
  sessionNumbers,
  startSession,
} from "./session";

const ID = "s-00000000-0000-4000-8000-000000000001";

/** Every answer correct except 2 (TRUE; the key says FALSE) and 22–23 (A, B), the rest of 1–5 only. */
function sourceAttempt(extra: Partial<ReadingAttempt> = {}): ReadingAttempt {
  return {
    id: ID,
    testId: test.id,
    testVersion: test.version,
    kind: "test",
    mode: "exam",
    startedAt: 1,
    finishedAt: 2,
    finishReason: "user",
    answers: Object.fromEntries(
      Object.entries(demoKey.answers)
        .filter(([n]) => n !== "23")
        .map(([n, entry]) => [
          n,
          n === "2" ? "TRUE" : n === "22" ? ["A", "B"] : entry.accept[0],
        ]),
    ) as ReadingAttempt["answers"],
    pins: {},
    committedAt: 3,
    ...extra,
  };
}

function recordOf(attempt: ReadingAttempt): ResultRecord {
  return {
    attemptId: attempt.id,
    keyRevision: demoKey.revision,
    rulesVersion: SCORING_RULES_VERSION,
    checkedAt: 4,
    ...checkAttempt(test, demoKey, attempt),
  };
}

const source = sourceAttempt();
const record = recordOf(source);

describe("retryQuestions", () => {
  it("lists every unit not fully correct, whole and once: 22–23 counts 2 positions even with a mark", () => {
    expect(retryQuestions(test, source, record)).toEqual([2, 22, 23]);
  });

  it("includes unanswered units", () => {
    const answers = { ...source.answers };
    delete answers["7"];
    const missing = sourceAttempt({ answers });
    expect(retryQuestions(test, missing, recordOf(missing))).toEqual([
      2, 7, 22, 23,
    ]);
  });
});

describe("validateRetry", () => {
  it("expands the requested numbers to whole units, each once", () => {
    expect(validateRetry(test, source, record, "23,2")).toEqual({
      ok: true,
      questions: [2, 22, 23],
    });
    expect(validateRetry(test, source, record, "22,23,22")).toEqual({
      ok: true,
      questions: [22, 23],
    });
  });

  it("refuses a source that is not on the device", () => {
    expect(validateRetry(test, undefined, undefined, "2")).toEqual({
      ok: false,
      problem: "sourceMissing",
    });
  });

  it("refuses a source from an earlier content version", () => {
    const older = sourceAttempt({ testVersion: test.version - 1 });
    expect(validateRetry(test, older, record, "2")).toEqual({
      ok: false,
      problem: "sourceOldVersion",
    });
  });

  it("refuses questions the source got fully correct, unknown numbers and no numbers", () => {
    for (const q of ["1", "2,1", "41", "x", "2,", "", null])
      expect(validateRetry(test, source, record, q)).toEqual({
        ok: false,
        problem: "notAllowed",
      });
  });

  it("refuses a retry of a retry", () => {
    const retry = sourceAttempt({ kind: "retry", retryOf: ID, questions: [2] });
    expect(validateRetry(test, retry, record, "2").ok).toBe(false);
  });
});

describe("a retry session", () => {
  const retry = startSession(test, "practice", 10, ID, {
    of: "s-00000000-0000-4000-8000-000000000009",
    questions: [22, 23, 30],
  });

  it("starts in Practice at its first question, on its passage, with every answer empty", () => {
    expect(retry).toMatchObject({
      mode: "practice",
      currentQuestion: 22,
      answers: {},
      view: { passage: 2 },
      retry: { questions: [22, 23, 30] },
    });
    expect(sessionNumbers(retry)).toEqual([22, 23, 30]);
  });

  it("moves, answers and pins only within its units", () => {
    for (const event of [
      { type: "goTo", number: 1 },
      { type: "answer", number: 1, answer: "TRUE" },
      { type: "toggleFlag", number: 5 },
      { type: "pin", number: 3, sentenceId: "p1-2-s2" },
    ] as const)
      expect(apply(retry, test, event, 11)).toBe(retry);

    const answered = apply(
      apply(retry, test, { type: "answer", number: 23, answer: ["A"] }, 11),
      test,
      { type: "goTo", number: 30 },
      12,
    );
    expect(answered.answers).toEqual({ "22": ["A"] });
    expect(answered.currentQuestion).toBe(30);
    expect([...answeredNumbers(answered, test)]).toEqual([22]);
  });

  it("a test session keeps all 40 questions", () => {
    expect(sessionNumbers(startSession(test, "exam", 1, ID))).toHaveLength(40);
  });
});
