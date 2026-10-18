import type { LevelCheckState } from "@/entities/level-check";

/** The one thing home recommends doing now (USER_FLOWS.md, Returning user → home; Level check flows). */
export type NextAction =
  | { kind: "levelCheck" }
  | { kind: "continueLevelCheck" }
  | { kind: "practiseReading" }
  | { kind: "practiseListening" }
  | { kind: "practiseBoth" };

/**
 * Rule 1 (M3): with no practice history on this device, the next action is
 * the level check, whatever the exam type and target band. A section left
 * in progress is continued first; once a section is done, the next action is
 * that skill's practice (M7, LEVEL_CHECK.md D11), and with both done the
 * Practice Hub without a skill (owner decision F2: choosing one is M11's).
 * Rules that use practice history arrive with the milestones that create it
 * (M11).
 */
export function nextAction(levelCheck: LevelCheckState): NextAction {
  const { reading, listening } = levelCheck;
  if (reading === "inProgress" || listening === "inProgress")
    return { kind: "continueLevelCheck" };
  if (reading === "done" && listening === "done")
    return { kind: "practiseBoth" };
  if (reading === "done") return { kind: "practiseReading" };
  if (listening === "done") return { kind: "practiseListening" };
  return { kind: "levelCheck" };
}
