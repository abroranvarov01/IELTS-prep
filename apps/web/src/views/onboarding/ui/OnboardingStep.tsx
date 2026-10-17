import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { PictureLayout } from "@/shared/ui/PictureLayout";

const TOTAL_STEPS = 3;

export const QUESTION_ID = "question";

/**
 * The frame of every onboarding step (DESIGN_SYSTEM.md, Onboarding
 * composition): the step indicator, the question and the step's answers or
 * actions, beside the picture panel with the step's encouragement on desktop.
 * Phones: the question alone, with a small picture only where the step has
 * one. The indicator's segments are decorative; its text carries the meaning.
 */
export async function OnboardingStep({
  step,
  title,
  description,
  art,
  mobilePicture,
  children,
}: {
  step: 1 | 2 | 3;
  title: string;
  description: string;
  /** The desktop panel: a picture and an encouragement under it, one sentence per line. */
  art: { picture: ReactNode; title: string; body: string };
  /** A small picture above the question on phones. */
  mobilePicture?: ReactNode;
  /** The answers or the step's actions. */
  children: ReactNode;
}) {
  const t = await getTranslations("onboarding");

  return (
    <PictureLayout
      panel={
        <>
          <div className="flex flex-1 items-center justify-center py-8">
            {art.picture}
          </div>
          <p className="max-w-[26rem] text-heading-1 font-extrabold whitespace-pre-line">
            {art.title}
          </p>
          <p className="mt-3 max-w-[24rem] text-text-secondary">{art.body}</p>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-1 w-8 rounded-full ${i < step ? "bg-brand-primary" : "bg-border-subtle"}`}
            />
          ))}
        </div>
        <p className="text-meta font-medium text-text-secondary">
          {t("step", { current: step, total: TOTAL_STEPS })}
        </p>
      </div>
      {mobilePicture && (
        <div className="mt-6 desktop:hidden">{mobilePicture}</div>
      )}
      <h1 id={QUESTION_ID} className="mt-4 text-heading-1 font-extrabold">
        {title}
      </h1>
      <p className="mt-2 text-text-secondary">{description}</p>
      <div className="mt-6 desktop:mt-8">{children}</div>
    </PictureLayout>
  );
}
