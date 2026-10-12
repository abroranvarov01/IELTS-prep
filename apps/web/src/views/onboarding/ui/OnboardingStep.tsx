import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ArcMotif } from "@/shared/ui/ArcMotif";

const TOTAL_STEPS = 3;

export const QUESTION_ID = "question";

/**
 * The frame of every onboarding step (DESIGN_SYSTEM.md, Onboarding
 * composition). Phones: the step alone, in one column. Desktop: the step on
 * the end side and a blush support field on the start side, which carries the
 * brand motif and the step's picture. The step indicator's segments are
 * decorative; its text carries the meaning.
 */
export async function OnboardingStep({
  step,
  title,
  support,
  children,
}: {
  step: 1 | 2 | 3;
  title: string;
  /** The support field's picture (desktop only). */
  support: ReactNode;
  children: ReactNode;
}) {
  const t = await getTranslations("onboarding");

  return (
    <div className="mx-auto max-w-column pt-6 pb-12 desktop:grid desktop:max-w-none desktop:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] desktop:gap-16 desktop:py-8">
      <div className="desktop:flex desktop:flex-col desktop:justify-center desktop:py-8">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                className={`h-1 w-6 rounded-full ${i < step ? "bg-brand-highlight" : "bg-border-subtle"}`}
              />
            ))}
          </div>
          <p className="text-meta font-medium text-text-secondary">
            {t("step", { current: step, total: TOTAL_STEPS })}
          </p>
        </div>
        <h1 id={QUESTION_ID} className="mt-4 text-heading-1 font-extrabold">
          {title}
        </h1>
        {children}
      </div>
      {/* Supporting only, so it follows the step in reading order. */}
      <div className="relative hidden min-h-[32rem] items-center justify-center overflow-hidden rounded-xl bg-brand-blush-soft p-12 desktop:order-first desktop:flex">
        <ArcMotif className="-right-32 -bottom-32 size-[30rem]" />
        <ArcMotif className="-top-16 -left-16 size-[12rem]" />
        <div className="relative flex flex-col items-center gap-6">
          {support}
        </div>
      </div>
    </div>
  );
}
