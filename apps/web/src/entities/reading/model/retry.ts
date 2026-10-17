import type { ReadingAttempt, ResultRecord } from "./attempts";
import type { ReadingTest } from "./content";
import { unitOutcomes } from "./results";
import { questionUnits, unitOf } from "./units";

// Trying questions again (READING_EXPERIENCE.md, Targeted practice (M5);
// ADR-0009 §8): which questions of a test attempt may be retried, and whether
// a retry address may start.

/**
 * Every question number of the attempt's units that were not fully correct or
 * unanswered, in order: whole units, each once (22–23 counts 2 positions even
 * when one of them earned a mark).
 */
export function retryQuestions(
  test: ReadingTest,
  attempt: ReadingAttempt,
  record: ResultRecord,
): number[] {
  return unitOutcomes(test, attempt, record)
    .filter(({ outcome }) => outcome !== "correct")
    .flatMap(({ unit }) => unit.numbers);
}

/** Why a retry address cannot start, as its safe state says. */
export type RetryProblem = "sourceMissing" | "sourceOldVersion" | "notAllowed";

/**
 * Validates a retry address (`?of={id}&q={numbers}`) against its source: a
 * stored test attempt of the current content version and its record for the
 * current key revision and rules version. The numbers ("2,4,22") are
 * expanded to whole units, each once, and every unit must be one the source
 * did not get fully correct.
 */
export function validateRetry(
  test: ReadingTest,
  source: ReadingAttempt | undefined,
  record: ResultRecord | undefined,
  requested: string | null,
): { ok: true; questions: number[] } | { ok: false; problem: RetryProblem } {
  if (!source) return { ok: false, problem: "sourceMissing" };
  if (source.kind !== "test") return { ok: false, problem: "notAllowed" };
  if (source.testVersion !== test.version)
    return { ok: false, problem: "sourceOldVersion" };
  if (!record || !requested) return { ok: false, problem: "notAllowed" };
  const allowed = new Set(retryQuestions(test, source, record));
  const all = questionUnits(test);
  const units = new Set(
    requested
      .split(",")
      .map((part) => unitOf(all, /^\d+$/.test(part) ? Number(part) : NaN)),
  );
  if (
    units.has(undefined) ||
    [...units].some((unit) => !unit?.numbers.every((n) => allowed.has(n)))
  )
    return { ok: false, problem: "notAllowed" };
  return {
    ok: true,
    questions: [...units]
      .flatMap((unit) => unit?.numbers ?? [])
      .sort((a, b) => a - b),
  };
}
