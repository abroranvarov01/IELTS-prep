import type { SectionState } from "@/entities/level-check";

/** The one thing home recommends doing now (USER_FLOWS.md, Returning user → home; Level check flows). */
export type NextAction =
  { kind: "levelCheck" } | { kind: "continueLevelCheck" };

/**
 * Rule 1 (M3): with no practice history on this device, the next action is
 * the level check, whatever the exam type and target band. A level check
 * left in progress is continued first (M7). Rules that use practice history
 * arrive with the milestones that create it (M11).
 */
export function nextAction(levelCheck: SectionState): NextAction {
  return levelCheck === "inProgress"
    ? { kind: "continueLevelCheck" }
    : { kind: "levelCheck" };
}
