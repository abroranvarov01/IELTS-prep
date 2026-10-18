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
import { questionUnits, unitOf } from "./units";

/** The version of the stored envelope `{ schema, session }` (ADR-0013 §3). */
export const SESSION_SCHEMA = 1;

const SESSION_ID =
  /^s-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

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
  if (typeof s.sessionId !== "string" || !SESSION_ID.test(s.sessionId))
    return undefined;
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

  if (!isRecord(s.answers)) return undefined;
  const answers: Record<string, Answer> = {};
  for (const [key, value] of Object.entries(s.answers)) {
    const unit = unitOf(units, Number(key));
    if (!unit || unit.key !== key) return undefined;
    if (typeof value !== "string" && !isStringList(value)) return undefined;
    if (!isValidAnswer(unit, value)) return undefined;
    answers[key] = Array.isArray(value) ? [...value] : value;
  }

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
  } satisfies Partial<ListeningSession>;

  if (s.mode === "practice") {
    if (s.exam !== undefined) return undefined;
    const practice = parsePractice(test, s.practice);
    return practice && { ...base, practice };
  }
  if (s.practice !== undefined) return undefined;
  const exam = parseExam(s.exam);
  return exam && { ...base, exam };
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

function parseExam(value: unknown): ExamState | undefined {
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
  return {
    ...(value.recordingStartedAt !== undefined && {
      recordingStartedAt: value.recordingStartedAt as number,
    }),
    pausedMs: value.pausedMs as number,
    ...(pause && { pause }),
    interruptions: value.interruptions as number,
    lastActiveAt: value.lastActiveAt as number,
  };
}

function isTime(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) > 0;
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}
