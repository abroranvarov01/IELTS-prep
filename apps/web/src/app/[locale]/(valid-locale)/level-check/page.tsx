import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { StatusMessage } from "../../../StatusMessage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("levelCheck.comingSoon");
  return { title: t("title") };
}

// The level check's future address. Until the level check is designed and
// built, it says honestly that it is being prepared (owner decision
// 2026-10-10, USER_FLOWS.md open question 1).
export default async function LevelCheckPage() {
  const locale = await getLocale();
  const t = await getTranslations();

  return (
    <StatusMessage
      title={t("levelCheck.comingSoon.title")}
      body={t("levelCheck.comingSoon.body")}
      home={{ href: `/${locale}`, label: t("common.goHome") }}
    />
  );
}
