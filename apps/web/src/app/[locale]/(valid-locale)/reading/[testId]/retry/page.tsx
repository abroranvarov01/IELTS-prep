import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { readingTest, readingTestIds } from "@/entities/reading/content.server";
import { readingKey } from "@/entities/reading/keys.server";
import { RetryScreen } from "@/views/reading-test";

// A retry of questions from an earlier attempt, in the test-screen layout
// (D21). Learners answer on this page, so only the key's revision reaches it,
// to find the source's current result, never the key (ADR-0008 §2).
export function generateStaticParams() {
  return readingTestIds().map((testId) => ({ testId }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/reading/[testId]/retry">): Promise<Metadata> {
  const { testId } = await params;
  return { title: readingTest(testId)?.title };
}

export default async function ReadingRetryPage({
  params,
}: PageProps<"/[locale]/reading/[testId]/retry">) {
  const { testId } = await params;
  const test = readingTest(testId);
  const key = readingKey(testId);
  if (!test || !key) notFound();

  // The source attempt and the questions are chosen by the address and read
  // from the device.
  return (
    <Suspense>
      <RetryScreen test={test} keyRevision={key.revision} />
    </Suspense>
  );
}
