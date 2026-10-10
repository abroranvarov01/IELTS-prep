import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/** The compact bar that replaces the shell header on the test screen (READING_EXPERIENCE.md). */
export function TestBar({ children }: { children?: ReactNode }) {
  const t = useTranslations("reading");

  return (
    <header className="sticky top-[0] z-20 flex h-12 items-center gap-4 border-b border-border-subtle bg-surface-base px-gutter">
      <Link
        href="/"
        className="inline-flex min-h-12 items-center font-medium underline"
      >
        {t("exit")}
      </Link>
      <div className="flex flex-1 items-center justify-end gap-4">
        {children}
      </div>
    </header>
  );
}
