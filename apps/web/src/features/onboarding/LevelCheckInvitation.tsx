import { getTranslations } from "next-intl/server";
import { PrimaryLink } from "@/components/PrimaryLink";
import { QuietLink } from "@/components/QuietLink";
import { LATER } from "@/domain/onboarding";
import { OnboardingStep } from "./OnboardingStep";

/** Step 3: the invitation to find one's level. Not a question. */
export async function LevelCheckInvitation() {
  const t = await getTranslations();

  return (
    <OnboardingStep step={3} title={t("levelCheck.title")}>
      <p className="mt-2">{t("levelCheck.body")}</p>
      <div className="mt-6 flex flex-col items-start gap-2">
        <PrimaryLink href="/level-check">{t("levelCheck.start")}</PrimaryLink>
        <QuietLink href={`/?${LATER.param}=${LATER.value}`}>
          {t("onboarding.notNow")}
        </QuietLink>
      </div>
    </OnboardingStep>
  );
}
