import type { ReactNode } from "react";
import { ArcMotif } from "./ArcMotif";

/**
 * A soft brand surface (DESIGN_SYSTEM.md, Accent panel): `brand.blushSoft`
 * with two quiet blush arcs in one corner. For the one focal block of an
 * onboarding step or of home, never for every section.
 */
export function AccentPanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-brand-blush-soft p-4">
      <ArcMotif className="-top-12 -right-12 size-[10rem]" />
      <div className="relative">{children}</div>
    </div>
  );
}
