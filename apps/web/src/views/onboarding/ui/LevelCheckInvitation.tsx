import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { LATER } from "@/entities/goal";
import { type SectionState, readLevelCheckState } from "@/entities/level-check";
import { LineIcon } from "@/shared/ui/icons";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { SkillsPicture } from "@/shared/ui/SkillsPicture";
import { OnboardingStep } from "./OnboardingStep";

/**
 * Step 3: the invitation to find one's level. Not a question. The picture
 * shows what the check looks at: the product's skills around one level. A
 * check left in progress is continued instead (USER_FLOWS.md, Level check
 * flows); the state comes from the cookie, read inside Suspense as the
 * saved goal is.
 */
export async function LevelCheckInvitation() {
  return (
    <Suspense fallback={<Invitation state="none" />}>
      <InvitationFromCookie />
    </Suspense>
  );
}

async function InvitationFromCookie() {
  return <Invitation state={readLevelCheckState(await cookies()).reading} />;
}

async function Invitation({ state }: { state: SectionState }) {
  const t = await getTranslations();
  const inProgress = state === "inProgress";
  return (
    <OnboardingStep
      step={3}
      title={inProgress ? t("levelCheck.resume.title") : t("levelCheck.title")}
      description={
        inProgress
          ? t("home.nextAction.continueCheck.body")
          : t("levelCheck.body")
      }
      art={{
        picture: <SkillsPicture size="large" />,
        title: t("onboarding.art.levelCheck.title"),
        body: t("onboarding.art.levelCheck.body"),
      }}
      mobilePicture={
        <div className="rounded-lg bg-blush-field py-4">
          <SkillsPicture size="small" />
        </div>
      }
    >
      <div className="flex flex-col items-start gap-2">
        <PrimaryLink href="/level-check">
          <span className="inline-flex items-center gap-2">
            {inProgress
              ? t("levelCheck.resume.continue")
              : t("levelCheck.start")}
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
