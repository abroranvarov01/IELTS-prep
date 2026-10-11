import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LevelCheckComingSoon } from "@/views/level-check";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("levelCheck.comingSoon");
  return { title: t("title") };
}

export default function LevelCheckPage() {
  return <LevelCheckComingSoon />;
}
