"use client";

import { useTranslations } from "next-intl";
import type { ReadingTest, UnitOutcome } from "@/entities/reading";
import type { ReviewCard } from "../model/review";
import { OutcomeIcon } from "./OutcomeIcon";

const STATE_WORD = {
  correct: "navigator.correct",
  partlyCorrect: "navigator.partly",
  incorrect: "navigator.incorrect",
  unanswered: "navigator.unanswered",
} as const satisfies Record<UnitOutcome, string>;

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
              {shown.flatMap(({ unit, outcome }) => {
                const isCurrent = unit === current.unit;
                const states = [
                  t(STATE_WORD[outcome]),
                  ...(isCurrent ? [t("navigator.current")] : []),
                ].join(", ");
                const name =
                  unit.numbers.length > 1
                    ? t("navigator.itemRange", {
                        from: unit.numbers[0] ?? 0,
                        to: unit.numbers.at(-1) ?? 0,
                        states,
                      })
                    : t("navigator.item", { number: unit.key, states });
                return unit.numbers.map((number) => (
                  // The badge sits on the cell's corner, outside the button.
                  <li key={number} className="relative pb-2">
                    <button
                      type="button"
                      aria-label={name}
                      aria-current={isCurrent ? "true" : undefined}
                      onClick={() => onChoose(number)}
                      className={`relative flex size-[2.75rem] items-center justify-center rounded-sm border bg-surface-base font-bold tabular-nums ${
                        outcome === "unanswered"
                          ? "border-border-control"
                          : "border-ink"
                      } ${isCurrent ? "after:absolute after:-bottom-[7px] after:inset-x-[0] after:h-[3px] after:bg-ink" : ""}`}
                    >
                      {number}
                    </button>
                    <span className="pointer-events-none absolute -top-1 -right-1 rounded-full bg-surface-base">
                      <OutcomeIcon outcome={outcome} size={16} />
                    </span>
                  </li>
                ));
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
