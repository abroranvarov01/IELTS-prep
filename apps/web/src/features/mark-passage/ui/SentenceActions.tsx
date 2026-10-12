import { useTranslations } from "next-intl";
import type { Ref } from "react";
import { CloseIcon, LineIcon } from "@/shared/ui/icons";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";

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

  return (
    <div
      role="group"
      aria-label={t("mark.actions")}
      className={`${bottom === undefined ? "sticky bottom-2" : "fixed inset-x-gutter"} z-20 mx-auto grid max-w-column grid-cols-[minmax(0,1fr)_auto] items-center gap-x-1 rounded-md bg-surface-base p-1 shadow-raised`}
      style={bottom === undefined ? undefined : { bottom }}
    >
      {message && <p className="col-span-2 px-3 pt-2 font-medium">{message}</p>}
      <button
        ref={firstActionRef}
        type="button"
        onClick={onToggleHighlight}
        className={`${QUIET_BUTTON} justify-self-start`}
      >
        <HighlightIcon />
        {isHighlighted ? t("mark.removeHighlight") : t("mark.highlight")}
      </button>
      <button
        type="button"
        aria-label={t("mark.cancel")}
        onClick={onCancel}
        className={`${QUIET_BUTTON} size-12 justify-center px-[0]`}
      >
        <CloseIcon />
      </button>
      {pin && (
        <button
          type="button"
          onClick={pin.onToggle}
          className={`${QUIET_BUTTON} col-span-2 justify-self-start`}
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
    <LineIcon className={className}>
      <path d="M5.5 1.75h5M6.5 1.75v4l-2 3h7l-2-3v-4M8 8.75v5.5" />
    </LineIcon>
  );
}

function HighlightIcon() {
  return (
    <LineIcon className="size-4">
      <path d="M9.75 2.75l3.5 3.5L7.5 12H4v-3.5zM2.5 14.5h11" />
    </LineIcon>
  );
}
