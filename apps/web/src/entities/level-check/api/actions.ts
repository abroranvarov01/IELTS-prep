"use server";

import { cookies } from "next/headers";
import { type Skill, isSkill } from "../model/records";
import { isSectionState } from "../model/state";
import { readLevelCheckState, saveLevelCheckState } from "./state-cookie";

/**
 * Records a section's state in the cookie Home reads (ADR-0011 §5): called by
 * the section when it starts and when a finished section is committed.
 */
export async function setLevelCheckSectionState(
  skill: Skill,
  state: "inProgress" | "done",
): Promise<void> {
  // The arguments come from the client: nothing but known values is written.
  if (!isSkill(skill) || !isSectionState(state) || (state as string) === "none")
    return;
  const cookieStore = await cookies();
  saveLevelCheckState(cookieStore, {
    ...readLevelCheckState(cookieStore),
    [skill]: state,
  });
}
