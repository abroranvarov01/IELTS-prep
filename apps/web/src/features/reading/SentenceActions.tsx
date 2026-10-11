import { useTranslations } from "next-intl";
import type { RefObject } from "react";

/**
 * The bar of actions for the selected sentence, just above the sheet
 * (READING_EXPERIENCE.md, Highlighting and Pin Evidence). `pin` is absent
 * where Pin Evidence is not offered (Exam Mode).
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
  bottom: string;
  isHighlighted: boolean;
  pin?: { number: number; isPinned: boolean; onToggle: () => void };
  /** Why the last action was refused. */
  message?: string;
  firstActionRef: RefObject<HTMLButtonElement | null>;
  onToggleHighlight: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("reading");
  const action =
    "inline-flex min-h-12 items-center gap-2 px-3 font-medium underline";

  return (
    <div
      role="group"
      aria-label={t("mark.actions")}
      className="fixed inset-x-gutter z-20 mx-auto flex max-w-column flex-wrap items-center justify-between gap-2 rounded-md bg-surface-base px-2 py-1 shadow-raised"
      style={{ bottom }}
    >
      {message && <p className="basis-full px-3 pt-2 font-medium">{message}</p>}
      <button
        ref={firstActionRef}
        type="button"
        onClick={onToggleHighlight}
        className={action}
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
      {pin && (
        <button type="button" onClick={pin.onToggle} className={action}>
          <PinIcon className="size-4" />
          {pin.isPinned
            ? t("mark.unpin", { number: pin.number })
            : t("mark.pin", { number: pin.number })}
        </button>
      )}
      <button type="button" onClick={onCancel} className={action}>
        {t("mark.cancel")}
      </button>
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
