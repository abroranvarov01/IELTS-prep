import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  listeningTest,
  listeningTestIds,
} from "@/entities/listening/content.server";
import { listeningChecking } from "@/entities/listening/keys.server";
import { ResultsScreen } from "@/views/listening-results";

// The results of a Listening attempt, inside the shell. The answer key and
// the transcript are read here, on the server, and passed to the results and
// review pages only (ADR-0014 §6).
export function generateStaticParams() {
  return listeningTestIds().map((testId) => ({ testId }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reading.results");
  return { title: t("title") };
}

// The params are read inside the Suspense boundary, so a navigation to the
// results stays instant (as the test route).
export default function ListeningResultsPage({
  params,
}: PageProps<"/[locale]/listening/[testId]/results">) {
  return (
    <Suspense>
      <Results params={params} />
    </Suspense>
  );
}

async function Results({
  params,
}: Pick<PageProps<"/[locale]/listening/[testId]/results">, "params">) {
  const { testId } = await params;
  const test = listeningTest(testId);
  const checking = listeningChecking(testId);
  if (!test || !checking) notFound();

  // The attempt is chosen by the address and read from the device.
  return (
    <ResultsScreen
      test={test}
      answerKey={checking.key}
      transcript={checking.transcript}
    />
  );
}
