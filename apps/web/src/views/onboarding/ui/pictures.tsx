import type { TargetBand } from "@/entities/goal";
import { Illustration } from "@/shared/ui/illustrations";

/*
 * The onboarding pictures (DESIGN_SYSTEM.md, Onboarding composition): flat
 * shapes in the brand's reds and blush on the desktop panel, one per step.
 * Decorative: the question and the panel's text carry the meaning.
 */

/** Step 1: a graduation cap on a stack of books, a town with a clock tower behind. */
export function PathsPicture() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 260"
      className="w-full max-w-[26rem]"
    >
      <circle cx="180" cy="140" r="120" className="fill-surface-warm" />
      <g className="fill-brand-blush" opacity="0.7">
        <path d="M70 72 87 34l17 38v148H70z" />
        <rect x="38" y="138" width="34" height="82" rx="2" />
        <path d="M104 120l20-20 20 20v100h-40z" />
      </g>
      <circle cx="87" cy="96" r="9" className="fill-surface-warm" />
      {BOOKS.map(({ x, y, w, h, cover }) => (
        <g key={y}>
          <rect x={x} y={y} width={w} height={h} rx="5" className={cover} />
          <rect
            x={x + 16}
            y={y + 4}
            width={w - 20}
            height={h - 8}
            rx="2"
            className="fill-surface-base"
          />
          <path
            d={`M${x + 22} ${y + h / 2}h${w - 32}`}
            strokeWidth="1.5"
            className="stroke-border-subtle"
          />
        </g>
      ))}
      <path
        d="M182 116h76l-2 30q-36 14-72 0z"
        className="fill-brand-primary-deep"
      />
      <path
        d="M130 100 220 132 310 100v6l-90 32-90-32z"
        className="fill-brand-primary-deep"
      />
      <path d="M220 68 310 100l-90 32-90-32z" className="fill-brand-primary" />
      <path
        d="M220 100 292 112v46"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-brand-primary-deep"
      />
      <circle cx="220" cy="100" r="5" className="fill-brand-primary-deep" />
      <rect
        x="287"
        y="156"
        width="10"
        height="22"
        rx="3"
        className="fill-brand-primary-deep"
      />
    </svg>
  );
}

/** The stack under the cap, bottom first: a spine and the pages' edge each. */
const BOOKS = [
  { x: 128, y: 198, w: 176, h: 26, cover: "fill-brand-primary-deep" },
  { x: 142, y: 173, w: 156, h: 25, cover: "fill-brand-highlight" },
  { x: 134, y: 150, w: 160, h: 23, cover: "fill-brand-primary" },
];

/** Where each band sits around the target; bands are written the same in every language. */
const BAND_SPOTS = {
  "6.0": [40, 84],
  "6.5": [116, 52],
  "7.0": [292, 48],
  "7.5": [330, 124],
  "8+": [334, 200],
} as const;

/**
 * Step 2: a target with an arrow in its center and the bands around it. The
 * band the user chose, if any, is circled.
 */
export function TargetPicture({ band }: { band?: TargetBand }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 380 300"
      className="w-full max-w-[26rem]"
    >
      <circle cx="170" cy="196" r="98" className="fill-brand-blush" />
      <circle cx="170" cy="196" r="78" className="fill-surface-base" />
      <circle cx="170" cy="196" r="58" className="fill-brand-blush" />
      <circle cx="170" cy="196" r="38" className="fill-surface-base" />
      <circle cx="170" cy="196" r="18" className="fill-brand-primary" />
      <g
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-brand-blush"
      >
        <path d="M52 106q4 30 26 48" />
        <path d="M126 76q-6 24 2 42" />
        <path d="M318 146q-20 6-42 22" />
        <path d="M320 216q-24-2-48 2" />
      </g>
      <path
        d="M170 196 262 104"
        strokeWidth="6"
        strokeLinecap="round"
        className="stroke-brand-primary-deep"
      />
      <path d="M248 118l22-22 4-20-22 22z" className="fill-brand-primary" />
      <path d="M248 118l22-22 20-4-22 22z" className="fill-brand-highlight" />
      {Object.entries(BAND_SPOTS).map(([value, [x, y]]) => (
        <g key={value}>
          {value === band && (
            <ellipse
              cx={x}
              cy={y - 9}
              rx="36"
              ry="24"
              fill="none"
              strokeWidth="2"
              className="stroke-brand-primary-deep"
            />
          )}
          <text
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="28"
            className={`font-passage italic ${value === band ? "fill-brand-primary-deep" : "fill-text-secondary"}`}
          >
            {value}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** The band note's icon: three rising bars in the line style. */
export function LevelIcon({ className }: { className: string }) {
  return (
    <Illustration className={className}>
      <path d="M5.25 19.25v-5.5M12 19.25v-9.5M18.75 19.25V4.75M3.75 19.25h16.5" />
    </Illustration>
  );
}
