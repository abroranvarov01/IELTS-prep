import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import {
  QUESTION_COUNT,
  answeredNumbers,
  useReading,
} from "@/entities/reading";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";

/**
 * "Finish the test?" (USER_FLOWS.md, Finish a test): in the expanded sheet,
 * or in a dialog on desktop, which is named by its heading.
 */
export const FINISH_TITLE_ID = "finish-title";

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
        id={FINISH_TITLE_ID}
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
