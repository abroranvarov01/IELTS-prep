import type { Level } from "./level";

// Committed level-check attempts and their result records (ADR-0011 §3):
// immutable, append-only, read back as untrusted input. The section itself
// runs on the Reading session model; the page that owns the check hands a
// finished section here as plain data, so this slice never imports reading.

/** The version of every level-check history record. */
export const HISTORY_SCHEMA = 1;

/** At most this many attempts are kept per skill (ADR-0011 §3). */
export const MAX_ATTEMPTS_PER_SKILL = 10;

export const SKILLS = ["reading", "listening"] as const;
export type Skill = (typeof SKILLS)[number];

export type Answer = string | string[];

/** A finished section, as the page hands it over from the Reading session. */
export type FinishedSection = {
  /** The session's id (ADR-0009 §3). */
  id: string;
  skill: Skill;
  formId: string;
  formVersion: number;
  startedAt: number;
  finishedAt: number;
  answers: Record<string, Answer>;
};

export type LevelCheckAttempt = FinishedSection & {
  /** The wall-clock span of the attempt; M11 decides how to read it. */
  timeTakenMs: number;
  committedAt: number;
};

/** One check of an attempt with one key revision, checking-rules and level-rules version. */
export type LevelCheckResultRecord = {
  attemptId: string;
  keyRevision: number;
  rulesVersion: number;
  levelRulesVersion: number;
  checkedAt: number;
  outcomes: Record<number, "correct" | "incorrect" | "unanswered">;
  score: number;
  total: number;
  answered: number;
  level: Level | "insufficient";
  practiseFirst: string[];
};

/** What a stored record turned out to be. */
export type StoredRecord<T> =
  { kind: "valid"; value: T } | { kind: "unknownSchema" } | { kind: "invalid" };

export function attemptFromSection(
  section: FinishedSection,
  committedAt: number,
): LevelCheckAttempt {
  return {
    ...section,
    answers: { ...section.answers },
    timeTakenMs: Math.max(0, section.finishedAt - section.startedAt),
    committedAt,
  };
}

/** A record's schema: ours, another version's, or none at all. */
function schemaOf(input: unknown): "ours" | "unknown" | "none" {
  if (!isRecord(input) || typeof input.schema !== "number") return "none";
  return input.schema === HISTORY_SCHEMA ? "ours" : "unknown";
}

/** Reads a stored attempt; its shape only, since a form may no longer be current. */
export function parseLevelCheckAttempt(
  input: unknown,
): StoredRecord<LevelCheckAttempt> {
  const schema = schemaOf(input);
  if (schema === "unknown") return { kind: "unknownSchema" };
  if (schema === "none" || !isRecord(input)) return { kind: "invalid" };
  const a = input;
  const invalid = { kind: "invalid" } as const;
  if (!isSessionId(a.id) || !isSkill(a.skill) || !isId(a.formId))
    return invalid;
  if (!isPositiveInteger(a.formVersion)) return invalid;
  if (!isTime(a.startedAt) || !isTime(a.finishedAt) || !isTime(a.committedAt))
    return invalid;
  if (a.finishedAt < a.startedAt) return invalid;
  if (!Number.isInteger(a.timeTakenMs) || (a.timeTakenMs as number) < 0)
    return invalid;
  const answers = parseAnswers(a.answers);
  if (!answers) return invalid;
  return {
    kind: "valid",
    value: {
      id: a.id,
      skill: a.skill,
      formId: a.formId,
      formVersion: a.formVersion,
      startedAt: a.startedAt,
      finishedAt: a.finishedAt,
      answers,
      timeTakenMs: a.timeTakenMs as number,
      committedAt: a.committedAt,
    },
  };
}

/**
 * Reads a stored result record of `attempt`. Its counts must agree with its
 * outcomes and its level with the counts' shape (never a band).
 */
export function parseLevelCheckResultRecord(
  input: unknown,
  attempt: LevelCheckAttempt,
): StoredRecord<LevelCheckResultRecord> {
  const schema = schemaOf(input);
  if (schema === "unknown") return { kind: "unknownSchema" };
  if (schema === "none" || !isRecord(input)) return { kind: "invalid" };
  const r = input;
  const invalid = { kind: "invalid" } as const;
  if (r.attemptId !== attempt.id) return invalid;
  if (
    !isPositiveInteger(r.keyRevision) ||
    !isPositiveInteger(r.rulesVersion) ||
    !isPositiveInteger(r.levelRulesVersion)
  )
    return invalid;
  if (!isTime(r.checkedAt)) return invalid;
  if (!isRecord(r.outcomes)) return invalid;
  const outcomes: LevelCheckResultRecord["outcomes"] = {};
  for (const [key, outcome] of Object.entries(r.outcomes)) {
    const number = Number(key);
    if (!isPositiveInteger(number)) return invalid;
    if (
      outcome !== "correct" &&
      outcome !== "incorrect" &&
      outcome !== "unanswered"
    )
      return invalid;
    outcomes[number] = outcome;
  }
  const values = Object.values(outcomes);
  const total = values.length;
  if (total === 0) return invalid;
  const score = values.filter((o) => o === "correct").length;
  const answered = values.filter((o) => o !== "unanswered").length;
  if (r.score !== score || r.total !== total || r.answered !== answered)
    return invalid;
  const level = r.level;
  if (level !== 1 && level !== 2 && level !== 3 && level !== "insufficient")
    return invalid;
  if (!isStringList(r.practiseFirst) || r.practiseFirst.length > 2)
    return invalid;
  return {
    kind: "valid",
    value: {
      attemptId: attempt.id,
      keyRevision: r.keyRevision,
      rulesVersion: r.rulesVersion,
      levelRulesVersion: r.levelRulesVersion,
      checkedAt: r.checkedAt,
      outcomes,
      score,
      total,
      answered,
      level,
      practiseFirst: [...r.practiseFirst],
    },
  };
}

/** The ids of the oldest attempts beyond the limit, by when they finished (ADR-0011 §3). */
export function attemptsToRemove(attempts: LevelCheckAttempt[]): string[] {
  return [...attempts]
    .sort((a, b) => b.finishedAt - a.finishedAt || b.id.localeCompare(a.id))
    .slice(MAX_ATTEMPTS_PER_SKILL)
    .map((a) => a.id);
}

/**
 * The attempt whose result is the skill's starting point: the latest finished
 * one at the current form (ADR-0011 §3, derived at read time).
 */
export function latestAttempt(
  attempts: LevelCheckAttempt[],
  form: { id: string; version: number },
): LevelCheckAttempt | undefined {
  return attempts
    .filter((a) => a.formId === form.id && a.formVersion === form.version)
    .reduce<LevelCheckAttempt | undefined>(
      (latest, a) =>
        latest === undefined || a.finishedAt > latest.finishedAt ? a : latest,
      undefined,
    );
}

export function isSkill(value: unknown): value is Skill {
  return SKILLS.includes(value as Skill);
}

function isSessionId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^s-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      value,
    )
  );
}

function isId(value: unknown): value is string {
  return (
    typeof value === "string" && /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/.test(value)
  );
}

function parseAnswers(value: unknown): Record<string, Answer> | undefined {
  if (!isRecord(value)) return undefined;
  const answers: Record<string, Answer> = {};
  for (const [key, answer] of Object.entries(value)) {
    if (typeof answer === "string") answers[key] = answer;
    else if (isStringList(answer)) answers[key] = [...answer];
    else return undefined;
  }
  return answers;
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
