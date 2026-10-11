import type { ReadingAttempt, ResultRecord } from "./attempts";
import type { ReadingTest } from "./content";
import { type QuestionUnit, questionUnits } from "./units";
import { type Outcome, type UnitOutcome, unitOutcome } from "./scoring";

// What the results page shows for an attempt (READING_EXPERIENCE.md, Results
// page (M5); ADR-0009 §7). Pure: the page reads and writes the records.

/** The key revision and checking-rules version a result was made with. */
export type CheckPair = { keyRevision: number; rulesVersion: number };

/** A correction notice: the earlier score when the score changed, none when only answers or notes changed. */
export type Correction = { earlierScore?: number };

/**
 * The record of the current pair and, when a correction changed something the
 * learner sees (the score, an outcome or a note) against the most recent
 * earlier record, the notice to show. Undefined until the current pair has a
 * record.
 */
export function currentResult(
  records: ResultRecord[],
  pair: CheckPair,
): { record: ResultRecord; correction?: Correction } | undefined {
  const record = records.find(
    (r) =>
      r.keyRevision === pair.keyRevision &&
      r.rulesVersion === pair.rulesVersion,
  );
  if (!record) return undefined;
  const earlier = records
    .filter((r) => r !== record)
    .sort((a, b) => b.checkedAt - a.checkedAt)[0];
  if (!earlier) return { record };
  if (earlier.score.marks !== record.score.marks)
    return { record, correction: { earlierScore: earlier.score.marks } };
  const visible = (r: ResultRecord) =>
    JSON.stringify([sortedEntries(r.outcomes), sortedEntries(r.signals)]);
  return visible(earlier) === visible(record)
    ? { record }
    : { record, correction: {} };
}

/** The most recent record, whatever its pair (an attempt of an earlier content version). */
export function latestRecord(
  records: ResultRecord[],
): ResultRecord | undefined {
  return [...records].sort((a, b) => b.checkedAt - a.checkedAt)[0];
}

/** "Not correct: 9 · No answer: 4", counted in scoring positions. */
export function positionCounts(record: ResultRecord): {
  incorrect: number;
  unanswered: number;
} {
  const outcomes = Object.values(record.outcomes);
  return {
    incorrect: outcomes.filter((o) => o === "incorrect").length,
    unanswered: outcomes.filter((o) => o === "unanswered").length,
  };
}

/** Which review the results page offers; its button names it (D8). */
export type ReviewOffer =
  "mistakesAndUnanswered" | "mistakes" | "unanswered" | "answers";

/** The attempt's answer units with their outcomes, in question order. */
export function unitOutcomes(
  test: ReadingTest,
  attempt: ReadingAttempt,
  record: ResultRecord,
): { unit: QuestionUnit; outcome: UnitOutcome }[] {
  return questionUnits(test)
    .filter(
      (unit) =>
        !attempt.questions ||
        unit.numbers.every((n) => attempt.questions?.includes(n)),
    )
    .map((unit) => ({
      unit,
      outcome: unitOutcome(
        unit.numbers.map(
          (n) => record.outcomes[n] ?? ("unanswered" as Outcome),
        ),
      ),
    }));
}

/**
 * Mistakes are units not fully correct (a partly correct "choose several"
 * item counts as one); unanswered units are reviewed too, and named.
 */
export function reviewOffer(units: { outcome: UnitOutcome }[]): ReviewOffer {
  const mistakes = units.some(
    (u) => u.outcome === "incorrect" || u.outcome === "partlyCorrect",
  );
  const unanswered = units.some((u) => u.outcome === "unanswered");
  if (mistakes && unanswered) return "mistakesAndUnanswered";
  if (mistakes) return "mistakes";
  return unanswered ? "unanswered" : "answers";
}

function sortedEntries(record: Record<string, unknown>): [string, unknown][] {
  return Object.entries(record).sort(([a], [b]) => Number(a) - Number(b));
}
