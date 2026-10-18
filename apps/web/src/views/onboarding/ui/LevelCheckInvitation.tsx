import { getTranslations } from "next-intl/server";
import { LATER } from "@/entities/goal";
import { LineIcon } from "@/shared/ui/icons";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { SkillsPicture } from "@/shared/ui/SkillsPicture";
import { OnboardingStep } from "./OnboardingStep";

/**
 * Step 3: the invitation to find one's level. Not a question. The picture
 * shows what the check looks at: the product's skills around one level.
 */
export async function LevelCheckInvitation() {
  const t = await getTranslations();
  return (
    <OnboardingStep
      step={3}
      title={t("levelCheck.title")}
      description={t("levelCheck.body")}
      art={{
        picture: <SkillsPicture size="large" />,
        title: t("onboarding.art.levelCheck.title"),
        body: t("onboarding.art.levelCheck.body"),
      }}
      mobilePicture={
        <div className="rounded-lg bg-brand-blush-soft py-4">
          <SkillsPicture size="small" />
        </div>
      }
    >
      <div className="flex flex-col items-start gap-2">
        <PrimaryLink href="/level-check">
          <span className="inline-flex items-center gap-2">
            {t("levelCheck.start")}
            <LineIcon className="size-4">
              <path d="M2.75 8h10.5M9 3.75 13.25 8 9 12.25" />
            </LineIcon>
          </span>
        </PrimaryLink>
        <QuietLink href={`/?${LATER.param}=${LATER.value}`}>
          {t("onboarding.notNow")}
        </QuietLink>
      </div>
    </OnboardingStep>
  );
}
