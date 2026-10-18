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
 * The test screen's bar, with "Exit" on the start side. With `confirmExit`,
 * "Exit" asks first in a modal dialog (ADR-0007): in a running Exam, because
 * the time keeps running; in a level-check section the device cannot save,
 * because the answers would be lost (USER_FLOWS.md, Level check flows).
 */
export function TestBar({
  confirmExit,
  children,
}: {
  confirmExit?: "exam" | "unsaved";
  children?: ReactNode;
}) {
  const t = useTranslations("reading");
  const tCheck = useTranslations("levelCheck");
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
            {confirmExit === "exam"
              ? t("exitExam.title")
              : tCheck("exitUnsaved.title")}
          </h2>
          <p id="exit-exam-body" className="mt-2">
            {confirmExit === "exam"
              ? t("exitExam.body")
              : tCheck("exitUnsaved.body")}
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
