/**
 * Home's own picture for the level check (owner, M6-04: Home option (a)):
 * a path from where the learner starts, through their level, to the target.
 * Not the onboarding's skills picture, so a returning learner sees their home,
 * not step 3 again. Desktop only; decorative.
 */
export function StartingPointPicture() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 352 352"
      className="mx-auto block size-[22rem]"
    >
      <path
        d="M64 288C112 214 136 272 176 208S232 132 268 104"
        fill="none"
        strokeWidth="4"
        strokeDasharray="8 10"
        strokeLinecap="round"
        className="stroke-brand-blush"
      />
      {/* The start: a flag. */}
      <circle cx="64" cy="288" r="32" className="fill-surface-base" />
      <path
        d="M55 304V272M55 274h20l-5 8 5 8H55"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-brand-primary-deep"
      />
      {/* The level: three rising bars. */}
      <circle
        cx="176"
        cy="208"
        r="52"
        strokeWidth="8"
        className="fill-surface-base stroke-brand-blush"
      />
      <rect
        x="152"
        y="212"
        width="12"
        height="20"
        rx="2"
        className="fill-brand-primary"
      />
      <rect
        x="170"
        y="200"
        width="12"
        height="32"
        rx="2"
        className="fill-brand-primary"
      />
      <rect
        x="188"
        y="186"
        width="12"
        height="46"
        rx="2"
        className="fill-brand-primary"
      />
      {/* The target. */}
      <circle cx="268" cy="104" r="44" className="fill-surface-base" />
      <circle cx="268" cy="104" r="30" className="fill-brand-blush" />
      <circle cx="268" cy="104" r="17" className="fill-surface-base" />
      <circle cx="268" cy="104" r="7" className="fill-brand-primary" />
    </svg>
  );
}
