import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/shared/i18n/routing";

// [locale] matches any first segment (e.g. /api/..., /old-page.html, which the
// proxy does not handle). The locale layout renders those in the default
// locale; this nested layout then 404s inside [locale]'s not-found boundary,
// so they get the localized not-found page instead of the framework's.
export default async function ValidLocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return children;
}
