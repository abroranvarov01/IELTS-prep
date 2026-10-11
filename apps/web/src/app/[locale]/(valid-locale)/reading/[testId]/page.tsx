import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readingTest, readingTestIds } from "@/entities/reading/content.server";
import { ReadingScreen } from "@/views/reading-test";

// Reading is reached by its direct route only in M4 (owner, M4-09).
export function generateStaticParams() {
  return readingTestIds().map((testId) => ({ testId }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/reading/[testId]">): Promise<Metadata> {
  const { testId } = await params;
  return { title: readingTest(testId)?.title };
}

export default async function ReadingPage({
  params,
}: PageProps<"/[locale]/reading/[testId]">) {
  const { testId } = await params;
  const test = readingTest(testId);
  if (!test) notFound();

  return <ReadingScreen test={test} />;
}
