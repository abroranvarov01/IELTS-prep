import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { readGoal } from "@/entities/goal";
import { readLevelCheckState } from "@/entities/level-check";
import { levelCheckForm } from "@/entities/reading/forms.server";
import { LevelCheckIntro } from "@/views/level-check";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("levelCheck");
  return { title: t("title") };
}

export default function LevelCheckPage() {
  return (
    // The intro's first form depends on the request's cookies (ADR-0011 §5).
    <Suspense>
      <IntroFromCookies />
    </Suspense>
  );
}

async function IntroFromCookies() {
  const cookieStore = await cookies();
  return (
    <LevelCheckIntro
      form={levelCheckForm()}
      cookieState={readLevelCheckState(cookieStore).reading}
      academicNote={readGoal(cookieStore).examType === "general"}
    />
  );
}
