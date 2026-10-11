import { useTranslations } from "next-intl";
import { type ReactNode, useRef } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { QuietLink } from "@/components/QuietLink";
import { Link } from "@/i18n/navigation";

/**
 * The compact bar that replaces the shell header on the test screen
 * (READING_EXPERIENCE.md). With `confirmExit` (a running Exam), "Exit" asks
 * first in a modal dialog (ADR-0007), because the time keeps running.
 */
export function TestBar({
  confirmExit = false,
  children,
}: {
  confirmExit?: boolean;
  children?: ReactNode;
}) {
  const t = useTranslations("reading");
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <header className="sticky top-[0] z-20 flex h-12 items-center gap-4 border-b border-border-subtle bg-surface-base px-gutter">
      <Link
        href="/"
        onClick={(event) => {
          if (!confirmExit) return;
          event.preventDefault();
          dialogRef.current?.showModal();
        }}
        className="inline-flex min-h-12 items-center font-medium underline"
      >
        {t("exit")}
      </Link>
      <div className="flex flex-1 items-center justify-end gap-4">
        {children}
      </div>
      {confirmExit && (
        <dialog
          ref={dialogRef}
          aria-labelledby="exit-exam-title"
          aria-describedby="exit-exam-body"
          className="m-auto w-[calc(100%-2*var(--spacing-gutter))] max-w-column rounded-xl border border-border-control bg-surface-base p-6 text-ink shadow-raised"
        >
          <h2 id="exit-exam-title" className="text-heading-3 font-bold">
            {t("exitExam.title")}
          </h2>
          <p id="exit-exam-body" className="mt-2">
            {t("exitExam.body")}
          </p>
          <div className="mt-6">
            <PrimaryButton onClick={() => dialogRef.current?.close()}>
              {t("exitExam.stay")}
            </PrimaryButton>
          </div>
          <div className="mt-2">
            <QuietLink href="/">{t("exitExam.leave")}</QuietLink>
          </div>
        </dialog>
      )}
    </header>
  );
}
