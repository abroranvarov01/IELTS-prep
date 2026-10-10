import type { ReadingTest } from "./content";
import {
  type Answer,
  MAX_PINS,
  type ReadingSession,
  type SessionView,
  isValidAnswer,
  sentenceIds,
} from "./session";
import { questionUnits, unitOf } from "./units";

/** The version of the stored envelope `{ schema, session }` (ADR-0006). */
export const SESSION_SCHEMA = 1;

/**
 * Reads a stored session for `test`. Stored data is untrusted: a wrong schema,
 * another test or content version, or any invalid field means "no session".
 * Builds a fresh object field by field, so nothing unexpected is carried over.
 */
export function parseStoredSession(
  test: ReadingTest,
  input: unknown,
): ReadingSession | undefined {
  if (!isRecord(input) || input.schema !== SESSION_SCHEMA) return undefined;
  const s = input.session;
  if (!isRecord(s) || s.testId !== test.id || s.testVersion !== test.version)
    return undefined;

  const units = questionUnits(test);
  const numbers = new Set(units.flatMap((u) => u.numbers));
  const allSentences = sentenceIds(test);

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

  if (!isRecord(s.answers)) return undefined;
  const answers: Record<string, Answer> = {};
  for (const [key, value] of Object.entries(s.answers)) {
    const unit = unitOf(units, Number(key));
    if (!unit || unit.key !== key) return undefined;
    if (!(typeof value === "string" || isStringList(value))) return undefined;
    if (!isValidAnswer(unit, value)) return undefined;
    answers[key] = Array.isArray(value) ? [...value] : value;
  }

  if (!isUniqueList(s.flagged, (n) => typeof n === "number" && numbers.has(n)))
    return undefined;
  if (
    !isUniqueList(
      s.highlights,
      (id) => typeof id === "string" && allSentences.has(id),
    )
  )
    return undefined;

  if (
    !isRecord(s.pins) ||
    (s.mode === "exam" && Object.keys(s.pins).length > 0)
  )
    return undefined;
  const pins: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(s.pins)) {
    const unit = unitOf(units, Number(key));
    if (!unit || String(Number(key)) !== key || !isStringList(value))
      return undefined;
    const passageSentences = sentenceIds(test, unit.passageNumber);
    if (
      value.length === 0 ||
      value.length > MAX_PINS ||
      new Set(value).size !== value.length
    )
      return undefined;
    if (!value.every((id) => passageSentences.has(id))) return undefined;
    pins[key] = [...value];
  }

  const view = parseView(test, s.view);
  if (!view) return undefined;

  return {
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
    highlights: [...(s.highlights as string[])],
    pins,
    view,
  };
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
