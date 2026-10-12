import { getTranslations } from "next-intl/server";
import { LATER } from "@/entities/goal";
import { AccentPanel } from "@/shared/ui/AccentPanel";
import { TargetIllustration } from "@/shared/ui/illustrations";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { OnboardingStep } from "./OnboardingStep";

/** Step 3: the invitation to find one's level. Not a question. */
export async function LevelCheckInvitation() {
  const t = await getTranslations();

  return (
    <OnboardingStep
      step={3}
      title={t("levelCheck.title")}
      visual={
        <AccentPanel>
          <div className="flex justify-center py-4">
            <div className="flex size-[6rem] items-center justify-center rounded-full bg-surface-base text-brand-primary-deep">
              <TargetIllustration className="size-12" />
            </div>
          </div>
        </AccentPanel>
      }
    >
      <p className="mt-2 text-text-secondary">{t("levelCheck.body")}</p>
      <div className="mt-8 flex flex-col items-start gap-2">
        <PrimaryLink href="/level-check">{t("levelCheck.start")}</PrimaryLink>
        <QuietLink href={`/?${LATER.param}=${LATER.value}`}>
          {t("onboarding.notNow")}
        </QuietLink>
      </div>
    </OnboardingStep>
  );
}
