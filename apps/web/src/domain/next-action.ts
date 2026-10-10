/** The one thing home recommends doing now (USER_FLOWS.md, Returning user → home). */
export type NextAction = { kind: "levelCheck" };

/**
 * Rule 1 (M3): with no practice history on this device, the next action is
 * the level check, whatever the exam type and target band. Rules that use
 * practice history arrive with the milestones that create it (M4 onward).
 */
export function nextAction(): NextAction {
  return { kind: "levelCheck" };
}
