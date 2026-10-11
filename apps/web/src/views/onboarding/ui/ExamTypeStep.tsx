import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { EXAM_TYPES, type ExamType } from "@/entities/goal";
import { answerExamType } from "../api/actions";
import { AnswerList } from "./AnswerList";
import { OnboardingStep, QUESTION_ID } from "./OnboardingStep";
import { SavedGoal } from "./SavedGoal";

/** Step 1: which IELTS the user is taking. */
export async function ExamTypeStep() {
  const locale = await getLocale();
  const t = await getTranslations();
  const labels: Record<ExamType, string> = {
    academic: t("examType.academic"),
    general: t("examType.general"),
    unknown: t("onboarding.dontKnow"),
  };
  const answers = EXAM_TYPES.map((value) => ({ value, label: labels[value] }));
  const list = (selected?: ExamType) => (
    <AnswerList
      name="examType"
      answers={answers}
      selected={selected}
      selectedLabel={t("onboarding.selected")}
      labelledBy={QUESTION_ID}
      action={answerExamType.bind(null, locale)}
    />
  );

  return (
    <OnboardingStep step={1} title={t("onboarding.examType.title")}>
      <p className="mt-2 text-text-secondary">{t("onboarding.changeLater")}</p>
      <div className="mt-6">
        <Suspense fallback={list()}>
          <SavedGoal>{(goal) => list(goal.examType)}</SavedGoal>
        </Suspense>
      </div>
    </OnboardingStep>
  );
}
