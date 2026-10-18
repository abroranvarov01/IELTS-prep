import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  listeningTest,
  listeningTestIds,
} from "@/entities/listening/content.server";
import { listeningExplanations } from "@/entities/listening/explanations.server";
import { listeningChecking } from "@/entities/listening/keys.server";
import { ReviewScreen } from "@/views/listening-results";

// The review of a Listening attempt, in the test-screen layout. The key, the
// transcript and the explanations of the interface language are read here,
// on the server, and passed to this page only (ADR-0014 §6, §7).
export function generateStaticParams() {
  return listeningTestIds().map((testId) => ({ testId }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/listening/[testId]/review">): Promise<Metadata> {
  const { testId } = await params;
  return { title: listeningTest(testId)?.title };
}

// The params are read inside the Suspense boundary, so a navigation to the
// review stays instant (as the test route).
export default function ListeningReviewPage({
  params,
}: PageProps<"/[locale]/listening/[testId]/review">) {
  return (
    <Suspense>
      <Review params={params} />
    </Suspense>
  );
}

async function Review({
  params,
}: Pick<PageProps<"/[locale]/listening/[testId]/review">, "params">) {
  const { locale, testId } = await params;
  const test = listeningTest(testId);
  const checking = listeningChecking(testId);
  if (!test || !checking) notFound();

  // The attempt and the card are chosen by the address and read from the device.
  return (
    <ReviewScreen
      test={test}
      answerKey={checking.key}
      transcript={checking.transcript}
      explanations={listeningExplanations(testId, locale)}
    />
  );
}
