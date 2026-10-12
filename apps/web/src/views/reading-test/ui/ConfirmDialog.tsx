import type { ReactNode, RefObject } from "react";

/**
 * A real modal decision, such as leaving a running Exam or finishing on
 * desktop: the native `<dialog>` opened with `showModal()` (ADR-0007), which
 * contains focus, closes on Escape and returns focus to its opener.
 */
export function ConfirmDialog({
  dialogRef,
  labelledBy,
  describedBy,
  children,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  /** The ids of its heading and of the text that explains it. */
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
}) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="m-auto w-[calc(100%-2*var(--spacing-gutter))] max-w-column rounded-xl bg-surface-base p-6 text-ink shadow-raised backdrop:bg-ink/40"
    >
      {children}
    </dialog>
  );
}
