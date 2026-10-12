import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { readGoal } from "@/entities/goal";
import { LineIcon } from "@/shared/ui/icons";

/**
 * "Target band: 7.0 · Academic". "I don't know yet" shows as "not set yet"
 * for the band and leaves the exam type out (USER_FLOWS.md).
 */
export async function GoalLine() {
  const t = await getTranslations();
  const { examType, targetBand } = readGoal(await cookies());
  const examTypeLabel =
    examType === "academic" || examType === "general"
      ? t(`examType.${examType}`)
      : undefined;

  return (
    <p className="flex items-center gap-2 text-text-secondary">
      <LineIcon className="size-4">
        <path d="M3.5 14.5v-12M3.5 2.5h8.5l-2 3.25 2 3.25H3.5" />
      </LineIcon>
      <span>
        {targetBand === undefined || targetBand === "unknown"
          ? t("home.goal.targetBandNotSet")
          : t.rich("home.goal.targetBand", {
              band: targetBand,
              b: (chunks) => (
                <strong className="font-bold text-ink">{chunks}</strong>
              ),
            })}
        {examTypeLabel && (
          <>
            <span aria-hidden="true"> · </span>
            {examTypeLabel}
          </>
        )}
      </span>
    </p>
  );
}
