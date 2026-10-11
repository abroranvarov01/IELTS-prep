import { QUESTION_COUNT, type ReadingTest } from "./content";
import {
  isSessionId,
  parseAnswers,
  parseHighlights,
  parsePins,
  parseRetry,
} from "./parse-session";
import { questionUnits } from "./units";
import type { Outcome, PracticeRawScore, Signal } from "./scoring";
import type { Answer, Mode, ReadingSession } from "./session";

// Committed attempts, their result records and the first-try marker
// (ADR-0009 §2): immutable records, read back as untrusted input.

/** The version of every history record. */
export const HISTORY_SCHEMA = 1;

/** At most this many attempts are kept per test (ADR-0009 §9). */
export const MAX_ATTEMPTS_PER_TEST = 20;

export type ReadingAttempt = {
  id: string;
  testId: string;
  testVersion: number;
  kind: "test" | "retry";
  retryOf?: string;
  questions?: number[];
  mode: Mode;
  startedAt: number;
  finishedAt: number;
  finishReason: "user" | "timeUp";
  answers: Record<string, Answer>;
  pins: Record<string, string[]>;
  /** Absent means "not recorded"; an empty list means nothing was highlighted. */
  highlights?: string[];
  importedFromM4?: true;
  committedAt: number;
};

/** One check of an attempt with one key revision and one rules version (ADR-0009 §7). */
export type ResultRecord = {
  attemptId: string;
  keyRevision: number;
  rulesVersion: number;
  checkedAt: number;
  outcomes: Record<number, Outcome>;
  signals: Record<string, Signal[]>;
  score: PracticeRawScore;
};

/** The test's first try: an attempt id or "unknown" (ADR-0009 §5). */
export type FirstTry = string;
export const UNKNOWN_FIRST_TRY = "unknown";

/** What a stored record turned out to be. */
export type StoredRecord<T> =
  { kind: "valid"; value: T } | { kind: "unknownSchema" } | { kind: "invalid" };

/** The attempt a finished session becomes; undefined for a session not finished. */
export function attemptFromSession(
  session: ReadingSession,
  committedAt: number,
  importedFromM4 = false,
): ReadingAttempt | undefined {
  if (
    session.status !== "finished" ||
    session.finishReason === undefined ||
    session.finishedAt === undefined
  )
    return undefined;
  return {
    id: session.sessionId,
    testId: session.testId,
    testVersion: session.testVersion,
    kind: session.retry ? "retry" : "test",
    ...(session.retry && {
      retryOf: session.retry.of,
      questions: [...session.retry.questions],
    }),
    mode: session.mode,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    finishReason: session.finishReason,
    answers: session.answers,
    pins: session.pins,
    highlights: session.highlights,
    ...(importedFromM4 && { importedFromM4: true }),
    committedAt,
  };
}

/** A record's schema: ours, another version's, or none at all. */
function schemaOf(input: unknown): "ours" | "unknown" | "none" {
  if (!isRecord(input) || typeof input.schema !== "number") return "none";
  return input.schema === HISTORY_SCHEMA ? "ours" : "unknown";
}

/**
 * Reads a stored attempt of `test`'s id. Answers, pins and highlights are
 * checked against the content only when the attempt's content version is the
 * current one; an attempt of an earlier version is checked for its shape.
 */
export function parseAttempt(
  input: unknown,
  test: ReadingTest,
): StoredRecord<ReadingAttempt> {
  const schema = schemaOf(input);
  if (schema === "unknown") return { kind: "unknownSchema" };
  if (schema === "none" || !isRecord(input)) return { kind: "invalid" };
  const a = input;
  const invalid = { kind: "invalid" } as const;
  if (!isSessionId(a.id) || a.testId !== test.id) return invalid;
  if (!Number.isInteger(a.testVersion) || (a.testVersion as number) < 1)
    return invalid;
  if (a.mode !== "practice" && a.mode !== "exam") return invalid;
  if (a.finishReason !== "user" && a.finishReason !== "timeUp") return invalid;
  if (!isTime(a.startedAt) || !isTime(a.finishedAt) || !isTime(a.committedAt))
    return invalid;
  if (a.importedFromM4 !== undefined && a.importedFromM4 !== true)
    return invalid;

  const sameContent = a.testVersion === test.version;
  const answers = sameContent
    ? parseAnswers(test, a.answers)
    : shapeOfAnswers(a.answers);
  const pins = sameContent
    ? parsePins(test, a.pins, a.mode)
    : shapeOfPins(a.pins);
  const highlights =
    a.highlights === undefined
      ? undefined
      : sameContent
        ? (parseHighlights(test, a.highlights) ?? null)
        : isStringList(a.highlights)
          ? [...a.highlights]
          : null;
  if (!answers || !pins || highlights === null) return invalid;

  let retry: { retryOf: string; questions: number[] } | undefined;
  if (a.kind === "retry") {
    if (a.mode !== "practice") return invalid;
    const parsed = sameContent
      ? parseRetry(
          { of: a.retryOf, questions: a.questions },
          questionUnits(test),
        )
      : isSessionId(a.retryOf) && isNumberList(a.questions)
        ? { of: a.retryOf, questions: [...a.questions] }
        : null;
    if (!parsed) return invalid;
    retry = { retryOf: parsed.of, questions: parsed.questions };
  } else if (
    a.kind !== "test" ||
    a.retryOf !== undefined ||
    a.questions !== undefined
  )
    return invalid;

  return {
    kind: "valid",
    value: {
      id: a.id,
      testId: test.id,
      testVersion: a.testVersion as number,
      kind: a.kind,
      ...retry,
      mode: a.mode,
      startedAt: a.startedAt,
      finishedAt: a.finishedAt,
      finishReason: a.finishReason,
      answers,
      pins,
      ...(highlights && { highlights }),
      ...(a.importedFromM4 === true && { importedFromM4: true }),
      committedAt: a.committedAt,
    },
  };
}

const SIGNAL_CODES = new Set([
  "ngInsteadOfFalse",
  "falseInsteadOfNg",
  "ngInsteadOfTrue",
  "trueInsteadOfNg",
  "oneLetterAway",
  "wordLimit",
  "notFromPassage",
  "timeUp",
  "pinnedElsewhere",
]);
const STATEMENT_CODES = new Set([
  "ngInsteadOfFalse",
  "falseInsteadOfNg",
  "ngInsteadOfTrue",
  "trueInsteadOfNg",
]);

/**
 * Reads a stored result record of `attempt`. Its outcomes must cover exactly
 * the attempt's scoring positions and agree with its score.
 */
export function parseResultRecord(
  input: unknown,
  attempt: ReadingAttempt,
): StoredRecord<ResultRecord> {
  const schema = schemaOf(input);
  if (schema === "unknown") return { kind: "unknownSchema" };
  if (schema === "none" || !isRecord(input)) return { kind: "invalid" };
  const r = input;
  const invalid = { kind: "invalid" } as const;
  if (r.attemptId !== attempt.id) return invalid;
  if (!isPositiveInteger(r.keyRevision) || !isPositiveInteger(r.rulesVersion))
    return invalid;
  if (!isTime(r.checkedAt)) return invalid;

  const positions =
    attempt.questions ??
    Array.from({ length: QUESTION_COUNT }, (_, i) => i + 1);
  if (!isRecord(r.outcomes)) return invalid;
  const outcomes: Record<number, Outcome> = {};
  for (const number of positions) {
    const outcome = r.outcomes[String(number)];
    if (
      outcome !== "correct" &&
      outcome !== "incorrect" &&
      outcome !== "unanswered"
    )
      return invalid;
    outcomes[number] = outcome;
  }
  if (Object.keys(r.outcomes).length !== positions.length) return invalid;

  const score = r.score;
  const marks = Object.values(outcomes).filter((o) => o === "correct").length;
  if (
    !isRecord(score) ||
    score.kind !== "practiceRawScore" ||
    score.marks !== marks ||
    score.positions !== positions.length
  )
    return invalid;

  if (!isRecord(r.signals)) return invalid;
  const signals: Record<string, Signal[]> = {};
  for (const [unitKey, list] of Object.entries(r.signals)) {
    if (!positions.includes(Number(unitKey)) || !Array.isArray(list))
      return invalid;
    const parsed = list.map(parseSignal);
    if (parsed.some((s) => s === undefined)) return invalid;
    signals[unitKey] = parsed as Signal[];
  }

  return {
    kind: "valid",
    value: {
      attemptId: attempt.id,
      keyRevision: r.keyRevision as number,
      rulesVersion: r.rulesVersion as number,
      checkedAt: r.checkedAt,
      outcomes,
      signals,
      score: { kind: "practiceRawScore", marks, positions: positions.length },
    },
  };
}

function parseSignal(value: unknown): Signal | undefined {
  if (!isRecord(value) || typeof value.code !== "string") return undefined;
  if (!SIGNAL_CODES.has(value.code)) return undefined;
  if (STATEMENT_CODES.has(value.code)) {
    if (value.wording !== "facts" && value.wording !== "views")
      return undefined;
    return { code: value.code, wording: value.wording } as Signal;
  }
  return { code: value.code } as Signal;
}

/** Reads a stored first-try marker of `testId`. */
export function parseFirstTry(
  input: unknown,
  testId: string,
): StoredRecord<FirstTry> {
  const schema = schemaOf(input);
  if (schema === "unknown") return { kind: "unknownSchema" };
  if (schema === "none" || !isRecord(input) || input.testId !== testId)
    return { kind: "invalid" };
  const value = input.firstTry;
  return value === UNKNOWN_FIRST_TRY || isSessionId(value)
    ? { kind: "valid", value }
    : { kind: "invalid" };
}

/**
 * The first-try marker to write when `attempt` is committed, or undefined to
 * leave it (ADR-0009 §5). Only a test attempt decides it, and only while no
 * marker exists: its own id when no other attempt of the test exists,
 * otherwise "unknown". A marker that cannot be read becomes "unknown".
 */
export function firstTryOnCommit(
  marker: StoredRecord<FirstTry> | undefined,
  attempt: ReadingAttempt,
  otherAttempts: number,
): FirstTry | undefined {
  if (attempt.kind !== "test") return undefined;
  if (marker?.kind === "valid" || marker?.kind === "unknownSchema")
    return undefined;
  if (marker?.kind === "invalid") return UNKNOWN_FIRST_TRY;
  return otherAttempts === 0 ? attempt.id : UNKNOWN_FIRST_TRY;
}

/**
 * The test's first try as shown: the marked attempt if it is still there,
 * otherwise "unknown"; undefined while the test has no attempt and no marker.
 */
export function firstTryOf(
  marker: StoredRecord<FirstTry> | undefined,
  attempts: ReadingAttempt[],
): FirstTry | undefined {
  if (!marker) return attempts.length === 0 ? undefined : UNKNOWN_FIRST_TRY;
  if (marker.kind !== "valid") return UNKNOWN_FIRST_TRY;
  if (marker.value === UNKNOWN_FIRST_TRY) return UNKNOWN_FIRST_TRY;
  return attempts.some((a) => a.id === marker.value)
    ? marker.value
    : UNKNOWN_FIRST_TRY;
}

/**
 * The attempts retention removes (ADR-0009 §9): the oldest beyond the limit,
 * never the first-try attempt.
 */
export function attemptsToRemove(
  attempts: ReadingAttempt[],
  firstTryId: FirstTry | undefined,
): string[] {
  const removable = [...attempts]
    .sort((a, b) => a.startedAt - b.startedAt)
    .filter((a) => a.id !== firstTryId);
  const excess = attempts.length - MAX_ATTEMPTS_PER_TEST;
  return excess > 0 ? removable.slice(0, excess).map((a) => a.id) : [];
}

function shapeOfAnswers(value: unknown): Record<string, Answer> | undefined {
  if (!isRecord(value)) return undefined;
  const answers: Record<string, Answer> = {};
  for (const [key, answer] of Object.entries(value)) {
    if (typeof answer === "string") answers[key] = answer;
    else if (isStringList(answer)) answers[key] = [...answer];
    else return undefined;
  }
  return answers;
}

function shapeOfPins(value: unknown): Record<string, string[]> | undefined {
  if (!isRecord(value)) return undefined;
  const pins: Record<string, string[]> = {};
  for (const [key, ids] of Object.entries(value)) {
    if (!isStringList(ids)) return undefined;
    pins[key] = [...ids];
  }
  return pins;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTime(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1;
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isNumberList(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => Number.isInteger(v))
  );
}
