import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { levelCheckForm } from "@/entities/reading/forms.server";
import { LevelCheckSection } from "@/views/reading-test";

// The section has the test bar, not the shell (USER_FLOWS.md, Level check flows).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("levelCheck");
  return { title: t("section.title") };
}

export default function LevelCheckReadingPage() {
  // Whether to start a session comes from the address (`?start=1`).
  return (
    <Suspense>
      <LevelCheckSection form={levelCheckForm()} />
    </Suspense>
  );
}
