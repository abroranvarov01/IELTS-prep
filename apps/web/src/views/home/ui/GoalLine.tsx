import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { readGoal } from "@/entities/goal";

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
    <p>
      {targetBand === undefined || targetBand === "unknown"
        ? t("home.goal.targetBandNotSet")
        : t.rich("home.goal.targetBand", {
            band: targetBand,
            b: (chunks) => <strong className="font-bold">{chunks}</strong>,
          })}
      {examTypeLabel && (
        <>
          <span aria-hidden="true"> · </span>
          {examTypeLabel}
        </>
      )}
    </p>
  );
}
