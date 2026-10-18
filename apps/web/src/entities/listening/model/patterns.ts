import type { ListeningAttempt, ResultRecord } from "./attempts";
import type { KeyEntry, ListeningKey, ListeningTest } from "./content";
import { type UnitOutcome, unitOutcomes } from "./results";
import type { Signal } from "./scoring";
import type { QuestionUnit } from "./units";

// Repeated Listening mistakes (LISTENING_EXPERIENCE.md, Error Intelligence
// (M9)): what the first try's observable signals and the key's content tags
// show, counted in answer units. A product heuristic, labelled as one, never
// a diagnosis (owner decision LD15): it says what happened in the questions,
// never why, and finding none never means there is nothing to work on.

/** The categories, in the order that breaks ties. */
export const PATTERN_CATEGORIES = [
  "oneLetterAway",
  "wordLimit",
  "notInTranscript",
  "numbers",
  "mentionedOption",
  "correction",
  "spelledOut",
  "paraphrase",
] as const;
export type PatternCategory = (typeof PATTERN_CATEGORIES)[number];

/** A category seen in at least 3 answer units of at least 2 question groups (LD15, as Reading's D15). */
const MIN_UNITS = 3;
const MIN_GROUPS = 2;
/** The results page shows at most this many. */
const MAX_SHOWN = 2;

export type Pattern = {
  category: PatternCategory;
  /** The units where it happened (a several-answer unit once). */
  units: QuestionUnit[];
  /** The units where it could have happened (its opportunities). */
  total: number;
};

/**
 * The repeated mistakes of a first try, from its record for the current key
 * revision and rules version: at most two, most units first, ties in the
 * categories' order. Unanswered units belong to no category. Empty when no
 * category reaches the threshold.
 */
export function repeatedMistakes(
  test: ListeningTest,
  key: ListeningKey,
  record: ResultRecord,
): Pattern[] {
  const answered = unitOutcomes(test, record).filter(
    ({ outcome }) => outcome !== "unanswered",
  );
  return PATTERN_CATEGORIES.map((category): Pattern & { groups: number } => {
    const opportunities = answered.filter(({ unit }) =>
      isOpportunity(category, unit, entriesOf(unit, key)),
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

function entriesOf(unit: QuestionUnit, key: ListeningKey): KeyEntry[] {
  return unit.numbers
    .map((n) => key.answers[n])
    .filter((e): e is KeyEntry => e !== undefined);
}

/** Whether the category could have happened in an answered unit. */
function isOpportunity(
  category: PatternCategory,
  unit: QuestionUnit,
  entries: KeyEntry[],
): boolean {
  const typed = unit.kind === "text";
  switch (category) {
    case "oneLetterAway":
    case "wordLimit":
      return typed;
    case "notInTranscript":
      return typed && entries.some((e) => e.fromRecording);
    case "numbers":
      // Defined by the key: an accepted answer has a digit (a fact about the question).
      return typed && entries.some((e) => e.accept.some((a) => /\d/.test(a)));
    case "mentionedOption":
      return entries.some((e) =>
        (e.distractors ?? []).some((d) => d.review === "verified"),
      );
    case "correction":
    case "spelledOut":
    case "paraphrase":
      return entries[0]?.tag === category;
  }
}

/** Whether it happened in an opportunity: its signal, or a unit not fully correct. */
function happened(
  category: PatternCategory,
  signals: Signal[],
  outcome: UnitOutcome,
): boolean {
  const has = (code: Signal["code"]) => signals.some((s) => s.code === code);
  switch (category) {
    case "oneLetterAway":
    case "wordLimit":
    case "notInTranscript":
    case "mentionedOption":
      return has(category);
    case "numbers":
    case "correction":
    case "spelledOut":
    case "paraphrase":
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
 * Repeated mistakes use only the test's first try (ADR-0014 §3, as
 * ADR-0009 §5): stored, never guessed, and checked with the current key
 * revision and rules version (`record`) before anything is derived.
 */
export function patternsView(
  test: ListeningTest,
  key: ListeningKey,
  shownId: string,
  first: { attempt: ListeningAttempt; record?: ResultRecord } | undefined,
): PatternsView {
  if (!first) return { kind: "unknownFirstTry" };
  if (first.attempt.testVersion !== test.version || !first.record)
    return { kind: "unavailable" };
  return {
    kind: "patterns",
    scope: first.attempt.id === shownId ? "thisTry" : "firstTry",
    firstTryId: first.attempt.id,
    patterns: repeatedMistakes(test, key, first.record),
  };
}
