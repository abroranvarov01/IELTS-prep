import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  levelCheckListeningChecking,
  levelCheckListeningExplanations,
  levelCheckListeningForm,
} from "@/entities/listening/forms.server";
import { LevelCheckReview } from "@/views/listening-results";

// "See your Listening answers" after the level check, in the test-screen
// layout. The key, the transcript and the explanations of the interface
// language are read here, on the server, and passed to this page only
// (ADR-0014 §6, §7).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("levelCheck");
  return { title: t("result.seeAnswersListening") };
}

export default async function LevelCheckListeningReviewPage() {
  const locale = await getLocale();
  const { key, transcript } = levelCheckListeningChecking();
  return (
    <Suspense>
      <LevelCheckReview
        form={levelCheckListeningForm()}
        answerKey={key}
        transcript={transcript}
        explanations={levelCheckListeningExplanations(locale)}
      />
    </Suspense>
  );
}
