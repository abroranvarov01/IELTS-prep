import { describe, expect, it } from "vitest";
import {
  type FinishedSection,
  HISTORY_SCHEMA,
  type LevelCheckAttempt,
  type LevelCheckResultRecord,
  attemptFromSection,
  attemptsToRemove,
  latestAttempt,
  parseLevelCheckAttempt,
  parseLevelCheckResultRecord,
} from "./records";

const T0 = Date.UTC(2026, 9, 18, 9, 0);
const id = (n: number) =>
  `s-00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

function section(n: number, overrides: Partial<FinishedSection> = {}) {
  return {
    id: id(n),
    skill: "reading" as const,
    formId: "level-check-reading-a",
    formVersion: 1,
    startedAt: T0 + n * 1000,
    finishedAt: T0 + n * 1000 + 600_000,
    answers: { "1": "TRUE", "5": "appliance", "8": "ii" },
    ...overrides,
  };
}

const attempt = (n: number, overrides: Partial<FinishedSection> = {}) =>
  attemptFromSection(section(n, overrides), T0 + 999_999);

function record(a: LevelCheckAttempt): LevelCheckResultRecord {
  return {
    attemptId: a.id,
    keyRevision: 1,
    rulesVersion: 1,
    levelRulesVersion: 1,
    checkedAt: T0 + 1_000_000,
    outcomes: { 1: "correct", 2: "incorrect", 3: "unanswered" },
    score: 1,
    total: 3,
    answered: 2,
    level: 1,
    practiseFirst: ["trueFalseNotGiven"],
  };
}

describe("attemptFromSection", () => {
  it("copies the section, adds the time taken and when it was committed", () => {
    const a = attempt(1);
    expect(a).toMatchObject({ ...section(1), timeTakenMs: 600_000 });
    expect(a.committedAt).toBe(T0 + 999_999);
    expect(a.answers).not.toBe(section(1).answers);
  });
});

describe("parseLevelCheckAttempt", () => {
  const stored = (a: LevelCheckAttempt, patch: Record<string, unknown> = {}) =>
    parseLevelCheckAttempt({ schema: HISTORY_SCHEMA, ...a, ...patch });

  it("reads back what was committed, as a fresh object", () => {
    const a = attempt(1);
    expect(stored(a)).toEqual({ kind: "valid", value: a });
  });

  it("keeps a record of another schema version apart from invalid ones", () => {
    expect(stored(attempt(1), { schema: 2 }).kind).toBe("unknownSchema");
    expect(parseLevelCheckAttempt({ ...attempt(1) }).kind).toBe("invalid");
  });

  it.each([
    ["an id that is not a session id", { id: "attempt-1" }],
    ["an unknown skill", { skill: "writing" }],
    ["a form id with spaces", { formId: "form a" }],
    ["a form version 0", { formVersion: 0 }],
    ["an end before the start", { finishedAt: T0 }],
    ["a negative time taken", { timeTakenMs: -1 }],
    ["an answer that is not text", { answers: { "1": 1 } }],
  ])("rejects %s", (_, patch) => {
    expect(stored(attempt(1), patch).kind).toBe("invalid");
  });

  it("accepts a form that is no longer current, since the form is not needed to read it", () => {
    expect(stored(attempt(1, { formVersion: 7 })).kind).toBe("valid");
  });
});

describe("parseLevelCheckResultRecord", () => {
  const a = attempt(1);
  const stored = (patch: Record<string, unknown> = {}) =>
    parseLevelCheckResultRecord(
      { schema: HISTORY_SCHEMA, ...record(a), ...patch },
      a,
    );

  it("reads back a record whose counts agree with its outcomes", () => {
    expect(stored()).toEqual({ kind: "valid", value: record(a) });
  });

  it.each([
    ["another attempt's record", { attemptId: id(2) }],
    ["a score that disagrees with the outcomes", { score: 2 }],
    ["an answered count that disagrees", { answered: 3 }],
    ["an outcome that is not one of the three", { outcomes: { 1: "right" } }],
    ["no outcomes", { outcomes: {} }],
    ["a level that looks like a band", { level: 6.5 }],
    [
      "more than two types to practise first",
      { practiseFirst: ["a", "b", "c"] },
    ],
    ["no level-rules version", { levelRulesVersion: undefined }],
  ])("rejects %s", (_, patch) => {
    expect(stored(patch).kind).toBe("invalid");
  });

  it("reads 'insufficient' as a level", () => {
    const r = stored({ level: "insufficient", practiseFirst: [] });
    expect(r.kind === "valid" && r.value.level).toBe("insufficient");
  });
});

describe("retention and the starting point", () => {
  it("removes the oldest attempts beyond ten, by when they finished", () => {
    const attempts = Array.from({ length: 12 }, (_, i) => attempt(12 - i));
    expect(attemptsToRemove(attempts)).toEqual([id(2), id(1)]);
    expect(attemptsToRemove(attempts.slice(0, 10))).toEqual([]);
  });

  it("takes the latest finished attempt at the current form as the starting point", () => {
    const attempts = [
      attempt(3),
      attempt(1),
      attempt(9, { formVersion: 2 }),
      attempt(5, { formId: "level-check-reading-b" }),
    ];
    expect(
      latestAttempt(attempts, { id: "level-check-reading-a", version: 1 })?.id,
    ).toBe(id(3));
    expect(
      latestAttempt(attempts, { id: "level-check-reading-a", version: 3 }),
    ).toBeUndefined();
  });
});
