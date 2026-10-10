import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ExamTypeStep } from "@/features/onboarding/ExamTypeStep";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding.examType");
  return { title: t("title") };
}

export default function ExamTypePage() {
  return <ExamTypeStep />;
}
