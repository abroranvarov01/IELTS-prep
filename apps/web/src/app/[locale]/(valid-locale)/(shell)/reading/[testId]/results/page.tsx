import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { readingTest, readingTestIds } from "@/entities/reading/content.server";
import { readingKey } from "@/entities/reading/keys.server";
import { ResultsScreen } from "@/views/reading-results";

// The results of a Reading attempt, inside the shell (D21). The answer key is
// read here, on the server, and passed to this page only (ADR-0008 §2).
export function generateStaticParams() {
  return readingTestIds().map((testId) => ({ testId }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reading.results");
  return { title: t("title") };
}

export default async function ReadingResultsPage({
  params,
}: PageProps<"/[locale]/reading/[testId]/results">) {
  const { testId } = await params;
  const test = readingTest(testId);
  const key = readingKey(testId);
  if (!test || !key) notFound();

  // The attempt is chosen by the address and read from the device.
  return (
    <Suspense>
      <ResultsScreen test={test} answerKey={key} />
    </Suspense>
  );
}
