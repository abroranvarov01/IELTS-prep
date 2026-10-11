import type { UnitOutcome } from "@/entities/reading";

/**
 * An outcome's shape (DESIGN_SYSTEM.md, M5 components: status). Always shown
 * next to its word, so it is hidden from screen readers; only "correct" uses
 * a status color, the others are told apart by shape.
 */
export function OutcomeIcon({
  outcome,
  size = 20,
}: {
  outcome: UnitOutcome;
  size?: 16 | 20;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className="shrink-0"
    >
      {outcome === "correct" && (
        <>
          <circle cx="10" cy="10" r="9" className="fill-status-correct" />
          <path
            d="M6 10.5l2.7 2.7L14.2 7.5"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-surface-base"
          />
        </>
      )}
      {outcome === "incorrect" && (
        <>
          <circle
            cx="10"
            cy="10"
            r="8.5"
            fill="none"
            strokeWidth="1.5"
            className="stroke-ink"
          />
          <path
            d="M7 7l6 6M13 7l-6 6"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-ink"
          />
        </>
      )}
      {outcome === "unanswered" && (
        <>
          <circle
            cx="10"
            cy="10"
            r="8.5"
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="3 2.4"
            className="stroke-text-secondary"
          />
          <path
            d="M6.5 10h7"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-text-secondary"
          />
        </>
      )}
      {outcome === "partlyCorrect" && (
        <>
          <path d="M10 1a9 9 0 0 0 0 18z" className="fill-status-correct" />
          <circle
            cx="10"
            cy="10"
            r="8.5"
            fill="none"
            strokeWidth="1.5"
            className="stroke-ink"
          />
        </>
      )}
    </svg>
  );
}
