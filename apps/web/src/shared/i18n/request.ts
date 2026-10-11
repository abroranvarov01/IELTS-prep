import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const paramValue = await rootParams.locale();
    // An invalid first segment renders in the default locale and then 404s
    // in app/[locale]/(valid-locale)/layout.tsx.
    locale = hasLocale(routing.locales, paramValue)
      ? paramValue
      : routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
