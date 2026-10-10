import { SerwistProvider } from "@serwist/turbopack/react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { routing } from "@/i18n/routing";
import { fontVariables } from "../fonts";
import "../globals.css";
import { LanguageSwitcher } from "./LanguageSwitcher";

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
    <html lang={locale} className={fontVariables}>
      <body>
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
          cacheOnNavigation={false}
          reloadOnOnline={false}
        >
          <NextIntlClientProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:block focus:px-gutter focus:py-3 focus:font-bold focus:underline"
            >
              {t("shell.skipToContent")}
            </a>
            <header className="flex items-center justify-between gap-4 px-gutter py-2">
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
              <LanguageSwitcher />
            </header>
            {/* main is only a skip-link target, not a control: no focus ring. */}
            <main
              id="main"
              tabIndex={-1}
              className="px-gutter focus:outline-none"
            >
              <div className="mx-auto max-w-content">{children}</div>
            </main>
          </NextIntlClientProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
