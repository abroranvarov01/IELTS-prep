"use client";

import { useTranslations } from "next-intl";
import type { ReadingTest } from "@/entities/reading";
import type { ReviewCard } from "../model/review";
import { ReviewCell } from "./ReviewParts";

/**
 * Every question of the attempt, grouped by passage, each with its unit's
 * outcome badge (DESIGN_SYSTEM.md, M5: review navigator outcome badges): the
 * cells are all outlined, so the badge shapes carry the outcome, and each is
 * named in words. Both numbers of a "choose several" item show the unit's
 * badge and open its one card.
 */
export function ReviewNavigator({
  test,
  cards,
  current,
  onChoose,
}: {
  test: ReadingTest;
  cards: ReviewCard[];
  current: ReviewCard;
  onChoose: (number: number) => void;
}) {
  const t = useTranslations("reading");

  return (
    <div className="flex flex-col gap-6">
      {test.passages.map((passage) => {
        const shown = cards.filter(
          (card) => card.unit.passageNumber === passage.number,
        );
        if (shown.length === 0) return null;
        return (
          <section key={passage.id} aria-labelledby={`navigator-${passage.id}`}>
            <h3
              id={`navigator-${passage.id}`}
              className="text-heading-3 font-bold"
            >
              {t("navigator.passage", { number: passage.number })}
            </h3>
            {/* 44 px cells (DESIGN_SYSTEM.md, M4: question navigator). */}
            <ul className="mt-3 grid grid-cols-[repeat(auto-fill,2.75rem)] gap-1">
              {shown.flatMap((card) =>
                card.unit.numbers.map((number) => (
                  <li key={number} className="pb-2">
                    <ReviewCell
                      number={number}
                      card={card}
                      isCurrent={card.unit === current.unit}
                      onChoose={onChoose}
                    />
                  </li>
                )),
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
