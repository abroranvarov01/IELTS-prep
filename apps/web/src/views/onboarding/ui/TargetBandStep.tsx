import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TARGET_BANDS, type TargetBand } from "@/entities/goal";
import { answerTargetBand } from "../api/actions";
import { type Answer, AnswerList } from "./AnswerList";
import { OnboardingStep, QUESTION_ID } from "./OnboardingStep";
import { SavedGoal } from "./SavedGoal";

/** Step 2: the band the user needs. Bands show in IELTS notation in every language. */
export async function TargetBandStep() {
  const locale = await getLocale();
  const t = await getTranslations();
  const bands = TARGET_BANDS.filter((value) => value !== "unknown").map(
    (value): Answer => {
      if (value === "8+")
        return {
          value,
          label: value,
          spokenLabel: t("targetBand.eightPlusLabel"),
        };
      return { value, label: value };
    },
  );
  const list = (selected?: TargetBand) => (
    <AnswerList
      name="targetBand"
      layout="bands"
      answers={bands}
      fallback={{ value: "unknown", label: t("onboarding.dontKnow") }}
      selected={selected}
      selectedLabel={t("onboarding.selected")}
      labelledBy={QUESTION_ID}
      action={answerTargetBand.bind(null, locale)}
    />
  );

  return (
    <OnboardingStep step={2} title={t("onboarding.targetBand.title")}>
      <p className="mt-2 text-text-secondary">{t("onboarding.changeLater")}</p>
      <div className="mt-6">
        <Suspense fallback={list()}>
          <SavedGoal>{(goal) => list(goal.targetBand)}</SavedGoal>
        </Suspense>
      </div>
    </OnboardingStep>
  );
}
