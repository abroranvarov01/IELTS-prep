import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

const TOTAL_STEPS = 3;
// The decorative progress fill per step (the text carries the meaning).
const FILL = { 1: "w-1/3", 2: "w-2/3", 3: "w-full" } as const;

export const QUESTION_ID = "question";

/** The frame of every onboarding step: the step indicator and the step's heading. */
export async function OnboardingStep({
  step,
  title,
  children,
}: {
  step: 1 | 2 | 3;
  title: string;
  children: ReactNode;
}) {
  const t = await getTranslations("onboarding");

  return (
    <div className="mx-auto max-w-column py-8">
      <p className="text-meta font-medium text-text-secondary">
        {t("step", { current: step, total: TOTAL_STEPS })}
      </p>
      <div
        aria-hidden="true"
        className="mt-2 h-1 rounded-full bg-border-subtle"
      >
        <div className={`h-1 rounded-full bg-brand-highlight ${FILL[step]}`} />
      </div>
      <h1 id={QUESTION_ID} className="mt-6 text-heading-1 font-extrabold">
        {title}
      </h1>
      {children}
    </div>
  );
}
