import { SerwistProvider } from "@serwist/turbopack/react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Literata, Onest } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";

const onest = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-onest",
});

// Passage font. Not preloaded: no page shows a passage yet.
const literata = Literata({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-literata",
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");

  return { title: t("name") };
}

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${onest.variable} ${literata.variable}`}>
      <body>
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
          cacheOnNavigation={false}
          reloadOnOnline={false}
        >
          {children}
        </SerwistProvider>
      </body>
    </html>
  );
}
