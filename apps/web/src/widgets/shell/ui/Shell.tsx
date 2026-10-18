import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MainNavigation } from "./MainNavigation";

/**
 * The app shell (USER_FLOWS.md, App shell; Navigation and Practice Hub (M6);
 * DESIGN_SYSTEM.md, Direction v2: desktop sidebar): skip link, header, main,
 * and the product navigation: a sidebar with the logo from the desktop
 * breakpoint, header links from the tablet breakpoint below it, and a bar at
 * the bottom on phones. Every page uses it except the Reading test screens,
 * which have their own test bar; onboarding uses it without the navigation
 * (`navigation={false}`).
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
  const logo = (
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
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:block focus:px-gutter focus:py-3 focus:font-bold focus:underline"
      >
        {t("shell.skipToContent")}
      </a>
      <div className={navigation ? "desktop:flex" : ""}>
        {navigation && (
          <div className="hidden desktop:sticky desktop:top-[0] desktop:block desktop:h-dvh desktop:w-[15rem] desktop:shrink-0 desktop:border-e desktop:border-border-subtle">
            <div className="p-6">{logo}</div>
            <MainNavigation placement="sidebar" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {/* Enlarged text wraps the header's parts instead of widening the page; */}
          {/* below desktop they stay at the end, so the language list opens on screen. */}
          <header className="flex flex-wrap items-center justify-between gap-x-4 px-gutter py-2 desktop:px-8">
            <div className={navigation ? "desktop:hidden" : ""}>{logo}</div>
            <div className="ms-auto flex flex-wrap items-center justify-end gap-x-2 desktop:ms-[0]">
              {navigation && <MainNavigation placement="header" />}
              <LanguageSwitcher />
            </div>
          </header>
          {/* main is only a skip-link target, not a control: no focus ring. */}
          {/* On phones the bar covers the window's bottom: room for it under main. */}
          <main
            id="main"
            tabIndex={-1}
            className={`px-gutter focus:outline-none desktop:px-8 ${
              navigation
                ? "pb-[calc(var(--spacing-16)+var(--spacing-4)+env(safe-area-inset-bottom))] tablet:pb-[0]"
                : ""
            }`}
          >
            <div className="mx-auto max-w-content">{children}</div>
          </main>
        </div>
      </div>
      {navigation && <MainNavigation placement="bar" />}
    </>
  );
}
