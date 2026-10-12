import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { LATER } from "@/entities/goal";
import { TargetIllustration } from "@/shared/ui/illustrations";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { GoalRecap } from "./GoalRecap";
import { OnboardingStep } from "./OnboardingStep";

/**
 * Step 3: the invitation to find one's level. Not a question. The goal set
 * so far sits beside the target (desktop) or just above the button (phones):
 * the level check measures where the user stands against it.
 */
export async function LevelCheckInvitation() {
  const t = await getTranslations();

  return (
    <OnboardingStep
      step={3}
      title={t("levelCheck.title")}
      support={
        <>
          <span className="flex size-[10rem] items-center justify-center rounded-full bg-surface-base text-brand-primary-deep">
            <TargetIllustration className="size-[5rem]" />
          </span>
          <Suspense>
            <GoalRecap />
          </Suspense>
        </>
      }
    >
      {/* Phones: what the check does, with the target and the goal it measures
          against, as one compact block; desktop shows those in the support field. */}
      <div className="mt-4 flex items-start gap-3 rounded-lg bg-brand-blush-soft p-4 desktop:mt-2 desktop:block desktop:bg-transparent desktop:p-[0]">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-base text-brand-primary-deep desktop:hidden">
          <TargetIllustration />
        </span>
        <div className="flex flex-col gap-3">
          <p className="text-text-secondary">{t("levelCheck.body")}</p>
          <div className="desktop:hidden">
            <Suspense>
              <GoalRecap />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-start gap-2 desktop:mt-8">
        <PrimaryLink href="/level-check">{t("levelCheck.start")}</PrimaryLink>
        <QuietLink href={`/?${LATER.param}=${LATER.value}`}>
          {t("onboarding.notNow")}
        </QuietLink>
      </div>
    </OnboardingStep>
  );
}
