import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("app");

  return <h1>{t("name")}</h1>;
}
