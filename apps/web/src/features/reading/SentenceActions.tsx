import { useTranslations } from "next-intl";
import type { RefObject } from "react";

/**
 * The bar of actions for the selected sentence, just above the sheet
 * (READING_EXPERIENCE.md, Highlighting and Pin Evidence).
 */
export function SentenceActions({
  bottom,
  isHighlighted,
  firstActionRef,
  onToggleHighlight,
  onCancel,
}: {
  bottom: string;
  isHighlighted: boolean;
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
      <button type="button" onClick={onCancel} className={action}>
        {t("mark.cancel")}
      </button>
    </div>
  );
}
