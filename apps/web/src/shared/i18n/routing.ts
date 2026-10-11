import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // "uz" is Uzbek Latin (ADR-0001 §6).
  locales: ["uz", "ru", "en"],
  defaultLocale: "uz",
  localePrefix: "always",
});
