/**
 * The brand's line motif (DESIGN_SYSTEM.md, Arc motif): two concentric blush
 * arcs, clipped by their container. Decorative only; never behind text that
 * must be read.
 */
export function ArcMotif({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      className={`pointer-events-none absolute ${className}`}
      fill="none"
      strokeWidth="2"
    >
      <circle
        cx="60"
        cy="60"
        r="58"
        vectorEffect="non-scaling-stroke"
        className="stroke-brand-blush"
      />
      <circle
        cx="60"
        cy="60"
        r="38"
        vectorEffect="non-scaling-stroke"
        className="stroke-brand-blush"
      />
    </svg>
  );
}
