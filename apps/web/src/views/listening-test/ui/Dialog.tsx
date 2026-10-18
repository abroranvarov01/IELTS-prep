"use client";

import { type ReactNode, type RefObject, useId } from "react";

/**
 * The confirmation dialog (DESIGN_SYSTEM.md, Confirmation dialog): native
 * `<dialog>`, modal, focus kept inside and returned when it closes.
 */
export function Dialog({
  dialogRef,
  title,
  open,
  children,
}: {
  dialogRef?: RefObject<HTMLDialogElement | null>;
  title: string;
  /** Open as soon as it renders (a state the learner did not ask for). */
  open?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <dialog
      ref={(element) => {
        if (dialogRef) dialogRef.current = element;
        if (element && open && !element.open) element.showModal();
      }}
      aria-labelledby={id}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl bg-surface-base p-6 text-ink shadow-raised backdrop:bg-ink/40"
    >
      <h2 id={id} className="text-heading-3 font-bold">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
