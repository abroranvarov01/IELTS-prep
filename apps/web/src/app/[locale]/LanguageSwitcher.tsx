"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// A disclosure with plain links (not an ARIA menu), so it also works
// without JavaScript. The effect only adds Escape and outside-tap closing.
export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const details = detailsRef.current;
    if (!isOpen || !details) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      details.open = false;
      summaryRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!details.contains(event.target as Node)) {
        details.open = false;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  return (
    <details
      ref={detailsRef}
      className="group relative"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary
        ref={summaryRef}
        aria-label={t("label", {
          code: t("code"),
          language: t(`languages.${locale}`),
        })}
        className="flex min-h-12 cursor-pointer list-none items-center gap-1 rounded-md border border-border-control px-3 font-bold [&::-webkit-details-marker]:hidden"
      >
        {t("code")}
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-4 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </summary>
      <ul
        aria-label={t("listLabel")}
        className="absolute end-[0] top-full z-10 mt-2 w-max rounded-md bg-surface-base py-2 shadow-raised"
      >
        {routing.locales.map((code) => {
          const isCurrent = code === locale;
          return (
            <li key={code}>
              <Link
                href={pathname}
                locale={code}
                lang={code}
                aria-current={isCurrent ? "true" : undefined}
                onClick={(event) => {
                  if (isCurrent) event.preventDefault();
                  if (detailsRef.current) detailsRef.current.open = false;
                }}
                className="flex min-h-12 items-center justify-between gap-4 px-4 hover:bg-surface-warm aria-[current=true]:font-bold"
              >
                {t(`languages.${code}`)}
                {isCurrent && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m3 8 3.5 3.5L13 5" />
                  </svg>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
