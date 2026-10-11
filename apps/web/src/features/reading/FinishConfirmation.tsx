import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { QUESTION_COUNT } from "@/domain/reading/content";
import { answeredNumbers } from "@/domain/reading/session";
import { useReading } from "./reading-context";

/** "Finish the test?" in the expanded sheet (USER_FLOWS.md, Finish a test). */
export function FinishConfirmation({
  headingRef,
  onFinish,
  onCancel,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onFinish: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("reading");
  const { test, session } = useReading();
  const unanswered = QUESTION_COUNT - answeredNumbers(session, test).size;

  return (
    <>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-heading-3 font-bold focus:outline-none"
      >
        {t("finish.title")}
      </h2>
      {unanswered > 0 && (
        <p className="mt-2">{t("finish.unanswered", { count: unanswered })}</p>
      )}
      <div className="mt-6">
        <PrimaryButton onClick={onFinish}>{t("finish.confirm")}</PrimaryButton>
      </div>
      <div className="mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-12 items-center font-medium underline"
        >
          {t("finish.cancel")}
        </button>
      </div>
    </>
  );
}
