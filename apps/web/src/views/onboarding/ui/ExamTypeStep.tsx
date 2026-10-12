import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { EXAM_TYPES, type ExamType } from "@/entities/goal";
import { Illustration } from "@/shared/ui/illustrations";
import { answerExamType } from "../api/actions";
import { AnswerList } from "./AnswerList";
import { OnboardingStep, QUESTION_ID } from "./OnboardingStep";
import { SavedGoal } from "./SavedGoal";

/** Step 1: which IELTS the user is taking. */
export async function ExamTypeStep() {
  const locale = await getLocale();
  const t = await getTranslations();
  const paths = EXAM_TYPES.filter(
    (value): value is keyof typeof PATH_ILLUSTRATIONS => value !== "unknown",
  ).map((value) => ({
    value,
    label: t(`examType.${value}`),
    illustration: PATH_ILLUSTRATIONS[value],
  }));
  const list = (selected?: ExamType) => (
    <AnswerList
      name="examType"
      layout="paths"
      answers={paths}
      fallback={{ value: "unknown", label: t("onboarding.dontKnow") }}
      selected={selected}
      selectedLabel={t("onboarding.selected")}
      labelledBy={QUESTION_ID}
      action={answerExamType.bind(null, locale)}
    />
  );

  return (
    <OnboardingStep
      step={1}
      title={t("onboarding.examType.title")}
      support={<PathsPicture />}
    >
      <p className="mt-2 text-text-secondary">{t("onboarding.changeLater")}</p>
      <div className="mt-6">
        <Suspense fallback={list()}>
          <SavedGoal>{(goal) => list(goal.examType)}</SavedGoal>
        </Suspense>
      </div>
    </OnboardingStep>
  );
}

/** Academic: a graduation cap; General Training: a briefcase. */
function AcademicIllustration({ className }: { className: string }) {
  return (
    <Illustration className={className}>
      <path d="M2.5 9.25 12 4.75l9.5 4.5L12 13.75z" />
      <path d="M6.5 11.5v4c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4M21.5 9.25v5" />
    </Illustration>
  );
}

function GeneralIllustration({ className }: { className: string }) {
  return (
    <Illustration className={className}>
      <rect x="3.25" y="7.25" width="17.5" height="12.5" rx="2.25" />
      <path d="M8.75 7.25v-1.5c0-.83.67-1.5 1.5-1.5h3.5c.83 0 1.5.67 1.5 1.5v1.5M3.25 12.75h17.5" />
    </Illustration>
  );
}

const PATH_ILLUSTRATIONS = {
  academic: <AcademicIllustration className="size-6 desktop:size-8" />,
  general: <GeneralIllustration className="size-6 desktop:size-8" />,
};

/** The support field: the two paths, side by side. */
function PathsPicture() {
  const circle =
    "flex size-[8rem] items-center justify-center rounded-full bg-surface-base text-brand-primary-deep";
  return (
    <div className="flex items-center">
      <span className={circle}>
        <AcademicIllustration className="size-16" />
      </span>
      <span className={`${circle} -ms-6 ring-8 ring-brand-blush-soft`}>
        <GeneralIllustration className="size-16" />
      </span>
    </div>
  );
}
