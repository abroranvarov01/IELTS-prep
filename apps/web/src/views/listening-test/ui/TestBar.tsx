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
 * recording keeps going (LISTENING_EXPERIENCE.md, Leave and come back). The
 * level check's section leaves for Home, and asks first when the device
 * can't keep its answers (as Reading's).
 */
export function TestBar({
  confirmExit,
  check = false,
  children,
}: {
  confirmExit?: boolean;
  check?: boolean;
  children?: ReactNode;
}) {
  const t = useTranslations("reading");
  const tl = useTranslations("listening");
  const tCheck = useTranslations("levelCheck");
  const dialog = useRef<HTMLDialogElement>(null);
  const exitHref = check ? "/" : "/practice";
  return (
    <TestBarFrame
      start={
        <Link
          href={exitHref}
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
        <Dialog
          dialogRef={dialog}
          title={check ? tCheck("exitUnsaved.title") : t("exitExam.title")}
        >
          <p className="mt-2">
            {check ? tCheck("exitUnsaved.body") : tl("exitExam.body")}
          </p>
          <div className="mt-6">
            <PrimaryButton onClick={() => dialog.current?.close()}>
              {t("exitExam.stay")}
            </PrimaryButton>
          </div>
          <div className="mt-2">
            <QuietLink href={exitHref}>{t("exitExam.leave")}</QuietLink>
          </div>
        </Dialog>
      )}
    </TestBarFrame>
  );
}
