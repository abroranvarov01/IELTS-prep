import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { readGoal } from "@/entities/goal";
import { QuietLink } from "@/shared/ui/QuietLink";

/**
 * The goal card (USER_FLOWS.md, Home v2; DESIGN_SYSTEM.md, Home v2): the
 * target band as the card's figure, the exam type as a chip, and the way to
 * change them. "I don't know yet" shows as "not set yet" for the band and
 * leaves the exam type out.
 */
export async function GoalCard() {
  const t = await getTranslations();
  const { examType, targetBand } = readGoal(await cookies());
  const examTypeLabel =
    examType === "academic" || examType === "general"
      ? t(`examType.${examType}`)
      : undefined;
  const bandSet = targetBand !== undefined && targetBand !== "unknown";

  return (
    <section
      aria-labelledby="goal-title"
      className="relative flex h-full flex-col rounded-lg bg-blush-field p-6"
    >
      <h2 id="goal-title" className="text-meta font-bold text-text-secondary">
        {t("home.goal.title")}
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-3 pe-[7rem]">
        {bandSet ? (
          <p className="text-display font-extrabold tabular-nums">
            {targetBand}
          </p>
        ) : (
          <p>{t("home.goal.targetBandNotSet")}</p>
        )}
        {examTypeLabel && (
          <p className="rounded-full bg-surface-base px-3 py-1 text-meta font-bold">
            {examTypeLabel}
          </p>
        )}
      </div>
      <div className="mt-auto pt-4">
        <QuietLink href="/start/exam">{t("home.goal.change")}</QuietLink>
      </div>
      <GoalPicture />
    </section>
  );
}

/** Two tilted sheets at the card's end: the goal as paperwork done. Decorative. */
function GoalPicture() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 100"
      className="absolute end-4 top-4 h-[5.5rem] w-auto"
    >
      <g transform="rotate(-14 60 50)">
        <rect
          x="46"
          y="18"
          width="52"
          height="66"
          rx="5"
          className="fill-brand-blush"
        />
        <rect
          x="30"
          y="26"
          width="52"
          height="66"
          rx="5"
          className="fill-surface-base"
        />
        <g strokeWidth="3" strokeLinecap="round" className="stroke-brand-blush">
          <path d="M40 42h32M40 52h32M40 62h20" />
        </g>
        <path
          d="M40 74h12"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-brand-primary"
        />
      </g>
    </svg>
  );
}
