import type { ReactNode } from "react";

/**
 * A soft brand surface (DESIGN_SYSTEM.md, Accent panel): `brand.blushSoft`
 * with two quiet blush arcs in one corner. For the one focal block of an
 * onboarding step or of home, never for every section.
 */
export function AccentPanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-brand-blush-soft p-4">
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="pointer-events-none absolute -top-12 -right-12 size-[10rem]"
        fill="none"
        strokeWidth="2"
      >
        <circle cx="60" cy="60" r="58" className="stroke-brand-blush" />
        <circle cx="60" cy="60" r="38" className="stroke-brand-blush" />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
