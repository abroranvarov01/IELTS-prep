import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LevelCheckInvitation } from "@/views/onboarding";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("levelCheck");
  return { title: t("title") };
}

export default function LevelCheckInvitationPage() {
  return <LevelCheckInvitation />;
}
