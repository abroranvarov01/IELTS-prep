import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

const TOTAL_STEPS = 3;

export const QUESTION_ID = "question";

/**
 * The frame of every onboarding step: the step indicator, an optional visual,
 * and the step's heading. The indicator's segments are decorative; its text
 * carries the meaning.
 */
export async function OnboardingStep({
  step,
  title,
  visual,
  children,
}: {
  step: 1 | 2 | 3;
  title: string;
  /** A supporting visual above the heading (step 3). */
  visual?: ReactNode;
  children: ReactNode;
}) {
  const t = await getTranslations("onboarding");

  return (
    <div className="mx-auto max-w-column pt-6 pb-12">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-1 w-8 rounded-full ${i < step ? "bg-brand-highlight" : "bg-border-subtle"}`}
            />
          ))}
        </div>
        <p className="text-meta font-medium text-text-secondary">
          {t("step", { current: step, total: TOTAL_STEPS })}
        </p>
      </div>
      {visual && <div className="mt-6">{visual}</div>}
      <h1 id={QUESTION_ID} className="mt-6 text-heading-1 font-extrabold">
        {title}
      </h1>
      {children}
    </div>
  );
}
