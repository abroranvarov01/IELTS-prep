import { SerwistProvider } from "@serwist/turbopack/react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Literata, Onest } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
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
  const t = await getTranslations();

  return (
    <html lang={locale} className={`${onest.variable} ${literata.variable}`}>
      <body>
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
          cacheOnNavigation={false}
          reloadOnOnline={false}
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:block focus:px-gutter focus:py-3 focus:font-bold focus:underline"
          >
            {t("shell.skipToContent")}
          </a>
          <header className="px-gutter py-2">
            <Link href={`/${locale}`} className="inline-block">
              <Image
                src="/brand/logo-horizontal-no-tagline.svg"
                alt={t("app.name")}
                width={470}
                height={120}
                loading="eager"
                className="h-12 w-auto"
              />
            </Link>
          </header>
          {/* main is only a skip-link target, not a control: no focus ring. */}
          <main
            id="main"
            tabIndex={-1}
            className="px-gutter focus:outline-none"
          >
            <div className="mx-auto max-w-content">{children}</div>
          </main>
        </SerwistProvider>
      </body>
    </html>
  );
}
