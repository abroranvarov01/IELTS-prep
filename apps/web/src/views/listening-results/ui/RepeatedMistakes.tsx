"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { PatternCategory, PatternsView } from "@/entities/listening";
import { QuietLink } from "@/shared/ui/QuietLink";

/** English words inside a localized string (`<en>…</en>` in the catalogs). */
const en = (chunks: ReactNode) => <span lang="en">{chunks}</span>;

/** The card texts Listening reuses from Reading (USER_FLOWS.md, M9 copy); the rest are its own. */
const FROM_READING: Partial<Record<PatternCategory, string[]>> = {
  oneLetterAway: ["title", "count"],
  wordLimit: ["title", "count"],
  paraphrase: ["title"],
};

/**
 * "Mistakes that repeated" on a Listening test attempt's results
 * (LISTENING_EXPERIENCE.md, Error Intelligence (M9); as Reading's pattern
 * card): what the first try's questions show, scoped to this test on this
 * device and labelled as a rough rule (LD15), never a cause or a lasting
 * weakness. Each card offers its questions again.
 */
export function RepeatedMistakes({
  testId,
  view,
}: {
  testId: string;
  view: PatternsView;
}) {
  const t = useTranslations("reading.patterns");
  const listening = useTranslations("listening.patterns");
  const text = (
    category: PatternCategory,
    field: "title" | "count" | "tip",
    values: Record<string, string | number> = {},
  ) => {
    const key = `${category}.${field}`;
    return FROM_READING[category]?.includes(field)
      ? t.rich(key as Parameters<typeof t.rich>[0], { ...values, en })
      : listening.rich(key as Parameters<typeof listening.rich>[0], {
          ...values,
          en,
        });
  };

  return (
    <section aria-labelledby="patterns-title">
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
            {view.scope === "thisTry" ? t("scopeThisTry") : t("scopeFirstTry")}{" "}
            {listening("heuristic")}
          </p>
          {view.patterns.length === 0 ? (
            <p className="mt-4">
              {view.scope === "thisTry"
                ? listening("noneThisTry")
                : listening("noneFirstTry")}
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {view.patterns.map(({ category, units, total }) => (
                <li key={category} className="rounded-lg bg-surface-warm p-4">
                  <h3 className="text-heading-3 font-bold">
                    {text(category, "title")}
                  </h3>
                  <p className="mt-2">
                    {text(category, "count", {
                      count: units.length,
                      total,
                      numbers: units
                        .map((unit) => unit.numbers.join("–"))
                        .join(", "),
                    })}
                  </p>
                  <p className="mt-2 text-text-secondary">
                    {text(category, "tip")}
                  </p>
                  <QuietLink
                    href={`/listening/${testId}/retry?of=${encodeURIComponent(view.firstTryId)}&q=${units.flatMap((unit) => unit.numbers).join(",")}`}
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
