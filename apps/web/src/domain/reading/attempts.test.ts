import { describe, expect, it } from "vitest";
import {
  type ReadingAttempt,
  type ResultRecord,
  UNKNOWN_FIRST_TRY,
  attemptFromSession,
  attemptsToRemove,
  firstTryOf,
  firstTryOnCommit,
  parseAttempt,
  parseFirstTry,
  parseResultRecord,
} from "./attempts";
import { demoKey, demoTest as test, testSessionId } from "./demo-test.fixture";
import { checkAttempt } from "./scoring";
import { apply, startSession } from "./session";

const T0 = Date.UTC(2026, 9, 11, 9, 0);

function finishedSession(n = 1) {
  let s = startSession(test, "practice", T0 + n, testSessionId(n));
  s = apply(s, test, { type: "answer", number: 1, answer: "TRUE" }, T0 + n);
  s = apply(s, test, { type: "toggleHighlight", sentenceId: "p1-1-s2" }, T0);
  s = apply(s, test, { type: "pin", number: 1, sentenceId: "p1-1-s2" }, T0);
  return apply(s, test, { type: "finish" }, T0 + 60_000);
}

function attempt(n = 1): ReadingAttempt {
  const a = attemptFromSession(finishedSession(n), T0 + 61_000);
  if (!a) throw new Error("not finished");
  return a;
}

/** As IndexedDB stores it: a structured clone with the schema. */
const stored = (record: object, schema: unknown = 1) =>
  structuredClone({ schema, ...record });

describe("an attempt made from a finished session", () => {
  it("keeps the answers, pins, highlights and timestamps, and the session's id", () => {
    const a = attempt();
    expect(a).toMatchObject({
      id: testSessionId(1),
      kind: "test",
      mode: "practice",
      startedAt: T0 + 1,
      finishedAt: T0 + 60_000,
      finishReason: "user",
      answers: { "1": "TRUE" },
      pins: { "1": ["p1-1-s2"] },
      highlights: ["p1-1-s2"],
      committedAt: T0 + 61_000,
    });
    expect(a.importedFromM4).toBeUndefined();
  });

  it("is a retry when the session retries questions of an attempt", () => {
    const retry = attemptFromSession(
      {
        ...finishedSession(2),
        retry: { of: testSessionId(1), questions: [22, 23] },
      },
      T0,
    );
    expect(retry).toMatchObject({
      kind: "retry",
      retryOf: testSessionId(1),
      questions: [22, 23],
    });
  });

  it("does not exist for a session still in progress", () => {
    expect(
      attemptFromSession(startSession(test, "exam", T0, testSessionId()), T0),
    ).toBeUndefined();
  });
});

describe("reading a stored attempt", () => {
  it("reads back what was stored", () => {
    const a = attempt();
    expect(parseAttempt(stored(a), test)).toEqual({ kind: "valid", value: a });
  });

  it("keeps an absent highlights field absent ('not recorded'), never inventing an empty list", () => {
    const withoutHighlights: Partial<ReadingAttempt> = attempt();
    delete withoutHighlights.highlights;
    const parsed = parseAttempt(stored(withoutHighlights), test);
    expect(parsed.kind === "valid" && "highlights" in parsed.value).toBe(false);
  });

  it("tells a record of another schema apart from a broken one", () => {
    expect(parseAttempt(stored(attempt(), 2), test)).toEqual({
      kind: "unknownSchema",
    });
    expect(parseAttempt({ ...attempt() }, test)).toEqual({ kind: "invalid" });
    expect(
      parseAttempt(stored({ ...attempt(), id: "1760000000" }), test),
    ).toEqual({ kind: "invalid" });
  });

  it("rejects answers, pins or highlights that do not fit the current content", () => {
    const bad = [
      { answers: { "1": "MAYBE" } },
      { answers: { "23": ["A"] } },
      { pins: { "1": ["p3-1-s1"] } },
      { highlights: ["no-such-sentence"] },
      { mode: "exam" },
    ];
    for (const change of bad)
      expect(parseAttempt(stored({ ...attempt(), ...change }), test)).toEqual({
        kind: "invalid",
      });
  });

  it("checks only the shape of an attempt of an earlier content version", () => {
    const old = { ...attempt(), testVersion: 0.5 };
    expect(parseAttempt(stored(old), test).kind).toBe("invalid");
    const earlier = {
      ...attempt(),
      testVersion: 2,
      answers: { "99": "anything" },
    };
    expect(parseAttempt(stored(earlier), test).kind).toBe("valid");
  });

  it("needs a retry to cover whole answer units", () => {
    const retry = {
      ...attempt(2),
      kind: "retry",
      retryOf: testSessionId(1),
      questions: [22],
    };
    expect(parseAttempt(stored(retry), test).kind).toBe("invalid");
    expect(
      parseAttempt(stored({ ...retry, questions: [22, 23] }), test).kind,
    ).toBe("valid");
  });
});

describe("reading a stored result record", () => {
  const a = attempt();
  const record = (): ResultRecord => ({
    attemptId: a.id,
    keyRevision: 1,
    rulesVersion: 1,
    checkedAt: T0,
    ...checkAttempt(test, demoKey, a),
  });

  it("reads back a record consistent with its attempt", () => {
    expect(parseResultRecord(stored(record()), a)).toEqual({
      kind: "valid",
      value: record(),
    });
  });

  it("rejects a record of another attempt, or whose outcomes disagree with its score or positions", () => {
    const r = record();
    const wrong = [
      { attemptId: testSessionId(9) },
      { score: { ...r.score, marks: r.score.marks + 1 } },
      { outcomes: { ...r.outcomes, 41: "correct" } },
      { signals: { "1": [{ code: "guessed" }] } },
      { signals: { "1": [{ code: "falseInsteadOfNg" }] } },
      { keyRevision: 0 },
    ];
    for (const change of wrong)
      expect(parseResultRecord(stored({ ...r, ...change }), a).kind).toBe(
        "invalid",
      );
    expect(parseResultRecord(stored(r, 3), a).kind).toBe("unknownSchema");
  });
});

describe("the first-try marker", () => {
  const first = attempt(1);

  it("is decided by the first test attempt when no other attempt exists", () => {
    expect(firstTryOnCommit(undefined, first, 0)).toBe(first.id);
    expect(firstTryOnCommit(undefined, first, 1)).toBe(UNKNOWN_FIRST_TRY);
  });

  it("is never changed by a later attempt or decided by a retry", () => {
    const marker = parseFirstTry(
      stored({ testId: test.id, firstTry: first.id }),
      test.id,
    );
    expect(firstTryOnCommit(marker, attempt(2), 1)).toBeUndefined();
    const retry = { ...attempt(3), kind: "retry" as const };
    expect(firstTryOnCommit(undefined, retry, 0)).toBeUndefined();
  });

  it("becomes unknown when the stored marker cannot be read, and is left alone under another schema", () => {
    expect(firstTryOnCommit({ kind: "invalid" }, first, 0)).toBe(
      UNKNOWN_FIRST_TRY,
    );
    expect(
      firstTryOnCommit({ kind: "unknownSchema" }, first, 0),
    ).toBeUndefined();
  });

  it("reads as unknown when it names an attempt that is missing", () => {
    const marker = parseFirstTry(
      stored({ testId: test.id, firstTry: first.id }),
      test.id,
    );
    expect(firstTryOf(marker, [first])).toBe(first.id);
    expect(firstTryOf(marker, [attempt(2)])).toBe(UNKNOWN_FIRST_TRY);
    expect(firstTryOf(undefined, [])).toBeUndefined();
    expect(firstTryOf(undefined, [first])).toBe(UNKNOWN_FIRST_TRY);
    expect(firstTryOf({ kind: "unknownSchema" }, [first])).toBe(
      UNKNOWN_FIRST_TRY,
    );
  });
});

describe("retention", () => {
  it("removes the oldest attempts beyond 20, never the first try", () => {
    const attempts = Array.from({ length: 22 }, (_, i) => attempt(i + 1));
    const firstTry = attempts[0]?.id;
    expect(attemptsToRemove(attempts, firstTry)).toEqual([
      attempts[1]?.id,
      attempts[2]?.id,
    ]);
    expect(attemptsToRemove(attempts.slice(0, 20), firstTry)).toEqual([]);
  });
});
