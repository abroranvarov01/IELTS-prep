import type { ReadingTest } from "./content";
import {
  type Answer,
  MAX_PINS,
  type ReadingSession,
  type SessionView,
  isValidAnswer,
  sentenceIds,
} from "./session";
import { type QuestionUnit, questionUnits, unitOf } from "./units";

/** The version of the stored envelope `{ schema, session }` (ADR-0006). */
export const SESSION_SCHEMA = 1;

/**
 * A session id (ADR-0009 §3): "s-" and a random version 4 UUID, or the
 * deterministic id of a session M4 stored without one.
 */
export function isSessionId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^(s-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|m4-(current|finished)-\d+)$/.test(
      value,
    )
  );
}

/**
 * Reads a stored session for `test`. Stored data is untrusted: a wrong schema,
 * another test or content version, or any invalid field means "no session".
 * Builds a fresh object field by field, so nothing unexpected is carried over.
 * A session M4 stored without an id gets `m4-<slot>-<startedAt>`, where the
 * slot is the entry it was read from, so every tab derives the same id.
 */
export function parseStoredSession(
  test: ReadingTest,
  input: unknown,
  slot: "current" | "finished" = "current",
): ReadingSession | undefined {
  if (!isRecord(input) || input.schema !== SESSION_SCHEMA) return undefined;
  const s = input.session;
  if (!isRecord(s) || s.testId !== test.id || s.testVersion !== test.version)
    return undefined;

  const units = questionUnits(test);
  const numbers = new Set(units.flatMap((u) => u.numbers));

  if (s.mode !== "practice" && s.mode !== "exam") return undefined;
  if (s.status !== "inProgress" && s.status !== "finished") return undefined;
  const finished = s.status === "finished";
  if (finished !== (s.finishReason === "user" || s.finishReason === "timeUp"))
    return undefined;
  if (
    !isTime(s.startedAt) ||
    (finished ? !isTime(s.finishedAt) : s.finishedAt !== undefined)
  )
    return undefined;
  if (!numbers.has(s.currentQuestion as number)) return undefined;
  if (s.sessionId !== undefined && !isSessionId(s.sessionId)) return undefined;
  const sessionId =
    s.sessionId ?? `m4-${slot}-${String(s.startedAt as number)}`;
  const retry = parseRetry(s.retry, units);
  if (
    retry === null ||
    (retry && (s.sessionId === undefined || s.mode !== "practice"))
  )
    return undefined;

  const answers = parseAnswers(test, s.answers);
  if (!answers) return undefined;
  if (!isUniqueList(s.flagged, (n) => typeof n === "number" && numbers.has(n)))
    return undefined;
  const highlights = parseHighlights(test, s.highlights);
  if (!highlights) return undefined;
  const pins = parsePins(test, s.pins, s.mode);
  if (!pins) return undefined;

  const view = parseView(test, s.view);
  if (!view) return undefined;

  return {
    sessionId,
    testId: test.id,
    testVersion: test.version,
    mode: s.mode,
    status: s.status,
    ...(finished && {
      finishReason: s.finishReason as "user" | "timeUp",
      finishedAt: s.finishedAt as number,
    }),
    startedAt: s.startedAt as number,
    currentQuestion: s.currentQuestion as number,
    answers,
    flagged: [...(s.flagged as number[])],
    highlights,
    pins,
    view,
    ...(retry && { retry }),
  };
}

/**
 * Stored answers, as untrusted input: each under its unit's key, in the shape
 * its unit allows (ADR-0006). Shared by sessions and committed attempts.
 */
export function parseAnswers(
  test: ReadingTest,
  value: unknown,
): Record<string, Answer> | undefined {
  if (!isRecord(value)) return undefined;
  const units = questionUnits(test);
  const answers: Record<string, Answer> = {};
  for (const [key, answer] of Object.entries(value)) {
    const unit = unitOf(units, Number(key));
    if (!unit || unit.key !== key) return undefined;
    if (!(typeof answer === "string" || isStringList(answer))) return undefined;
    if (!isValidAnswer(unit, answer)) return undefined;
    answers[key] = Array.isArray(answer) ? [...answer] : answer;
  }
  return answers;
}

/** Highlighted sentence ids, each once, all of the test. */
export function parseHighlights(
  test: ReadingTest,
  value: unknown,
): string[] | undefined {
  const all = sentenceIds(test);
  return isUniqueList(value, (id) => typeof id === "string" && all.has(id))
    ? [...(value as string[])]
    : undefined;
}

/** Pins by question number: at most three sentences of its passage; none in Exam Mode. */
export function parsePins(
  test: ReadingTest,
  value: unknown,
  mode: unknown,
): Record<string, string[]> | undefined {
  if (!isRecord(value) || (mode === "exam" && Object.keys(value).length > 0))
    return undefined;
  const units = questionUnits(test);
  const pins: Record<string, string[]> = {};
  for (const [key, ids] of Object.entries(value)) {
    const unit = unitOf(units, Number(key));
    if (!unit || String(Number(key)) !== key || !isStringList(ids))
      return undefined;
    const passageSentences = sentenceIds(test, unit.passageNumber);
    if (
      ids.length === 0 ||
      ids.length > MAX_PINS ||
      new Set(ids).size !== ids.length ||
      !ids.every((id) => passageSentences.has(id))
    )
      return undefined;
    pins[key] = [...ids];
  }
  return pins;
}

/** Undefined when absent, null when present but invalid. */
export function parseRetry(
  value: unknown,
  units: QuestionUnit[],
): ReadingSession["retry"] | null {
  if (value === undefined) return undefined;
  if (!isRecord(value) || !isSessionId(value.of)) return null;
  const questions = value.questions;
  if (!isUniqueList(questions, (n) => typeof n === "number")) return null;
  const chosen = new Set(questions as number[]);
  // Whole answer units only: both numbers of a "choose several" item or neither.
  const covered = units.filter((u) => u.numbers.some((n) => chosen.has(n)));
  if (
    chosen.size === 0 ||
    covered.some((u) => !u.numbers.every((n) => chosen.has(n))) ||
    covered.reduce((count, u) => count + u.numbers.length, 0) !== chosen.size
  )
    return null;
  return { of: value.of, questions: [...(questions as number[])] };
}

function parseView(test: ReadingTest, value: unknown): SessionView | undefined {
  if (!isRecord(value)) return undefined;
  const { sheet, passage, scroll } = value;
  if (sheet !== "collapsed" && sheet !== "partial" && sheet !== "expanded")
    return undefined;
  if (!test.passages.some((p) => p.number === passage)) return undefined;
  if (!isRecord(scroll)) return undefined;
  const passageIds = new Set(test.passages.map((p) => p.id));
  const positions: Record<string, number> = {};
  for (const [id, y] of Object.entries(scroll)) {
    if (
      !passageIds.has(id) ||
      typeof y !== "number" ||
      !Number.isFinite(y) ||
      y < 0
    )
      return undefined;
    positions[id] = y;
  }
  return { sheet, passage: passage as number, scroll: positions };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTime(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/** A list without duplicates whose items all pass `valid`. */
function isUniqueList(
  value: unknown,
  valid: (item: unknown) => boolean,
): boolean {
  return (
    Array.isArray(value) &&
    value.every(valid) &&
    new Set(value).size === value.length
  );
}
