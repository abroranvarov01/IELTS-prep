"use client";

import { useLocale, useTranslations } from "next-intl";
import { StatusMessage } from "../StatusMessage";

export default function LocaleError({ retry }: { retry: () => void }) {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <StatusMessage
      title={t("error.title")}
      body={t("error.body")}
      home={{ href: `/${locale}`, label: t("common.goHome") }}
      retry={{ label: t("error.retry"), onRetry: retry }}
    />
  );
}
