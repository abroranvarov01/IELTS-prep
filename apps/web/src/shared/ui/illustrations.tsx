import type { ReactNode } from "react";

/**
 * A spot illustration (DESIGN_SYSTEM.md, Illustrations): the line-icon style
 * drawn on a 24 px grid with the same 1.5 px stroke, shown at 24–40 px in the
 * brand's deep red. Decorative: the text next to it carries the meaning.
 */
export function Illustration({
  className = "size-[1.75rem]",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}
