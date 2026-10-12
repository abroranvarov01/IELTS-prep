"use client";

import { useLocale, useTranslations } from "next-intl";
import { type KeyboardEvent, useEffect, useRef } from "react";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { routing } from "@/shared/i18n/routing";
import { CheckIcon, ChevronIcon, LineIcon } from "@/shared/ui/icons";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";

// A disclosure with plain links (not an ARIA menu), so it also works
// without JavaScript. JavaScript only adds Escape and outside-tap closing.
// Both read details.open directly: the list can open before hydration, when
// React does not see the toggle event, so mirroring it in state would miss it.
// Escape is handled on the focusable parts (summary and links), where it
// arrives; jsx-a11y does not allow a key handler on <details> itself.
export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  const closeOnEscape = (event: KeyboardEvent) => {
    const details = detailsRef.current;
    if (event.key !== "Escape" || !details?.open) return;
    details.open = false;
    summaryRef.current?.focus();
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target as Node)) {
        details.open = false;
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        ref={summaryRef}
        onKeyDown={closeOnEscape}
        aria-label={t("label", {
          code: t("code"),
          language: t(`languages.${locale}`),
        })}
        className={`${QUIET_BUTTON} -me-3 cursor-pointer list-none group-open:bg-brand-blush-soft [&::-webkit-details-marker]:hidden`}
      >
        <LineIcon className="size-[1.25rem]">
          <circle cx="8" cy="8" r="6.25" />
          <path d="M1.75 8h12.5M8 1.75c-2.25 2.5-2.25 10 0 12.5M8 1.75c2.25 2.5 2.25 10 0 12.5" />
        </LineIcon>
        {t("code")}
        <ChevronIcon
          direction="down"
          className="size-4 group-open:rotate-180"
        />
      </summary>
      <ul
        aria-label={t("listLabel")}
        className="absolute end-[0] top-full z-10 mt-1 w-max rounded-md bg-surface-base p-1 shadow-raised"
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
                onKeyDown={closeOnEscape}
                onClick={(event) => {
                  if (isCurrent) event.preventDefault();
                  if (detailsRef.current) detailsRef.current.open = false;
                }}
                className="flex min-h-12 items-center justify-between gap-4 rounded-sm px-3 font-medium hover:bg-brand-blush-soft aria-[current=true]:font-bold"
              >
                {t(`languages.${code}`)}
                {isCurrent && <CheckIcon />}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
