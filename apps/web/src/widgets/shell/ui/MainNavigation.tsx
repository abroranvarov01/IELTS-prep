"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { LineIcon } from "@/shared/ui/icons";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";

const DESTINATIONS = [
  { href: "/", key: "home", icon: HomeIcon },
  { href: "/practice", key: "practice", icon: PracticeIcon },
] as const;

/**
 * The product navigation (USER_FLOWS.md, Navigation and Practice Hub (M6);
 * DESIGN_SYSTEM.md, M6 components): labelled destinations, the current one
 * marked by weight, an indicator bar and `aria-current`, never by color alone.
 * `placement` is where it sits: the header from the tablet breakpoint, or the
 * bar at the bottom of the window below it. The shell renders both; CSS shows
 * one, so screen readers meet only the visible one.
 */
export function MainNavigation({ placement }: { placement: "header" | "bar" }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (placement === "header")
    return (
      <nav aria-label={t("label")} className="hidden tablet:block">
        <ul className="flex items-center gap-1">
          {DESTINATIONS.map(({ href, key, icon: Icon }) => {
            const current = isCurrent(href);
            return (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={`${QUIET_BUTTON} relative aria-[current=page]:font-bold`}
                >
                  <Icon className="size-4" />
                  {t(key)}
                  {current && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-brand-primary"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );

  return (
    <nav
      aria-label={t("label")}
      className="fixed inset-x-[0] bottom-[0] z-20 border-t border-border-subtle bg-surface-base pb-[env(safe-area-inset-bottom)] tablet:hidden"
    >
      <ul className="flex px-2 py-2">
        {DESTINATIONS.map(({ href, key, icon: Icon }) => {
          const current = isCurrent(href);
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-center text-meta font-medium text-text-secondary transition-colors active:bg-brand-blush-soft aria-[current=page]:font-bold aria-[current=page]:text-ink"
              >
                <span
                  aria-hidden="true"
                  className={`h-[3px] w-6 rounded-full ${current ? "bg-brand-primary" : ""}`}
                />
                <Icon className="size-[1.25rem]" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ className }: { className: string }) {
  return (
    <LineIcon className={className}>
      <path d="M2.5 7.25 8 2.75l5.5 4.5v6a.75.75 0 0 1-.75.75h-3v-4h-3.5v4h-3a.75.75 0 0 1-.75-.75z" />
    </LineIcon>
  );
}

function PracticeIcon({ className }: { className: string }) {
  return (
    <LineIcon className={className}>
      <path d="M8 4.25C6.75 3.25 4.75 2.75 2.25 3v9.5c2.5-.25 4.5.25 5.75 1.25 1.25-1 3.25-1.5 5.75-1.25V3C11.25 2.75 9.25 3.25 8 4.25zM8 4.25v9.5" />
      <path d="m9.75 8.25 1.25 1.25 2-2.25" />
    </LineIcon>
  );
}
