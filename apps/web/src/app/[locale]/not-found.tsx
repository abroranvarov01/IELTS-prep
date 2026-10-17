import { getLocale, getTranslations } from "next-intl/server";
import { SignpostPicture, StatusMessage } from "@/shared/ui/StatusMessage";
import { Shell } from "@/widgets/shell";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations();

  return (
    <>
      <title>{t("notFound.title")}</title>
      <Shell>
        <StatusMessage
          title={t("notFound.title")}
          body={t("notFound.body")}
          picture={(size) => <SignpostPicture size={size} />}
          home={{ href: `/${locale}`, label: t("common.goHome") }}
        />
      </Shell>
    </>
  );
}
