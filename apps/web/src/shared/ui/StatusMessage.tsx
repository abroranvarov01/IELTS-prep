import Link from "next/link";
import type { ReactNode } from "react";
import { PictureLayout } from "./PictureLayout";

type StatusMessageProps = {
  title: string;
  body: string;
  /** The page's picture, large in the desktop panel and small above the heading on phones. */
  picture: (size: "large" | "small") => ReactNode;
  home: { href: string; label: string };
  // With retry, "Try again" is the primary action and home becomes a quieter link.
  retry?: { label: string; onRetry: () => void };
};

const primaryAction =
  "inline-flex min-h-12 items-center rounded-md bg-brand-primary px-6 font-bold text-surface-base hover:bg-brand-primary-deep active:bg-brand-primary-deep";

// The not-found and error states, and the level check being prepared: what
// happened, why, and the way out.
export function StatusMessage({
  title,
  body,
  picture,
  home,
  retry,
}: StatusMessageProps) {
  return (
    <PictureLayout
      panel={
        <div className="flex flex-1 items-center justify-center">
          {picture("large")}
        </div>
      }
    >
      <div className="mb-6 flex justify-center rounded-lg bg-brand-blush-soft py-4 desktop:hidden">
        {picture("small")}
      </div>
      <h1 className="text-heading-1 font-extrabold">{title}</h1>
      <p className="mt-2 text-text-secondary">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-4 desktop:mt-8">
        {retry ? (
          <>
            <button
              type="button"
              onClick={retry.onRetry}
              className={primaryAction}
            >
              {retry.label}
            </button>
            <Link
              href={home.href}
              className="inline-flex min-h-12 items-center font-medium underline underline-offset-4"
            >
              {home.label}
            </Link>
          </>
        ) : (
          <Link href={home.href} className={primaryAction}>
            {home.label}
          </Link>
        )}
      </div>
    </PictureLayout>
  );
}

const PICTURE_SIZE = {
  large: "w-full max-w-[22rem]",
  small: "w-[10rem]",
};

/** Not found: a signpost on a quiet disc. Decorative. */
export function SignpostPicture({ size }: { size: "large" | "small" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 260"
      className={PICTURE_SIZE[size]}
    >
      <circle cx="160" cy="130" r="112" className="fill-surface-warm" />
      <path
        d="M60 232q60-30 100-6t100-10"
        fill="none"
        strokeWidth="3"
        strokeDasharray="8 8"
        strokeLinecap="round"
        className="stroke-brand-blush"
      />
      <rect
        x="153"
        y="52"
        width="14"
        height="176"
        rx="4"
        className="fill-brand-primary-deep"
      />
      <path d="M96 66h128l22 20-22 20H96z" className="fill-brand-primary" />
      <path d="M224 122H104l-22 20 22 20h120z" className="fill-brand-blush" />
      <path
        d="M116 86h84M120 142h80"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-surface-base"
      />
    </svg>
  );
}

/** An error: a circular "try again" arrow in a white circle. Decorative. */
export function RetryPicture({ size }: { size: "large" | "small" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 260"
      className={PICTURE_SIZE[size]}
    >
      <circle cx="160" cy="130" r="112" className="fill-surface-warm" />
      <circle cx="160" cy="130" r="72" className="fill-surface-base" />
      <path
        d="M204 130A44 44 0 1 1 188.3 96.3"
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        className="stroke-brand-primary"
      />
      <path
        d="m200 79 -2 32 -30 -10z"
        strokeLinejoin="round"
        strokeWidth="4"
        className="fill-brand-primary stroke-brand-primary"
      />
    </svg>
  );
}
