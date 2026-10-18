import { isRecord } from "@/shared/content/parse";
import type { ListeningTest } from "./content";
import {
  type Answer,
  type ExamState,
  type ListeningSession,
  SPEEDS,
  type Speed,
  isValidAnswer,
} from "./session";
import { checkUnits } from "./scoring";
import { type QuestionUnit, questionUnits, unitOf } from "./units";

/** The version of the stored envelope `{ schema, session }` (ADR-0013 §3). */
export const SESSION_SCHEMA = 1;

const SESSION_ID =
  /^s-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isSessionId(value: unknown): value is string {
  return typeof value === "string" && SESSION_ID.test(value);
}

/** Answers by unit key, each valid for its unit; undefined when any is not. */
export function parseAnswers(
  test: ListeningTest,
  value: unknown,
): Record<string, Answer> | undefined {
  if (!isRecord(value)) return undefined;
  const units = questionUnits(test);
  const answers: Record<string, Answer> = {};
  for (const [key, answer] of Object.entries(value)) {
    const unit = unitOf(units, Number(key));
    if (!unit || unit.key !== key) return undefined;
    if (typeof answer !== "string" && !isStringList(answer)) return undefined;
    if (!isValidAnswer(unit, answer)) return undefined;
    answers[key] = Array.isArray(answer) ? [...answer] : answer;
  }
  return answers;
}

/**
 * Playback coverage by part number (ADR-0014 §2): a position within that
 * part's recording. Undefined when the value is malformed.
 */
export function parsePlayedToMs(
  test: ListeningTest,
  value: unknown,
): Record<string, number> | undefined {
  if (!isRecord(value)) return undefined;
  const playedToMs: Record<string, number> = {};
  for (const [key, ms] of Object.entries(value)) {
    const part = test.parts.find((p) => String(p.number) === key);
    if (!part || !Number.isInteger(ms) || (ms as number) < 0) return undefined;
    if ((ms as number) > part.audio.durationMs) return undefined;
    playedToMs[key] = ms as number;
  }
  return playedToMs;
}

/**
 * Reads a stored session for `test`. Stored data is untrusted: a wrong
 * schema, another test or content version, or any invalid field means "no
 * session". Builds a fresh object field by field.
 */
export function parseStoredSession(
  test: ListeningTest,
  input: unknown,
): ListeningSession | undefined {
  if (!isRecord(input) || input.schema !== SESSION_SCHEMA) return undefined;
  const s = input.session;
  if (!isRecord(s) || s.testId !== test.id || s.testVersion !== test.version)
    return undefined;
  if (!isSessionId(s.sessionId)) return undefined;
  if (s.mode !== "practice" && s.mode !== "exam") return undefined;
  if (s.status !== "inProgress" && s.status !== "finished") return undefined;
  const finished = s.status === "finished";
  const reasons = ["user", "timeUp", "audioFailed"];
  if (finished !== reasons.includes(s.finishReason as string)) return undefined;
  if (
    !isTime(s.startedAt) ||
    (finished ? !isTime(s.finishedAt) : s.finishedAt !== undefined)
  )
    return undefined;

  const units = questionUnits(test);
  const numbers = new Set(units.flatMap((u) => u.numbers));
  if (!numbers.has(s.currentQuestion as number)) return undefined;
  if (
    !Array.isArray(s.flagged) ||
    new Set(s.flagged).size !== s.flagged.length ||
    !s.flagged.every((n) => numbers.has(n as number))
  )
    return undefined;

  const answers = parseAnswers(test, s.answers);
  if (!answers) return undefined;
  const retry = parseRetry(s.retry, checkUnits(test));
  if (retry === null || (retry && s.mode !== "practice")) return undefined;
  const check = s.check === undefined ? undefined : parseCheck(s.check);
  if (check === null || (check && (s.mode !== "practice" || retry)))
    return undefined;

  const partIds = new Set(test.parts.map((p) => p.id));
  const view = s.view;
  if (
    !isRecord(view) ||
    !Number.isInteger(view.part) ||
    (view.part as number) < 1 ||
    (view.part as number) > test.parts.length ||
    !isRecord(view.scroll) ||
    !Object.entries(view.scroll).every(
      ([id, y]) => partIds.has(id) && typeof y === "number" && y >= 0,
    )
  )
    return undefined;

  const base = {
    sessionId: s.sessionId,
    testId: test.id,
    testVersion: test.version,
    mode: s.mode,
    status: s.status,
    ...(finished && {
      finishReason: s.finishReason as "user" | "timeUp" | "audioFailed",
      finishedAt: s.finishedAt as number,
    }),
    startedAt: s.startedAt as number,
    currentQuestion: s.currentQuestion as number,
    answers,
    flagged: [...(s.flagged as number[])],
    view: {
      part: view.part as number,
      scroll: { ...(view.scroll as Record<string, number>) },
    },
    ...(retry && { retry }),
    ...(check && { check }),
  } satisfies Partial<ListeningSession>;

  if (s.mode === "practice") {
    if (s.exam !== undefined) return undefined;
    const practice = parsePractice(test, s.practice);
    return practice && { ...base, practice };
  }
  if (s.practice !== undefined) return undefined;
  const exam = parseExam(test, s.exam);
  return exam && { ...base, exam };
}

/**
 * A stored retry's source and question numbers: whole answer units of
 * checking (`checkUnits`), each number once. Undefined when absent, null
 * when present but invalid.
 */
export function parseRetry(
  value: unknown,
  units: QuestionUnit[],
): ListeningSession["retry"] | null {
  if (value === undefined) return undefined;
  if (!isRecord(value) || !isSessionId(value.of)) return null;
  const questions = value.questions;
  if (
    !Array.isArray(questions) ||
    !questions.every((n) => typeof n === "number") ||
    new Set(questions).size !== questions.length
  )
    return null;
  const chosen = new Set(questions as number[]);
  // Whole answer units only: every number of a several-answer unit or none.
  const covered = units.filter((u) => u.numbers.some((n) => chosen.has(n)));
  if (
    chosen.size === 0 ||
    covered.some((u) => !u.numbers.every((n) => chosen.has(n))) ||
    covered.reduce((count, u) => count + u.numbers.length, 0) !== chosen.size
  )
    return null;
  return { of: value.of, questions: [...(questions as number[])] };
}

/** A check's pause counts; null when invalid. */
function parseCheck(value: unknown): ListeningSession["check"] | null {
  if (!isRecord(value)) return null;
  const { pauses, interruptions } = value;
  return [pauses, interruptions].every(
    (n) => Number.isInteger(n) && (n as number) >= 0,
  )
    ? { pauses: pauses as number, interruptions: interruptions as number }
    : null;
}

function parsePractice(
  test: ListeningTest,
  value: unknown,
): ListeningSession["practice"] | undefined {
  if (!isRecord(value) || !isRecord(value.positions)) return undefined;
  if (!SPEEDS.includes(value.speed as Speed)) return undefined;
  const positions: Record<string, number> = {};
  for (const [id, ms] of Object.entries(value.positions)) {
    const part = test.parts.find((p) => p.id === id);
    if (
      !part ||
      !Number.isInteger(ms) ||
      (ms as number) < 0 ||
      (ms as number) > part.audio.durationMs
    )
      return undefined;
    positions[id] = ms as number;
  }
  return { positions, speed: value.speed as Speed };
}

function parseExam(test: ListeningTest, value: unknown): ExamState | undefined {
  if (!isRecord(value)) return undefined;
  if (
    !Number.isInteger(value.pausedMs) ||
    (value.pausedMs as number) < 0 ||
    !Number.isInteger(value.interruptions) ||
    (value.interruptions as number) < 0 ||
    !isTime(value.lastActiveAt)
  )
    return undefined;
  if (
    value.recordingStartedAt !== undefined &&
    !isTime(value.recordingStartedAt)
  )
    return undefined;
  let pause: ExamState["pause"];
  if (value.pause !== undefined) {
    const p = value.pause;
    if (
      !isRecord(p) ||
      !isTime(p.since) ||
      (p.kind !== "buffering" && p.kind !== "audioFailed") ||
      value.recordingStartedAt === undefined
    )
      return undefined;
    pause = { since: p.since as number, kind: p.kind };
  }
  const playedToMs =
    value.playedToMs === undefined
      ? undefined
      : parsePlayedToMs(test, value.playedToMs);
  if (value.playedToMs !== undefined && !playedToMs) return undefined;
  return {
    ...(value.recordingStartedAt !== undefined && {
      recordingStartedAt: value.recordingStartedAt as number,
    }),
    pausedMs: value.pausedMs as number,
    ...(pause && { pause }),
    interruptions: value.interruptions as number,
    lastActiveAt: value.lastActiveAt as number,
    ...(playedToMs && { playedToMs }),
  };
}

function isTime(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) > 0;
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}
