import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TARGET_BANDS, type TargetBand } from "@/entities/goal";
import { answerTargetBand } from "../api/actions";
import { type Answer, AnswerList } from "./AnswerList";
import { OnboardingStep, QUESTION_ID } from "./OnboardingStep";
import { LevelIcon, TargetPicture } from "./pictures";
import { SavedGoal } from "./SavedGoal";

/** The message keys of what each band means. */
const NOTES = {
  "6.0": "band60",
  "6.5": "band65",
  "7.0": "band70",
  "7.5": "band75",
  "8+": "band8plus",
} as const;

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
      note={
        selected !== undefined && selected !== "unknown" ? (
          <div className="flex items-start gap-4 rounded-lg bg-brand-blush-soft p-4">
            <LevelIcon className="size-8 text-brand-primary-deep" />
            <p>
              <span className="block font-bold">
                {t(`onboarding.targetBand.notes.${NOTES[selected]}.title`)}
              </span>
              <span className="mt-1 block text-meta text-text-secondary">
                {t(`onboarding.targetBand.notes.${NOTES[selected]}.body`)}
              </span>
            </p>
          </div>
        ) : undefined
      }
      fallback={{ value: "unknown", label: t("onboarding.dontKnow") }}
      selected={selected}
      selectedLabel={t("onboarding.selected")}
      labelledBy={QUESTION_ID}
      action={answerTargetBand.bind(null, locale)}
    />
  );

  return (
    <OnboardingStep
      step={2}
      title={t("onboarding.targetBand.title")}
      description={t("onboarding.changeLater")}
      art={{
        picture: (
          <Suspense fallback={<TargetPicture />}>
            <SavedGoal>
              {(goal) => <TargetPicture band={goal.targetBand} />}
            </SavedGoal>
          </Suspense>
        ),
        title: t("onboarding.art.band.title"),
        body: t("onboarding.art.band.body"),
      }}
    >
      <Suspense fallback={list()}>
        <SavedGoal>{(goal) => list(goal.targetBand)}</SavedGoal>
      </Suspense>
    </OnboardingStep>
  );
}
