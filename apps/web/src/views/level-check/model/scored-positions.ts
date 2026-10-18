import type { ScoredPosition } from "@/entities/level-check";
import {
  type ListeningTest,
  questionUnits as listeningUnits,
} from "@/entities/listening";
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

/**
 * The same for the Listening section (ADR-0014 §7). Listening matching
 * (`matchingFeatures` in the contract) is named "matching", as the
 * "Practise first" names are (USER_FLOWS.md, Interface copy (M9)).
 */
export function listeningScoredPositions(
  form: ListeningTest,
  outcomes: Record<number, ScoredPosition["outcome"]>,
): ScoredPosition[] {
  return listeningUnits(form).flatMap((unit) =>
    unit.numbers.map((number) => ({
      number,
      type:
        unit.group.type === "matchingFeatures" ? "matching" : unit.group.type,
      outcome: outcomes[number] ?? "unanswered",
    })),
  );
}
