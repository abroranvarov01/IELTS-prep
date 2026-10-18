import { isRecord } from "@/shared/content/parse";
import { type ListeningTest, groupNumbers } from "./content";
import {
  isSessionId,
  parseAnswers,
  parsePlayedToMs,
  parseRetry,
} from "./parse-session";
import {
  type Outcome,
  type PracticeRawScore,
  type Signal,
  checkUnits,
} from "./scoring";
import type { Answer, ListeningSession, Mode } from "./session";

// Committed Listening attempts, their result records and the first-try
// marker (ADR-0014 §2, in ADR-0009's layout): immutable records, read back
// as untrusted input.

/** The version of every history record. */
export const HISTORY_SCHEMA = 1;

/** At most this many attempts are kept per test (ADR-0014 §4). */
export const MAX_ATTEMPTS_PER_TEST = 20;

/** What an Exam attempt keeps of its sitting (ADR-0014 §2). */
export type ExamRecord = {
  recordingStartedAt?: number;
  pausedMs: number;
  interruptions: number;
  /** By part number, the furthest position actually played; absent: unknown. */
  playedToMs?: Record<string, number>;
};

export type ListeningAttempt = {
  id: string;
  testId: string;
  testVersion: number;
  kind: "test" | "retry";
  /** A retry's source test attempt and its question numbers (whole units). */
  retryOf?: string;
  questions?: number[];
  mode: Mode;
  startedAt: number;
  finishedAt: number;
  finishReason: "user" | "timeUp" | "audioFailed";
  answers: Record<string, Answer>;
  exam?: ExamRecord;
  importedFromM8?: true;
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

/**
 * The attempt a finished session becomes; undefined for a session not
 * finished. An Exam keeps its timing and its playback coverage; a pause
 * still open at the finish is closed there.
 */
export function attemptFromSession(
  session: ListeningSession,
  committedAt: number,
  importedFromM8 = false,
): ListeningAttempt | undefined {
  if (
    session.status !== "finished" ||
    session.finishReason === undefined ||
    session.finishedAt === undefined
  )
    return undefined;
  const exam = session.exam;
  const open = exam?.pause
    ? Math.max(0, session.finishedAt - exam.pause.since)
    : 0;
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
    ...(exam && {
      exam: {
        ...(exam.recordingStartedAt !== undefined && {
          recordingStartedAt: exam.recordingStartedAt,
        }),
        pausedMs: exam.pausedMs + open,
        interruptions: exam.interruptions,
        ...(exam.playedToMs && { playedToMs: { ...exam.playedToMs } }),
      },
    }),
    ...(importedFromM8 && { importedFromM8: true }),
    committedAt,
  };
}

/** A record's schema: ours, another version's, or none at all. */
function schemaOf(input: unknown): "ours" | "unknown" | "none" {
  if (!isRecord(input) || typeof input.schema !== "number") return "none";
  return input.schema === HISTORY_SCHEMA ? "ours" : "unknown";
}

/**
 * Reads a stored attempt of `test`'s id. Answers and coverage are checked
 * against the content only when the attempt's content version is the
 * current one; an attempt of an earlier version is checked for its shape.
 */
export function parseAttempt(
  input: unknown,
  test: ListeningTest,
): StoredRecord<ListeningAttempt> {
  const schema = schemaOf(input);
  if (schema === "unknown") return { kind: "unknownSchema" };
  if (schema === "none" || !isRecord(input)) return { kind: "invalid" };
  const a = input;
  const invalid = { kind: "invalid" } as const;
  if (!isSessionId(a.id) || a.testId !== test.id) return invalid;
  if (!Number.isInteger(a.testVersion) || (a.testVersion as number) < 1)
    return invalid;
  if (a.mode !== "practice" && a.mode !== "exam") return invalid;
  if (
    a.finishReason !== "user" &&
    a.finishReason !== "timeUp" &&
    a.finishReason !== "audioFailed"
  )
    return invalid;
  if (!isTime(a.startedAt) || !isTime(a.finishedAt) || !isTime(a.committedAt))
    return invalid;
  if (a.importedFromM8 !== undefined && a.importedFromM8 !== true)
    return invalid;

  const sameContent = a.testVersion === test.version;
  const answers = sameContent
    ? parseAnswers(test, a.answers)
    : shapeOfAnswers(a.answers);
  if (!answers) return invalid;
  if ((a.mode === "exam") !== (a.exam !== undefined)) return invalid;
  const exam =
    a.exam === undefined
      ? undefined
      : parseExamRecord(a.exam, test, sameContent);
  if (a.exam !== undefined && !exam) return invalid;

  let retry: { retryOf: string; questions: number[] } | undefined;
  if (a.kind === "retry") {
    if (a.mode !== "practice") return invalid;
    const parsed = sameContent
      ? parseRetry({ of: a.retryOf, questions: a.questions }, checkUnits(test))
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
      ...(exam && { exam }),
      ...(a.importedFromM8 === true && { importedFromM8: true }),
      committedAt: a.committedAt,
    },
  };
}

function parseExamRecord(
  value: unknown,
  test: ListeningTest,
  sameContent: boolean,
): ExamRecord | undefined {
  if (!isRecord(value)) return undefined;
  if (!isCount(value.pausedMs) || !isCount(value.interruptions))
    return undefined;
  if (
    value.recordingStartedAt !== undefined &&
    !isTime(value.recordingStartedAt)
  )
    return undefined;
  let playedToMs: Record<string, number> | undefined;
  if (value.playedToMs !== undefined) {
    playedToMs = sameContent
      ? parsePlayedToMs(test, value.playedToMs)
      : shapeOfCounts(value.playedToMs);
    if (!playedToMs) return undefined;
  }
  return {
    ...(value.recordingStartedAt !== undefined && {
      recordingStartedAt: value.recordingStartedAt as number,
    }),
    pausedMs: value.pausedMs as number,
    interruptions: value.interruptions as number,
    ...(playedToMs && { playedToMs }),
  };
}

const SIGNAL_CODES = new Set<string>([
  "oneLetterAway",
  "wordLimit",
  "notInTranscript",
  "teenTyNumber",
  "sameDigitsDifferentForm",
  "mentionedOption",
  "timeUp",
  "notReached",
]);

/**
 * Reads a stored result record of `attempt`. Its outcomes must cover exactly
 * the attempt's scoring positions (a retry's questions, otherwise the
 * test's) and agree with its score.
 */
export function parseResultRecord(
  input: unknown,
  attempt: ListeningAttempt,
  test: ListeningTest,
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
    test.parts.flatMap((p) => p.questionGroups.flatMap(groupNumbers));
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
    if (
      !list.every(
        (s) =>
          isRecord(s) && typeof s.code === "string" && SIGNAL_CODES.has(s.code),
      )
    )
      return invalid;
    signals[unitKey] = list.map((s) => ({ code: s.code }) as Signal);
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
 * leave it (ADR-0009 §5): a retry never sets it; a test attempt only while
 * no marker exists, its own id when no
 * other attempt of the test exists, otherwise "unknown". A marker that
 * cannot be read becomes "unknown".
 */
export function firstTryOnCommit(
  marker: StoredRecord<FirstTry> | undefined,
  attempt: ListeningAttempt,
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
  attempts: ListeningAttempt[],
): FirstTry | undefined {
  if (!marker) return attempts.length === 0 ? undefined : UNKNOWN_FIRST_TRY;
  if (marker.kind !== "valid") return UNKNOWN_FIRST_TRY;
  if (marker.value === UNKNOWN_FIRST_TRY) return UNKNOWN_FIRST_TRY;
  return attempts.some((a) => a.id === marker.value)
    ? marker.value
    : UNKNOWN_FIRST_TRY;
}

/**
 * The attempts retention removes (ADR-0014 §4): the oldest beyond the limit,
 * never the first-try attempt.
 */
export function attemptsToRemove(
  attempts: ListeningAttempt[],
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
    else if (
      Array.isArray(answer) &&
      answer.every((v) => typeof v === "string")
    )
      answers[key] = [...answer];
    else return undefined;
  }
  return answers;
}

function shapeOfCounts(value: unknown): Record<string, number> | undefined {
  if (!isRecord(value)) return undefined;
  const counts: Record<string, number> = {};
  for (const [key, n] of Object.entries(value)) {
    if (!isCount(n)) return undefined;
    counts[key] = n;
  }
  return counts;
}

function isNumberList(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((n) => Number.isInteger(n) && n > 0)
  );
}

function isTime(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1;
}
