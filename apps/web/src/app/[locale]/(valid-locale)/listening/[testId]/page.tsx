import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  listeningTest,
  listeningTestIds,
} from "@/entities/listening/content.server";
import { ListeningScreen } from "@/views/listening-test";

export function generateStaticParams() {
  return listeningTestIds().map((testId) => ({ testId }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/listening/[testId]">): Promise<Metadata> {
  const { testId } = await params;
  return { title: listeningTest(testId)?.title };
}

export default async function ListeningPage({
  params,
}: PageProps<"/[locale]/listening/[testId]">) {
  const { testId } = await params;
  const test = listeningTest(testId);
  if (!test) notFound();

  // The start screen reads ?mode= (useSearchParams needs a Suspense boundary).
  return (
    <Suspense>
      <ListeningScreen test={test} />
    </Suspense>
  );
}
