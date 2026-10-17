/** The 20 px info icon of notes (DESIGN_SYSTEM.md, M5 components): `ink`, never a status color. */
export function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width={20}
      height={20}
      className="shrink-0"
    >
      <circle
        cx="10"
        cy="10"
        r="8.5"
        fill="none"
        strokeWidth="1.5"
        className="stroke-ink"
      />
      <path
        d="M10 9v5M10 6.2v.1"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-ink"
      />
    </svg>
  );
}
