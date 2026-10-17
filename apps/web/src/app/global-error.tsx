"use client";

import { createTranslator, hasLocale } from "next-intl";
import { usePathname } from "next/navigation";
import en from "../../messages/en.json";
import ru from "../../messages/ru.json";
import uz from "../../messages/uz.json";
import { routing } from "@/shared/i18n/routing";
import { fontVariables } from "./fonts";
import "./globals.css";
import { RetryPicture, StatusMessage } from "@/shared/ui/StatusMessage";

const catalogs = { uz, ru, en };

// Replaces the locale layout when the shell itself fails, so there is no
// header and no message provider. Language: the URL's locale when valid,
// otherwise the default locale.
export default function GlobalError({ retry }: { retry: () => void }) {
  const segment = usePathname()?.split("/")[1];
  const locale = hasLocale(routing.locales, segment)
    ? segment
    : routing.defaultLocale;
  const t = createTranslator({ locale, messages: catalogs[locale] });

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <title>{t("error.title")}</title>
        <main className="px-gutter">
          <div className="mx-auto max-w-content">
            <StatusMessage
              title={t("error.title")}
              body={t("error.body")}
              picture={(size) => <RetryPicture size={size} />}
              home={{ href: `/${locale}`, label: t("common.goHome") }}
              retry={{ label: t("error.retry"), onRetry: retry }}
            />
          </div>
        </main>
      </body>
    </html>
  );
}
