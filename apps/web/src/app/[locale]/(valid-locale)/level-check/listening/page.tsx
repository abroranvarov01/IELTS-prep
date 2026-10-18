import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { levelCheckListeningForm } from "@/entities/listening/forms.server";
import { LevelCheckSection } from "@/views/listening-test";

// The section has the test bar, not the shell (USER_FLOWS.md, The level
// check with two sections).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("levelCheck");
  return { title: t("title") };
}

export default function LevelCheckListeningPage() {
  // Whether to start a session comes from the address (`?start=…`).
  return (
    <Suspense>
      <LevelCheckSection form={levelCheckListeningForm()} />
    </Suspense>
  );
}
