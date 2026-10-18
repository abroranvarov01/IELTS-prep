import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { readLevelCheckState } from "@/entities/level-check";
import { Link } from "@/shared/i18n/navigation";
import { ReadingIcon } from "@/shared/ui/icons";
import { Illustration } from "@/shared/ui/illustrations";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { type NextAction, nextAction } from "../model/next-action";
import { GoalCard } from "./GoalCard";
import { StartingPointPicture } from "./StartingPointPicture";

/**
 * Answers "What should I do now to improve IELTS?" with one action
 * (USER_FLOWS.md, Home v2): a welcome, the next action in its own card
 * (first on phones), the goal card, and the skills the product has as quiet
 * ways into practice.
 */
export async function Home() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-column pt-6 pb-12 desktop:max-w-none desktop:pt-8">
      <h1 className="text-heading-1 font-extrabold">{t("home.title")}</h1>
      <p className="mt-1 text-text-secondary">{t("home.subtitle")}</p>
      <div className="mt-6 grid gap-4 desktop:grid-cols-12 desktop:gap-6">
        <div className="desktop:col-span-7">
          {/* The next action depends on the level check's state cookie. */}
          <Suspense>
            <NextActionCard />
          </Suspense>
        </div>
        <div className="desktop:col-span-5">
          {/* The goal needs the request's cookie; everything else is static. */}
          <Suspense>
            <GoalCard />
          </Suspense>
        </div>
      </div>
      <h2 className="mt-8 text-heading-2 font-bold">{t("home.chooseSkill")}</h2>
      <ul className="mt-4 grid gap-4 desktop:grid-cols-3">
        {/* Only skills with tests (N3): Reading now, Listening from M8. */}
        <li>
          <Link
            href="/practice"
            className="flex h-full flex-col gap-3 rounded-lg border border-border-subtle bg-surface-base p-[1.25rem] shadow-soft transition-colors hover:border-brand-blush active:bg-surface-warm"
          >
            <span className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-skill-reading-tint text-brand-primary-deep">
                <ReadingIcon />
              </span>
              <span className="text-heading-3 font-bold">
                {t("practice.skill.reading")}
              </span>
            </span>
            <span className="text-meta text-text-secondary">
              {t("home.skills.reading")}
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

async function NextActionCard() {
  return (
    <NextActionBlock
      action={nextAction(readLevelCheckState(await cookies()).reading)}
    />
  );
}

/** The next action is the screen's only primary action, whatever its kind. */
async function NextActionBlock({ action }: { action: NextAction }) {
  const t = await getTranslations();
  switch (action.kind) {
    case "levelCheck":
    case "continueLevelCheck":
      return (
        <section
          aria-labelledby="next-action"
          className="flex h-full items-center gap-6 rounded-lg bg-blush-field p-6 desktop:p-8"
        >
          <div className="flex-1">
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-full bg-surface-base text-brand-primary-deep"
            >
              <Illustration className="size-6">
                <path d="M5.25 19.25v-5.5M12 19.25v-9.5M18.75 19.25V4.75M3.75 19.25h16.5" />
              </Illustration>
            </span>
            <h2 id="next-action" className="mt-4 text-heading-2 font-bold">
              {action.kind === "continueLevelCheck"
                ? t("levelCheck.resume.title")
                : t("levelCheck.title")}
            </h2>
            <p className="mt-2 text-text-secondary">
              {action.kind === "continueLevelCheck"
                ? t("home.nextAction.continueCheck.body")
                : t("levelCheck.body")}
            </p>
            <div className="mt-6">
              <PrimaryLink href="/level-check">
                <span className="inline-flex items-center gap-2">
                  {action.kind === "continueLevelCheck"
                    ? t("levelCheck.resume.continue")
                    : t("levelCheck.start")}
                  <ArrowIcon />
                </span>
              </PrimaryLink>
            </div>
          </div>
          {/* The picture is desktop's; phones put the action first. */}
          <div className="hidden shrink-0 desktop:block">
            <StartingPointPicture />
          </div>
        </section>
      );
  }
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.75 8h10.5M9 3.75 13.25 8 9 12.25" />
    </svg>
  );
}
