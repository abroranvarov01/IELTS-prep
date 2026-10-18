import type { ScoredPosition } from "@/entities/level-check";
import { type ReadingTest, questionUnits } from "@/entities/reading";

/**
 * The checking module's outcomes per position with each position's question
 * type, as the level rules read them (ADR-0011 §4): the form says the type,
 * the checking result the outcome.
 */
export function scoredPositions(
  form: ReadingTest,
  outcomes: Record<number, ScoredPosition["outcome"]>,
): ScoredPosition[] {
  return questionUnits(form).flatMap((unit) =>
    unit.numbers.map((number) => ({
      number,
      type: unit.group.type,
      outcome: outcomes[number] ?? "unanswered",
    })),
  );
}
