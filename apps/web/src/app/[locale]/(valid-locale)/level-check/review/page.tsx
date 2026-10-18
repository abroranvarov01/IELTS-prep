import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  levelCheckExplanations,
  levelCheckForm,
  levelCheckKey,
} from "@/entities/reading/forms.server";
import { LevelCheckReview } from "@/views/reading-results";

// "See your answers" after the level check, in the test-screen layout. The
// key and the explanations of the interface language are read here, on the
// server, and passed to this page only (ADR-0008 §2, §5).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("levelCheck");
  return { title: t("result.seeAnswers") };
}

export default async function LevelCheckReviewPage() {
  const locale = await getLocale();
  return (
    <Suspense>
      <LevelCheckReview
        form={levelCheckForm()}
        answerKey={levelCheckKey()}
        explanations={levelCheckExplanations(locale)}
      />
    </Suspense>
  );
}
