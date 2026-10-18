/**
 * The level check's result model (LEVEL_CHECK.md §5.1, approved at M7-05;
 * ADR-0011 §4): from the checked positions of a finished section to a
 * starting level on the product's own scale, the answered count and what to
 * practise first. Never a band: no type here can hold one, and nothing
 * converts a score (ielts-scoring rule).
 *
 * The inputs are plain scored positions, so this entity never imports the
 * Reading slice (BOUNDARIES.md: slices of one layer never import each
 * other); the page that owns the check runs the Reading checking module and
 * passes its outcomes here.
 */

/**
 * Increases whenever a change could alter a level or a suggestion for the
 * same outcomes: the thresholds, the insufficient-data rule or the
 * "practise first" rule. Each stored result records it (ADR-0011 §3).
 */
export const LEVEL_RULES_VERSION = 1;

/** One scoring position of the form, as the Reading checking module scores it. */
export type ScoredPosition = {
  number: number;
  /** The question type of the position's group (the Reading content contract's names). */
  type: string;
  outcome: "correct" | "incorrect" | "unanswered";
};

/** Three steps on the product's practice scale: product policy, not an IELTS rule. */
export type Level = 1 | 2 | 3;

export type LevelCheckResult = {
  kind: "levelCheckResult";
  /** Correct positions. */
  score: number;
  /** The form's positions. */
  total: number;
  /** Positions with an answer. */
  answered: number;
  /** "insufficient" when more than half of the positions had no answer. */
  level: Level | "insufficient";
  /** Up to two question types to practise first, the hardest first; none when insufficient. */
  practiseFirst: string[];
};

/** A type is suggested when the form has at least this many of its positions… */
const PRACTISE_FIRST_MIN_POSITIONS = 3;
/** …and at least this share of them were not correct. */
const PRACTISE_FIRST_MIN_SHARE = 0.5;
const PRACTISE_FIRST_MAX = 2;

export function levelCheckResult(
  positions: ScoredPosition[],
): LevelCheckResult {
  const total = positions.length;
  const score = positions.filter((p) => p.outcome === "correct").length;
  const answered = positions.filter((p) => p.outcome !== "unanswered").length;
  const insufficient = total - answered > total / 2;
  return {
    kind: "levelCheckResult",
    score,
    total,
    answered,
    level: insufficient ? "insufficient" : level(score, total),
    practiseFirst: insufficient ? [] : practiseFirst(positions),
  };
}

/**
 * Level 1 below half of the positions, level 2 from half, level 3 from three
 * quarters, each threshold rounded up: for a 14-question form 0–6, 7–10 and
 * 11–14 (LEVEL_CHECK.md D8).
 */
function level(score: number, total: number): Level {
  if (score >= Math.ceil(total * 0.75)) return 3;
  if (score >= Math.ceil(total * 0.5)) return 2;
  return 1;
}

/**
 * Observations by question type, never causes: the types with enough
 * positions and at least half of them not correct (unanswered counts as not
 * correct), the largest share first, then the type that appears first.
 */
function practiseFirst(positions: ScoredPosition[]): string[] {
  const byType = new Map<
    string,
    { first: number; count: number; missed: number }
  >();
  for (const position of positions) {
    const entry = byType.get(position.type) ?? {
      first: position.number,
      count: 0,
      missed: 0,
    };
    entry.first = Math.min(entry.first, position.number);
    entry.count += 1;
    if (position.outcome !== "correct") entry.missed += 1;
    byType.set(position.type, entry);
  }
  return [...byType.entries()]
    .filter(
      ([, { count, missed }]) =>
        count >= PRACTISE_FIRST_MIN_POSITIONS &&
        missed / count >= PRACTISE_FIRST_MIN_SHARE,
    )
    .sort(
      ([, a], [, b]) =>
        b.missed / b.count - a.missed / a.count || a.first - b.first,
    )
    .slice(0, PRACTISE_FIRST_MAX)
    .map(([type]) => type);
}
