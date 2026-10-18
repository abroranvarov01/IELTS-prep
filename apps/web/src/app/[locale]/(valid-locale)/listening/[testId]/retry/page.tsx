import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  listeningTest,
  listeningTestIds,
} from "@/entities/listening/content.server";
import { listeningChecking } from "@/entities/listening/keys.server";
import { RetryScreen } from "@/views/listening-test";

// A retry of questions from an earlier attempt, in the test-screen layout.
// Learners answer on this page, so only the key's revision reaches it, to
// find the source's current result, never the key or the transcript
// (ADR-0014 §6).
export function generateStaticParams() {
  return listeningTestIds().map((testId) => ({ testId }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/listening/[testId]/retry">): Promise<Metadata> {
  const { testId } = await params;
  return { title: listeningTest(testId)?.title };
}

// The params are read inside the Suspense boundary, so a navigation to the
// retry stays instant (as the test route).
export default function ListeningRetryPage({
  params,
}: PageProps<"/[locale]/listening/[testId]/retry">) {
  return (
    <Suspense>
      <Retry params={params} />
    </Suspense>
  );
}

async function Retry({
  params,
}: Pick<PageProps<"/[locale]/listening/[testId]/retry">, "params">) {
  const { testId } = await params;
  const test = listeningTest(testId);
  const checking = listeningChecking(testId);
  if (!test || !checking) notFound();

  // The source attempt and the questions are chosen by the address and read
  // from the device.
  return <RetryScreen test={test} keyRevision={checking.key.revision} />;
}
