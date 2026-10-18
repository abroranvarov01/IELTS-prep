import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  listeningTest,
  listeningTestIds,
} from "@/entities/listening/content.server";
import { readingTest, readingTestIds } from "@/entities/reading/content.server";
import { PracticeHub } from "@/views/practice";

// The Practice Hub (M6): every shipped test; its state on this device is read
// by the page after mounting.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("practice");
  return { title: t("title") };
}

export default function PracticePage() {
  const tests = readingTestIds().flatMap((id) => readingTest(id) ?? []);
  const listening = listeningTestIds().flatMap((id) => listeningTest(id) ?? []);
  return <PracticeHub tests={tests} listeningTests={listening} />;
}
