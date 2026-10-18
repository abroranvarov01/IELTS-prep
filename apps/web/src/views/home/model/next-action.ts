import type { SectionState } from "@/entities/level-check";

/** The one thing home recommends doing now (USER_FLOWS.md, Returning user → home; Level check flows). */
export type NextAction =
  | { kind: "levelCheck" }
  | { kind: "continueLevelCheck" }
  | { kind: "practiseReading" };

/**
 * Rule 1 (M3): with no practice history on this device, the next action is
 * the level check, whatever the exam type and target band. A level check
 * left in progress is continued first; once the Reading section is done, the
 * next action is Reading practice (M7, LEVEL_CHECK.md D11). Rules that use
 * practice history arrive with the milestones that create it (M11).
 */
export function nextAction(levelCheck: SectionState): NextAction {
  switch (levelCheck) {
    case "inProgress":
      return { kind: "continueLevelCheck" };
    case "done":
      return { kind: "practiseReading" };
    default:
      return { kind: "levelCheck" };
  }
}
