import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { SkillsPicture } from "@/shared/ui/SkillsPicture";
import { type NextAction, nextAction } from "../model/next-action";
import { GoalLine } from "./GoalLine";

/** Answers "What should I do now to improve IELTS?" with one action (USER_FLOWS.md). */
export async function Home() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-column pt-6 pb-12 desktop:max-w-none desktop:pt-8">
      {/* The page's name is a quiet label; the next action is what it shows. */}
      <h1 className="text-meta font-bold text-brand-primary-deep">
        {t("home.title")}
      </h1>
      <div className="mt-3">
        <NextActionBlock action={nextAction()} />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4">
        {/* The goal needs the request's cookie; everything above is static. */}
        <Suspense>
          <GoalLine />
        </Suspense>
        <QuietLink href="/start/exam">{t("home.goal.change")}</QuietLink>
      </div>
    </div>
  );
}

/** The next action is the screen's only primary action, whatever its kind. */
async function NextActionBlock({ action }: { action: NextAction }) {
  const t = await getTranslations("levelCheck");
  switch (action.kind) {
    case "levelCheck":
      return (
        <section
          aria-labelledby="next-action"
          className="rounded-xl bg-brand-blush-soft p-4 tablet:p-8 desktop:grid desktop:grid-cols-2 desktop:items-center desktop:gap-12 desktop:p-12"
        >
          <div className="mb-4 desktop:hidden">
            <SkillsPicture size="small" />
          </div>
          <div>
            <h2 id="next-action" className="text-heading-1 font-extrabold">
              {t("title")}
            </h2>
            <p className="mt-2 text-text-secondary">{t("body")}</p>
            <div className="mt-6 desktop:mt-8">
              <PrimaryLink href="/level-check">{t("start")}</PrimaryLink>
            </div>
          </div>
          <div className="hidden desktop:block">
            <SkillsPicture size="large" />
          </div>
        </section>
      );
  }
}
