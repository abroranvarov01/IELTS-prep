"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { PatternsView } from "@/entities/reading";
import { QuietLink } from "@/shared/ui/QuietLink";

/** English words inside a localized string (`<en>…</en>` in the catalogs). */
const en = (chunks: ReactNode) => <span lang="en">{chunks}</span>;

/**
 * "Mistakes that repeated" on a test attempt's results (READING_EXPERIENCE.md,
 * Error Intelligence (M5); DESIGN_SYSTEM.md, M5: pattern card): what the
 * first try's questions show, scoped to this test on this device, never a
 * cause or a lasting weakness. Each card offers its questions again.
 */
export function RepeatedMistakes({
  testId,
  view,
}: {
  testId: string;
  view: PatternsView;
}) {
  const t = useTranslations("reading.patterns");

  return (
    <section aria-labelledby="patterns-title" className="mt-8">
      <h2 id="patterns-title" className="text-heading-2 font-bold">
        {t("title")}
      </h2>
      {view.kind === "unknownFirstTry" && (
        <p className="mt-2">{t("unknownFirstTry")}</p>
      )}
      {view.kind === "unavailable" && (
        <p className="mt-2">{t("unavailable")}</p>
      )}
      {view.kind === "patterns" && (
        <>
          <p className="mt-2 text-text-secondary">
            {view.scope === "thisTry" ? t("scopeThisTry") : t("scopeFirstTry")}
          </p>
          {view.patterns.length === 0 ? (
            <p className="mt-4">
              {view.scope === "thisTry" ? t("noneThisTry") : t("noneFirstTry")}
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {view.patterns.map(({ category, units, total }) => (
                <li key={category} className="rounded-lg bg-surface-warm p-4">
                  <h3 className="text-heading-3 font-bold">
                    {t.rich(`${category}.title`, { en })}
                  </h3>
                  <p className="mt-2">
                    {t.rich(`${category}.count`, {
                      count: units.length,
                      total,
                      numbers: units
                        .map((unit) => unit.numbers.join("–"))
                        .join(", "),
                      en,
                    })}
                  </p>
                  <p className="mt-2 text-text-secondary">
                    {t.rich(`${category}.tip`, { en })}
                  </p>
                  <QuietLink
                    href={`/reading/${testId}/retry?of=${encodeURIComponent(view.firstTryId)}&q=${units.flatMap((unit) => unit.numbers).join(",")}`}
                  >
                    {t("practise")}
                  </QuietLink>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
