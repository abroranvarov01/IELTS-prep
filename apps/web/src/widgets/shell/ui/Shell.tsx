import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MainNavigation } from "./MainNavigation";

/**
 * The app shell (USER_FLOWS.md, App shell; Navigation and Practice Hub (M6)):
 * skip link, header, main, and the product navigation, in the header from the
 * tablet breakpoint and as a bar at the bottom below it. Every page uses it
 * except the Reading test screens, which have their own test bar; onboarding
 * uses it without the navigation (`navigation={false}`).
 */
export function Shell({
  navigation = true,
  children,
}: {
  navigation?: boolean;
  children: ReactNode;
}) {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <>
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
        <div className="flex items-center gap-2">
          {navigation && <MainNavigation placement="header" />}
          <LanguageSwitcher />
        </div>
      </header>
      {/* main is only a skip-link target, not a control: no focus ring. */}
      {/* On phones the bar covers the window's bottom: room for it under main. */}
      <main
        id="main"
        tabIndex={-1}
        className={`px-gutter focus:outline-none ${
          navigation
            ? "pb-[calc(var(--spacing-16)+var(--spacing-4)+env(safe-area-inset-bottom))] tablet:pb-[0]"
            : ""
        }`}
      >
        <div className="mx-auto max-w-content">{children}</div>
      </main>
      {navigation && <MainNavigation placement="bar" />}
    </>
  );
}
