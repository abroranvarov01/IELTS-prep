import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { readGoal } from "@/entities/goal";

/**
 * The goal set so far, in the words home uses ("Academic", "Target band:
 * 7.0"): the context of steps 2 and 3. Nothing when nothing is known yet.
 * Reads the request's cookie, so render it inside <Suspense>.
 */
export async function GoalRecap() {
  const t = await getTranslations();
  const { examType, targetBand } = readGoal(await cookies());
  const exam =
    examType === "academic" || examType === "general"
      ? t(`examType.${examType}`)
      : undefined;
  const band =
    targetBand !== undefined && targetBand !== "unknown"
      ? targetBand
      : undefined;
  if (!exam && !band) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {exam && (
        <span className="rounded-full bg-surface-base px-3 py-1 text-meta font-bold">
          {exam}
        </span>
      )}
      {band && (
        <span className="text-text-secondary">
          {t.rich("home.goal.targetBand", {
            band,
            b: (chunks) => (
              <strong className="font-bold text-ink">{chunks}</strong>
            ),
          })}
        </span>
      )}
    </p>
  );
}
