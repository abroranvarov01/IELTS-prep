import type { ReactNode } from "react";
import { Link } from "@/shared/i18n/navigation";

/** A secondary action, clearly quieter than the primary one (DESIGN_SYSTEM.md, M3 components). */
export function QuietLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center font-medium underline underline-offset-4"
    >
      {children}
    </Link>
  );
}
