/**
 * The guest's goal: the two onboarding answers (USER_FLOWS.md, Onboarding and
 * home flows). Either answer may still be missing. "unknown" is the
 * "I don't know yet" answer, which is a full answer, not a missing one.
 */
export const EXAM_TYPES = ["academic", "general", "unknown"] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

/**
 * Target bands as shown to the user, in IELTS notation in every language
 * ("6.5", never "6,5"), so they are strings and never locale-formatted.
 */
export const TARGET_BANDS = [
  "6.0",
  "6.5",
  "7.0",
  "7.5",
  "8+",
  "unknown",
] as const;
export type TargetBand = (typeof TARGET_BANDS)[number];

export type Goal = {
  examType?: ExamType;
  targetBand?: TargetBand;
};

export function isExamType(value: unknown): value is ExamType {
  return EXAM_TYPES.includes(value as ExamType);
}

export function isTargetBand(value: unknown): value is TargetBand {
  return TARGET_BANDS.includes(value as TargetBand);
}

/** Onboarding is complete once both questions are answered (step 3 is only an invitation). */
export function isGoalComplete(goal: Goal): boolean {
  return goal.examType !== undefined && goal.targetBand !== undefined;
}

// Stored form (ADR-0003): "v1|<examType>|<targetBand>", an empty part when unanswered.
const VERSION = "v1";
const SEPARATOR = "|";

export function serializeGoal(goal: Goal): string {
  return [VERSION, goal.examType ?? "", goal.targetBand ?? ""].join(SEPARATOR);
}

/**
 * Reads a stored goal. The value is untrusted (ADR-0003): another version or a
 * malformed value reads as no answers, and an unknown answer reads as that
 * question unanswered. Never throws.
 */
export function parseGoal(stored: string | undefined): Goal {
  const parts = stored?.split(SEPARATOR);
  if (parts?.length !== 3 || parts[0] !== VERSION) return {};
  const [, examType, targetBand] = parts;
  return {
    ...(isExamType(examType) && { examType }),
    ...(isTargetBand(targetBand) && { targetBand }),
  };
}
