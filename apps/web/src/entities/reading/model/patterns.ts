import type { ReadingAttempt, ResultRecord } from "./attempts";
import { type ReadingTest, STATEMENT_ANSWERS } from "./content";
import type { AnswerKey } from "./parse-content";
import { unitOutcomes } from "./results";
import type { Signal, UnitOutcome } from "./scoring";
import type { QuestionUnit } from "./units";

// Repeated mistakes (READING_EXPERIENCE.md, Error Intelligence (M5)): what
// the first try's observable signals and the key's content tags show, counted
// in answer units. A proposed product heuristic (D15), never a diagnosis: it
// says what happened in the questions, never why.

/** The categories, in the order that breaks ties. */
export const PATTERN_CATEGORIES = [
  "ngFalse",
  "ngTrue",
  "oneLetterAway",
  "wordLimit",
  "notFromPassage",
  "pins",
  "paraphrase",
  "qualifier",
] as const;
export type PatternCategory = (typeof PATTERN_CATEGORIES)[number];

/** A category seen in at least 3 answer units of at least 2 question groups (D15). */
const MIN_UNITS = 3;
const MIN_GROUPS = 2;
/** The results page shows at most this many (READING_EXPERIENCE.md). */
const MAX_SHOWN = 2;

export type Pattern = {
  category: PatternCategory;
  /** The units where it happened (a "choose several" item once). */
  units: QuestionUnit[];
  /** The units where it could have happened (its opportunities). */
  total: number;
};

const NOT_GIVEN = "NOT GIVEN";

/**
 * The repeated mistakes of a first try, from its record for the current key
 * revision and rules version: at most two, most units first, ties in the
 * categories' order. Unanswered units belong to no category. Empty when no
 * category reaches the threshold.
 */
export function repeatedMistakes(
  test: ReadingTest,
  key: AnswerKey,
  attempt: ReadingAttempt,
  record: ResultRecord,
): Pattern[] {
  const answered = unitOutcomes(test, attempt, record).filter(
    ({ outcome }) => outcome !== "unanswered",
  );
  return PATTERN_CATEGORIES.map((category): Pattern & { groups: number } => {
    const opportunities = answered.filter(({ unit }) =>
      isOpportunity(category, unit, key, attempt),
    );
    const units = opportunities
      .filter(({ unit, outcome }) =>
        happened(category, record.signals[unit.key] ?? [], outcome),
      )
      .map(({ unit }) => unit);
    return {
      category,
      units,
      total: opportunities.length,
      groups: new Set(units.map((unit) => unit.group.id)).size,
    };
  })
    .filter((p) => p.units.length >= MIN_UNITS && p.groups >= MIN_GROUPS)
    .sort((a, b) => b.units.length - a.units.length)
    .slice(0, MAX_SHOWN)
    .map(({ category, units, total }) => ({ category, units, total }));
}

/** Whether the category could have happened in an answered unit. */
function isOpportunity(
  category: PatternCategory,
  unit: QuestionUnit,
  key: AnswerKey,
  attempt: ReadingAttempt,
): boolean {
  const entry = key.answers[unit.numbers[0] ?? 0];
  const expected = entry?.accept[0];
  const { group } = unit;
  switch (category) {
    case "ngFalse":
    case "ngTrue": {
      if (group.type !== "trueFalseNotGiven" && group.type !== "yesNoNotGiven")
        return false;
      const [positive, negative] = STATEMENT_ANSWERS[group.type];
      return (
        expected === NOT_GIVEN ||
        expected === (category === "ngFalse" ? negative : positive)
      );
    }
    case "oneLetterAway":
    case "wordLimit":
      return unit.kind === "text";
    case "notFromPassage":
      return unit.kind === "text" && entry?.fromPassage === true;
    case "pins":
      return (
        attempt.mode === "practice" &&
        unit.numbers.some((n) => (attempt.pins[String(n)] ?? []).length > 0) &&
        expected !== NOT_GIVEN &&
        (entry?.evidence.length ?? 0) > 0
      );
    case "paraphrase":
    case "qualifier":
      return entry?.trap === category;
  }
}

/** Whether it happened in an opportunity: its signal, or a tagged unit not fully correct. */
function happened(
  category: PatternCategory,
  signals: Signal[],
  outcome: UnitOutcome,
): boolean {
  const has = (...codes: Signal["code"][]) =>
    signals.some((s) => codes.includes(s.code));
  switch (category) {
    case "ngFalse":
      return has("ngInsteadOfFalse", "falseInsteadOfNg");
    case "ngTrue":
      return has("ngInsteadOfTrue", "trueInsteadOfNg");
    case "oneLetterAway":
      return has("oneLetterAway");
    case "wordLimit":
      return has("wordLimit");
    case "notFromPassage":
      return has("notFromPassage");
    case "pins":
      return has("pinnedElsewhere");
    case "paraphrase":
    case "qualifier":
      return outcome !== "correct";
  }
}

/** What "Mistakes that repeated" shows on a test attempt's results. */
export type PatternsView =
  /** The first try on this device is not known: nothing is looked for. */
  | { kind: "unknownFirstTry" }
  /** The first try is from an earlier content version: never mixed with this one. */
  | { kind: "unavailable" }
  | {
      kind: "patterns";
      /** "thisTry" when the attempt shown is the first try itself. */
      scope: "thisTry" | "firstTry";
      firstTryId: string;
      patterns: Pattern[];
    };

/**
 * Repeated mistakes use only the test's first try (D15, ADR-0009 §5):
 * stored, never guessed, and checked with the current key revision and rules
 * version (`firstRecord`) before anything is derived.
 */
export function patternsView(
  test: ReadingTest,
  key: AnswerKey,
  shownId: string,
  first: { attempt: ReadingAttempt; record?: ResultRecord } | undefined,
): PatternsView {
  if (!first) return { kind: "unknownFirstTry" };
  if (first.attempt.testVersion !== test.version || !first.record)
    return { kind: "unavailable" };
  return {
    kind: "patterns",
    scope: first.attempt.id === shownId ? "thisTry" : "firstTry",
    firstTryId: first.attempt.id,
    patterns: repeatedMistakes(test, key, first.attempt, first.record),
  };
}
