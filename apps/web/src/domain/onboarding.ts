import type { Goal } from "./goal";

export type OnboardingQuestion = "exam" | "band";

/** Home sends a user without a complete goal to the first unanswered question (USER_FLOWS.md). */
export function firstUnansweredQuestion(
  goal: Goal,
): OnboardingQuestion | undefined {
  if (goal.examType === undefined) return "exam";
  if (goal.targetBand === undefined) return "band";
  return undefined;
}

/**
 * "Not now" adds this to the home address. Home then never sends the user
 * back into onboarding, even when the browser did not keep the goal cookie
 * (ADR-0003: no loop when cookies are blocked).
 */
export const LATER = { param: "onboarding", value: "later" } as const;
