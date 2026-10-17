import { useTranslations } from "next-intl";
import { type ReactNode, useRef } from "react";
import { Link } from "@/shared/i18n/navigation";
import { CloseIcon } from "@/shared/ui/icons";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { QuietLink } from "@/shared/ui/QuietLink";
import { TestBarFrame } from "@/widgets/reading-layout";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * The test screen's bar, with "Exit" on the start side. With `confirmExit` (a
 * running Exam), "Exit" asks first in a modal dialog (ADR-0007), because the
 * time keeps running.
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
    <TestBarFrame
      start={
        <Link
          href="/"
          onClick={(event) => {
            if (!confirmExit) return;
            event.preventDefault();
            dialogRef.current?.showModal();
          }}
          className={`${QUIET_BUTTON} -ms-3`}
        >
          <CloseIcon />
          {t("exit")}
        </Link>
      }
    >
      {children}
      {confirmExit && (
        <ConfirmDialog
          dialogRef={dialogRef}
          labelledBy="exit-exam-title"
          describedBy="exit-exam-body"
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
        </ConfirmDialog>
      )}
    </TestBarFrame>
  );
}
