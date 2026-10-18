import { describe, expect, it } from "vitest";
import {
  MAX_ATTEMPTS_PER_TEST,
  UNKNOWN_FIRST_TRY,
  attemptFromSession,
  attemptsToRemove,
  firstTryOf,
  firstTryOnCommit,
  parseAttempt,
  parseFirstTry,
  parseResultRecord,
} from "./attempts";
import { fixtureTest } from "./listening-test.fixture";
import { parseListeningTest } from "./parse-content";
import { apply, startSession } from "./session";

const parsed = parseListeningTest(fixtureTest());
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
const test = parsed.value;
const T0 = 1_760_000_000_000;
const id = (n: number) =>
  `s-00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

/** An Exam that played Part 1 to 2.5 s, then failed and was finished without the rest. */
function interruptedExam() {
  let s = startSession(test, "exam", T0, id(1));
  s = apply(s, test, { type: "startRecording" }, T0 + 1000);
  s = apply(s, test, { type: "answer", number: 8, answer: "B" }, T0 + 1500);
  s = apply(s, test, { type: "played", part: 1, positionMs: 2500 }, T0 + 2600);
  s = apply(s, test, { type: "audioFailed" }, T0 + 2700);
  return apply(s, test, { type: "finish" }, T0 + 5700);
}

const stored = (record: object, schema: unknown = 1) =>
  structuredClone({ schema, ...record });

describe("a Listening attempt", () => {
  it("keeps an Exam's answers, timing and playback coverage, closing an open pause at the finish", () => {
    const attempt = attemptFromSession(interruptedExam(), T0 + 6000);
    expect(attempt).toMatchObject({
      id: id(1),
      kind: "test",
      mode: "exam",
      finishReason: "audioFailed",
      answers: { "8": "B" },
      exam: {
        recordingStartedAt: T0 + 1000,
        pausedMs: 3000,
        interruptions: 1,
        playedToMs: { "1": 2500 },
      },
      committedAt: T0 + 6000,
    });
  });

  it("leaves coverage unknown when the session recorded none, and is never made from a session in progress", () => {
    const practice = apply(
      startSession(test, "practice", T0, id(2)),
      test,
      { type: "finish" },
      T0 + 10,
    );
    expect(attemptFromSession(practice, T0 + 20)?.exam).toBeUndefined();
    expect(
      attemptFromSession(startSession(test, "exam", T0, id(3)), T0),
    ).toBeUndefined();
  });

  it("reads back as stored, and tells another schema apart from a broken record", () => {
    const attempt = attemptFromSession(interruptedExam(), T0 + 6000)!;
    expect(parseAttempt(stored(attempt), test)).toEqual({
      kind: "valid",
      value: attempt,
    });
    expect(parseAttempt(stored(attempt, 2), test)).toEqual({
      kind: "unknownSchema",
    });
    for (const broken of [
      { ...attempt, finishReason: "gaveUp" },
      { ...attempt, answers: { "8": "Z" } },
      { ...attempt, exam: { ...attempt.exam, playedToMs: { "1": 999_999 } } },
      { ...attempt, exam: undefined },
      { ...attempt, testId: "another-test" },
    ])
      expect(parseAttempt(stored(broken), test)).toEqual({ kind: "invalid" });
  });

  it("checks an attempt of an earlier content version for its shape only", () => {
    const attempt = attemptFromSession(interruptedExam(), T0 + 6000)!;
    const earlier = { ...attempt, testVersion: 2, answers: { "99": "X" } };
    expect(parseAttempt(stored(earlier), test).kind).toBe("valid");
  });
});

describe("a Listening result record", () => {
  const attempt = attemptFromSession(interruptedExam(), T0 + 6000)!;
  const outcomes = Object.fromEntries(
    Array.from({ length: 40 }, (_, i) => [
      String(i + 1),
      i === 7 ? "correct" : "unanswered",
    ]),
  );
  const record = {
    attemptId: attempt.id,
    keyRevision: 2,
    rulesVersion: 1,
    checkedAt: T0 + 7000,
    outcomes,
    signals: { "11": [{ code: "notReached" }] },
    score: { kind: "practiceRawScore", marks: 1, positions: 40 },
  };

  it("reads back with every position, a score that agrees and Listening signal codes", () => {
    expect(parseResultRecord(stored(record), attempt, test).kind).toBe("valid");
    for (const broken of [
      { ...record, score: { ...record.score, marks: 2 } },
      { ...record, signals: { "11": [{ code: "ngInsteadOfFalse" }] } },
      { ...record, outcomes: { ...outcomes, "41": "correct" } },
    ])
      expect(parseResultRecord(stored(broken), attempt, test)).toEqual({
        kind: "invalid",
      });
  });
});

describe("the first try of a Listening test", () => {
  const attempt = attemptFromSession(interruptedExam(), T0 + 6000)!;

  it("is the first committed attempt, unknown when others exist or the marker is unreadable", () => {
    expect(firstTryOnCommit(undefined, attempt, 0)).toBe(id(1));
    expect(firstTryOnCommit(undefined, attempt, 1)).toBe(UNKNOWN_FIRST_TRY);
    expect(firstTryOnCommit({ kind: "invalid" }, attempt, 0)).toBe(
      UNKNOWN_FIRST_TRY,
    );
    expect(
      firstTryOnCommit({ kind: "valid", value: id(9) }, attempt, 0),
    ).toBeUndefined();
  });

  it("reads as unknown when the marked attempt is gone", () => {
    expect(firstTryOf({ kind: "valid", value: id(9) }, [attempt])).toBe(
      UNKNOWN_FIRST_TRY,
    );
    expect(
      parseFirstTry(stored({ testId: test.id, firstTry: id(1) }), test.id),
    ).toEqual({
      kind: "valid",
      value: id(1),
    });
  });

  it("is never removed by retention, which keeps 20 attempts", () => {
    const attempts = Array.from(
      { length: MAX_ATTEMPTS_PER_TEST + 2 },
      (_, i) => ({
        ...attempt,
        id: id(i + 1),
        startedAt: T0 + i,
      }),
    );
    expect(attemptsToRemove(attempts, id(1))).toEqual([id(2), id(3)]);
    expect(attemptsToRemove(attempts.slice(0, 20), id(1))).toEqual([]);
  });
});
