import { getLocale, getTranslations } from "next-intl/server";
import { StatusMessage } from "../StatusMessage";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations();

  return (
    <>
      <title>{t("notFound.title")}</title>
      <StatusMessage
        title={t("notFound.title")}
        body={t("notFound.body")}
        home={{ href: `/${locale}`, label: t("common.goHome") }}
      />
    </>
  );
}
