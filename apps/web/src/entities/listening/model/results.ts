import type { ListeningAttempt, ResultRecord } from "./attempts";
import type { ListeningTest } from "./content";
import { type Outcome, checkUnits } from "./scoring";
import type { QuestionUnit } from "./units";

// What the Listening results page shows for an attempt (LISTENING_EXPERIENCE.md,
// Results page (M9); ADR-0009 §7, as Reading's). Pure: the page reads and
// writes the records.

/** The key revision and checking-rules version a result was made with. */
export type CheckPair = { keyRevision: number; rulesVersion: number };

/** A correction notice: the earlier score when the score changed, none when only answers or notes changed. */
export type Correction = { earlierScore?: number };

/** What the learner sees for an answer unit. */
export type UnitOutcome =
  "correct" | "partlyCorrect" | "incorrect" | "unanswered";

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

/**
 * The unit's outcome from its positions' outcomes: correct when every mark
 * was earned, no answer when nothing was given, partly correct when some
 * marks were earned. Positions only count marks; they never name an answer.
 */
export function unitOutcome(outcomes: Outcome[]): UnitOutcome {
  const correct = outcomes.filter((o) => o === "correct").length;
  if (correct === outcomes.length) return "correct";
  if (outcomes.every((o) => o === "unanswered")) return "unanswered";
  return correct === 0 ? "incorrect" : "partlyCorrect";
}

/** The test's answer units (a "List TWO" question once) with their outcomes, in question order. */
export function unitOutcomes(
  test: ListeningTest,
  record: ResultRecord,
): { unit: QuestionUnit; outcome: UnitOutcome }[] {
  return checkUnits(test).map((unit) => ({
    unit,
    outcome: unitOutcome(
      unit.numbers.map((n) => record.outcomes[n] ?? ("unanswered" as Outcome)),
    ),
  }));
}

/** Which review the results page offers; its button names it (as Reading's D8). */
export type ReviewOffer =
  "mistakesAndUnanswered" | "mistakes" | "unanswered" | "answers";

/**
 * Mistakes are units not fully correct (a partly correct item counts as
 * one); unanswered units are reviewed too, and named.
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

/** Whether the sitting was interrupted: an Exam with an audio failure (LD11). */
export function wasInterrupted(attempt: ListeningAttempt): boolean {
  return (
    attempt.finishReason === "audioFailed" ||
    (attempt.exam?.interruptions ?? 0) > 0
  );
}

function sortedEntries(record: Record<string, unknown>): [string, unknown][] {
  return Object.entries(record).sort(([a], [b]) => Number(a) - Number(b));
}
