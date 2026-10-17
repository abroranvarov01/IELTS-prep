import type { ReactNode } from "react";

/** Navigation that looks like a button but never competes with the red action (DESIGN_SYSTEM.md, M4). */
export function SecondaryButton({
  onClick,
  expanded,
  children,
}: {
  onClick: () => void;
  /** For a disclosure ("Explain simpler"): whether what it shows is open. */
  expanded?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border-control bg-surface-base px-4 py-3 font-medium transition-colors hover:border-ink active:bg-surface-warm"
    >
      {children}
    </button>
  );
}
