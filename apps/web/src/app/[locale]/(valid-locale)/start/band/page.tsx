import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TargetBandStep } from "@/features/onboarding/TargetBandStep";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding.targetBand");
  return { title: t("title") };
}

export default function TargetBandPage() {
  return <TargetBandStep />;
}
