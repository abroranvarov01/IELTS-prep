"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useRef } from "react";
import { Link } from "@/shared/i18n/navigation";
import { CloseIcon } from "@/shared/ui/icons";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { QuietLink } from "@/shared/ui/QuietLink";
import { TestBarFrame } from "@/widgets/reading-layout";
import { Dialog } from "./Dialog";

/**
 * The Listening screen's bar: "Exit" on the start side, the part and the
 * check timer on the end side. In a running Exam, "Exit" asks first: the
 * recording keeps going (LISTENING_EXPERIENCE.md, Leave and come back).
 */
export function TestBar({
  confirmExit,
  children,
}: {
  confirmExit?: boolean;
  children?: ReactNode;
}) {
  const t = useTranslations("reading");
  const tl = useTranslations("listening");
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <TestBarFrame
      start={
        <Link
          href="/practice"
          onClick={(event) => {
            if (!confirmExit) return;
            event.preventDefault();
            dialog.current?.showModal();
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
        <Dialog dialogRef={dialog} title={t("exitExam.title")}>
          <p className="mt-2">{tl("exitExam.body")}</p>
          <div className="mt-6">
            <PrimaryButton onClick={() => dialog.current?.close()}>
              {t("exitExam.stay")}
            </PrimaryButton>
          </div>
          <div className="mt-2">
            <QuietLink href="/practice">{t("exitExam.leave")}</QuietLink>
          </div>
        </Dialog>
      )}
    </TestBarFrame>
  );
}
