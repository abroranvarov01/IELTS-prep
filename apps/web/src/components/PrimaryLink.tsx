import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { PRIMARY_ACTION } from "./primary-action";

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
    <Link href={href} className={PRIMARY_ACTION}>
      {children}
    </Link>
  );
}
