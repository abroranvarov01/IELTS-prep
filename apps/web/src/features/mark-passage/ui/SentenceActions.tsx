import { useTranslations } from "next-intl";
import type { Ref } from "react";

/**
 * The bar of actions for the selected sentence, just above the sheet
 * (READING_EXPERIENCE.md, Highlighting and Pin Evidence). `pin` is absent
 * where Pin Evidence is not offered (Exam Mode). Without `bottom` (desktop) it
 * stays at the bottom of the passage column, above the navigator bar.
 * At most two rows in every language (owner, 2026-10-11): Highlight and
 * Cancel (an icon, named in full) share the first, Pin takes the second.
 */
export function SentenceActions({
  bottom,
  isHighlighted,
  pin,
  message,
  firstActionRef,
  onToggleHighlight,
  onCancel,
}: {
  /** Its distance from the bottom of the screen, above the sheet. */
  bottom?: string;
  isHighlighted: boolean;
  pin?: { number: number; isPinned: boolean; onToggle: () => void };
  /** Why the last action was refused. */
  message?: string;
  firstActionRef: Ref<HTMLButtonElement>;
  onToggleHighlight: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("reading");
  const action =
    "inline-flex min-h-12 items-center gap-2 px-3 text-start font-medium underline";

  return (
    <div
      role="group"
      aria-label={t("mark.actions")}
      className={`${bottom === undefined ? "sticky bottom-2" : "fixed inset-x-gutter"} z-20 mx-auto grid max-w-column grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 rounded-md bg-surface-base px-2 py-1 shadow-raised`}
      style={bottom === undefined ? undefined : { bottom }}
    >
      {message && <p className="col-span-2 px-3 pt-2 font-medium">{message}</p>}
      <button
        ref={firstActionRef}
        type="button"
        onClick={onToggleHighlight}
        className={`${action} justify-self-start`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-4"
          fill="currentColor"
        >
          <path d="M3 13h10v1.5H3zM4 11l1.5-4L10 2.5l3.5 3.5L9 10.5l-4 1.5z" />
        </svg>
        {isHighlighted ? t("mark.removeHighlight") : t("mark.highlight")}
      </button>
      <button
        type="button"
        aria-label={t("mark.cancel")}
        onClick={onCancel}
        className="inline-flex size-12 items-center justify-center"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
        </svg>
      </button>
      {pin && (
        <button
          type="button"
          onClick={pin.onToggle}
          className={`${action} col-span-2 justify-self-start`}
        >
          <PinIcon className="size-4" />
          {pin.isPinned
            ? t("mark.unpin", { number: pin.number })
            : t("mark.pin", { number: pin.number })}
        </button>
      )}
    </div>
  );
}

export function PinIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
    >
      <path d="M9.5 1 15 6.5l-1.4 1.4-1-.6-2.6 2.6.4 3L9 14.3l-2.8-2.8-3.8 3.8-1.4-.7 3.8-3.8L2 8l1.4-1.4 3 .4L9 4.4l-.6-1z" />
    </svg>
  );
}
