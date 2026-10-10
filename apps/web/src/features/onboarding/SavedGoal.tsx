import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { readGoal } from "@/data/goal-cookie";
import type { Goal } from "@/domain/goal";

/**
 * Renders with the saved goal at request time. Use it inside <Suspense> whose
 * fallback is the same content without the goal: with cacheComponents only the
 * fallback is in the static HTML, so the step still works without JavaScript.
 */
export async function SavedGoal({
  children,
}: {
  children: (goal: Goal) => ReactNode;
}) {
  return children(readGoal(await cookies()));
}
