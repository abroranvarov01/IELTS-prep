import type { ReactNode } from "react";

/** Navigation that looks like a button but never competes with the red action (DESIGN_SYSTEM.md, M4). */
export function SecondaryButton({
  onClick,
  expanded,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  /** For a disclosure ("Explain simpler"): whether what it shows is open. */
  expanded?: boolean;
  /** Unavailable, as disabled options look (DESIGN_SYSTEM.md, M9: audio unavailable). */
  disabled?: boolean;
  /** When the visible label alone does not say enough ("Play from Part 2, …"). */
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border-control bg-surface-base px-4 py-3 font-medium transition-colors hover:border-ink active:bg-surface-warm disabled:border-border-subtle disabled:text-text-tertiary disabled:hover:border-border-subtle"
    >
      {children}
    </button>
  );
}
