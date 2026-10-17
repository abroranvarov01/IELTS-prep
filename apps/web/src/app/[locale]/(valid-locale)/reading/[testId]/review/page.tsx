import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { readingTest, readingTestIds } from "@/entities/reading/content.server";
import { readingExplanations } from "@/entities/reading/explanations.server";
import { readingKey } from "@/entities/reading/keys.server";
import { ReviewScreen } from "@/views/reading-results";

// The review of a Reading attempt, in the test-screen layout (D21). The key
// and the explanations of the interface language are read here, on the
// server, and passed to this page only (ADR-0008 §2, §5).
export function generateStaticParams() {
  return readingTestIds().map((testId) => ({ testId }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/reading/[testId]/review">): Promise<Metadata> {
  const { testId } = await params;
  return { title: readingTest(testId)?.title };
}

export default async function ReadingReviewPage({
  params,
}: PageProps<"/[locale]/reading/[testId]/review">) {
  const { locale, testId } = await params;
  const test = readingTest(testId);
  const key = readingKey(testId);
  if (!test || !key) notFound();

  // The attempt and the card are chosen by the address and read from the device.
  return (
    <Suspense>
      <ReviewScreen
        test={test}
        answerKey={key}
        explanations={readingExplanations(testId, locale)}
      />
    </Suspense>
  );
}
