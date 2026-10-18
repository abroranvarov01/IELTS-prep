import { SKILLS, type Skill, isSkill } from "./records";

// What Home may know about the check without reading the device (ADR-0011
// §5): the state of each skill's section and nothing else. Kept in a
// server-managed cookie, as the goal is (ADR-0003).

export const SECTION_STATES = ["none", "inProgress", "done"] as const;
export type SectionState = (typeof SECTION_STATES)[number];

export type LevelCheckState = Record<Skill, SectionState>;

export const NO_LEVEL_CHECK: LevelCheckState = {
  reading: "none",
  listening: "none",
};

export function isSectionState(value: unknown): value is SectionState {
  return SECTION_STATES.includes(value as SectionState);
}

// Stored form: "v1|reading=done|listening=none".
const VERSION = "v1";
const SEPARATOR = "|";

export function serializeLevelCheckState(state: LevelCheckState): string {
  return [VERSION, ...SKILLS.map((skill) => `${skill}=${state[skill]}`)].join(
    SEPARATOR,
  );
}

/**
 * Reads the stored state. The value is untrusted: another version or a
 * malformed value reads as no check, and an unknown part reads as "none" for
 * its skill. Never throws.
 */
export function parseLevelCheckState(
  stored: string | undefined,
): LevelCheckState {
  const [version, ...parts] = stored?.split(SEPARATOR) ?? [];
  if (version !== VERSION) return { ...NO_LEVEL_CHECK };
  const state = { ...NO_LEVEL_CHECK };
  for (const part of parts) {
    const [skill, value] = part.split("=");
    if (isSkill(skill) && isSectionState(value)) state[skill] = value;
  }
  return state;
}
