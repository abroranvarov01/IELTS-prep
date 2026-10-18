import type { ListeningAttempt, ResultRecord } from "./attempts";
import type { ListeningTest } from "./content";
import { unitOutcomes } from "./results";
import { checkUnits } from "./scoring";

// Trying Listening questions again (LISTENING_EXPERIENCE.md, Targeted
// practice (M9), Reading's D16): which questions of a test attempt may be
// retried, and whether a retry address may start.

/**
 * Every question number of the attempt's units that were not fully correct or
 * unanswered, in order: whole units, each once (a "List TWO" question counts
 * its positions even when one of them earned a mark).
 */
export function retryQuestions(
  test: ListeningTest,
  record: ResultRecord,
): number[] {
  return unitOutcomes(test, record)
    .filter(({ outcome }) => outcome !== "correct")
    .flatMap(({ unit }) => unit.numbers);
}

/** Why a retry address cannot start, as its safe state says. */
export type RetryProblem = "sourceMissing" | "sourceOldVersion" | "notAllowed";

/**
 * Validates a retry address (`?of={id}&q={numbers}`) against its source: a
 * stored test attempt of the current content version and its record for the
 * current key revision and rules version. The numbers ("2,4,37") are
 * expanded to whole units, each once, and every unit must be one the source
 * did not get fully correct.
 */
export function validateRetry(
  test: ListeningTest,
  source: ListeningAttempt | undefined,
  record: ResultRecord | undefined,
  requested: string | null,
): { ok: true; questions: number[] } | { ok: false; problem: RetryProblem } {
  if (!source) return { ok: false, problem: "sourceMissing" };
  if (source.kind !== "test") return { ok: false, problem: "notAllowed" };
  if (source.testVersion !== test.version)
    return { ok: false, problem: "sourceOldVersion" };
  if (!record || !requested) return { ok: false, problem: "notAllowed" };
  const allowed = new Set(retryQuestions(test, record));
  const all = checkUnits(test);
  const units = new Set(
    requested.split(",").map((part) => {
      const n = /^\d+$/.test(part) ? Number(part) : NaN;
      return all.find((unit) => unit.numbers.includes(n));
    }),
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
