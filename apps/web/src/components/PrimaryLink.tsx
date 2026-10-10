import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/**
 * The one red action of a screen, when it navigates (DESIGN_SYSTEM.md, M3
 * components: primary button). Full width on phones, natural width from the
 * tablet breakpoint. `href` is locale-free; the current locale is added.
 */
export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-brand-primary px-6 py-3 text-center font-bold text-surface-base transition-colors hover:bg-brand-primary-deep active:bg-brand-primary-deep tablet:w-auto"
    >
      {children}
    </Link>
  );
}
