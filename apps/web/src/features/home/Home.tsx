import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PrimaryLink } from "@/components/PrimaryLink";
import { QuietLink } from "@/components/QuietLink";
import { type NextAction, nextAction } from "@/domain/next-action";
import { GoalLine } from "./GoalLine";

/** Answers "What should I do now to improve IELTS?" with one action (USER_FLOWS.md). */
export async function Home() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-column py-8">
      <h1 className="text-heading-1 font-extrabold">{t("home.title")}</h1>
      <div className="mt-6">
        <NextActionBlock action={nextAction()} />
      </div>
      <div className="mt-8">
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
        <section aria-labelledby="next-action">
          <h2 id="next-action" className="text-heading-2 font-bold">
            {t("title")}
          </h2>
          <p className="mt-2">{t("body")}</p>
          <div className="mt-6">
            <PrimaryLink href="/level-check">{t("start")}</PrimaryLink>
          </div>
        </section>
      );
  }
}
