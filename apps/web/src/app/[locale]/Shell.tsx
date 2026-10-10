import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * The app shell (USER_FLOWS.md, App shell): skip link, header, main. Every
 * page uses it except the Reading test screen, which has its own test bar
 * (READING_EXPERIENCE.md, Mobile reading screen).
 */
export function Shell({ children }: { children: ReactNode }) {
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
        <LanguageSwitcher />
      </header>
      {/* main is only a skip-link target, not a control: no focus ring. */}
      <main id="main" tabIndex={-1} className="px-gutter focus:outline-none">
        <div className="mx-auto max-w-content">{children}</div>
      </main>
    </>
  );
}
