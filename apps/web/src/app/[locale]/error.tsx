"use client";

import { useLocale, useTranslations } from "next-intl";
import { RetryPicture, StatusMessage } from "@/shared/ui/StatusMessage";
import { Shell } from "@/widgets/shell";

export default function LocaleError({ retry }: { retry: () => void }) {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <Shell>
      <StatusMessage
        title={t("error.title")}
        body={t("error.body")}
        picture={(size) => <RetryPicture size={size} />}
        home={{ href: `/${locale}`, label: t("common.goHome") }}
        retry={{ label: t("error.retry"), onRetry: retry }}
      />
    </Shell>
  );
}
