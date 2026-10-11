import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Home } from "@/views/home";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return { title: t("title") };
}

export default function HomePage() {
  return <Home />;
}
