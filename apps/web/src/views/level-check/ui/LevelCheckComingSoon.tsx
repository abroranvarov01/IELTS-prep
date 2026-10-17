import { getLocale, getTranslations } from "next-intl/server";
import { SkillsPicture } from "@/shared/ui/SkillsPicture";
import { StatusMessage } from "@/shared/ui/StatusMessage";

// The level check's future address. Until the level check is designed and
// built, it says honestly that it is being prepared (owner decision
// 2026-10-10, USER_FLOWS.md open question 1).
export async function LevelCheckComingSoon() {
  const locale = await getLocale();
  const t = await getTranslations();

  return (
    <StatusMessage
      title={t("levelCheck.comingSoon.title")}
      body={t("levelCheck.comingSoon.body")}
      picture={(size) => <SkillsPicture size={size} />}
      home={{ href: `/${locale}`, label: t("common.goHome") }}
    />
  );
}
