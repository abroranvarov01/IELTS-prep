import type { ReactNode } from "react";

/**
 * The app's one icon style (DESIGN_SYSTEM.md, Icons): a 16 px grid, a 1.5 px
 * stroke with round ends, in the text color. Icons sit next to a label or are
 * named by their control, so they are hidden from screen readers. Slices draw
 * their own icons with it; the ones several layers use are below.
 */
export function LineIcon({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
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

export function CheckIcon({ className = "size-4" }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="m3.5 8.5 3 3 6-7" />
    </LineIcon>
  );
}

const CHEVRON = {
  left: "m10 3.5-4.5 4.5 4.5 4.5",
  right: "m6 3.5 4.5 4.5-4.5 4.5",
  down: "m3.5 6 4.5 4.5 4.5-4.5",
} as const;

export function ChevronIcon({
  direction,
  className = "size-4",
}: {
  direction: keyof typeof CHEVRON;
  className?: string;
}) {
  return (
    <LineIcon className={className}>
      <path d={CHEVRON[direction]} />
    </LineIcon>
  );
}

export function CloseIcon({ className = "size-4" }: { className?: string }) {
  return (
    <LineIcon className={className}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </LineIcon>
  );
}

/** "All questions": the question navigator. */
export function GridIcon() {
  return (
    <LineIcon className="size-4">
      <rect x="2.25" y="2.25" width="4.5" height="4.5" rx="1" />
      <rect x="9.25" y="2.25" width="4.5" height="4.5" rx="1" />
      <rect x="2.25" y="9.25" width="4.5" height="4.5" rx="1" />
      <rect x="9.25" y="9.25" width="4.5" height="4.5" rx="1" />
    </LineIcon>
  );
}
