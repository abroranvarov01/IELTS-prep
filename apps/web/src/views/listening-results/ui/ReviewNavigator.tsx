"use client";

import { useTranslations } from "next-intl";
import { type RefObject, useId } from "react";
import type { ListeningTest } from "@/entities/listening";
import { groupNumbers } from "@/entities/listening";
import { type Outcome, OutcomeIcon } from "@/shared/ui/OutcomeIcon";
import type { ReviewCard } from "../model/review";

const STATE_WORD = {
  correct: "navigator.correct",
  partlyCorrect: "navigator.partly",
  incorrect: "navigator.incorrect",
  unanswered: "navigator.unanswered",
} as const satisfies Record<Outcome, string>;

/**
 * "All questions" in the review (DESIGN_SYSTEM.md, M9: navigator in review):
 * the M8 navigator by part, each part with its count of correct answers,
 * every cell with its unit's outcome badge, named in words. Escape closes it
 * and the browser returns the focus to "All questions".
 */
export function ReviewNavigator({
  dialogRef,
  test,
  cards,
  current,
  onChoose,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  test: ListeningTest;
  cards: ReviewCard[];
  current: ReviewCard;
  onChoose: (number: number) => void;
}) {
  const t = useTranslations("reading");
  const l = useTranslations("listening");
  const id = useId();
  const cardOf = (n: number) => cards.find((c) => c.unit.numbers.includes(n));
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={id}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl bg-surface-base p-6 text-ink shadow-raised backdrop:bg-ink/40"
    >
      <h2 id={id} className="text-heading-3 font-bold">
        {t("navigator.open")}
      </h2>
      {test.parts.map((part) => {
        const numbers = part.questionGroups.flatMap(groupNumbers);
        const correct = numbers.filter((n) => {
          const card = cardOf(n);
          return card && card.unit.numbers.indexOf(n) < card.marks;
        }).length;
        return (
          <section key={part.id} className="mt-4">
            <h3 className="font-bold">
              {l("navigator.partResult", {
                number: part.number,
                correct,
                total: numbers.length,
              })}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {numbers.map((n) => {
                const card = cardOf(n);
                if (!card) return null;
                const isCurrent = card === current;
                const states = [
                  t(STATE_WORD[card.outcome]),
                  ...(isCurrent ? [t("navigator.current")] : []),
                ].join(", ");
                return (
                  <li key={n} className="relative">
                    <button
                      type="button"
                      aria-label={
                        card.unit.numbers.length > 1
                          ? t("navigator.itemRange", {
                              from: card.unit.numbers[0] ?? 0,
                              to: card.unit.numbers.at(-1) ?? 0,
                              states,
                            })
                          : t("navigator.item", { number: n, states })
                      }
                      aria-current={isCurrent ? "true" : undefined}
                      onClick={() => {
                        dialogRef.current?.close();
                        onChoose(n);
                      }}
                      className={`relative flex size-[2.75rem] items-center justify-center rounded-sm border bg-surface-base font-bold tabular-nums ${
                        card.outcome === "unanswered"
                          ? "border-border-control"
                          : "border-ink"
                      } ${isCurrent ? "after:absolute after:-bottom-[7px] after:inset-x-[0] after:h-[3px] after:bg-ink" : ""}`}
                    >
                      {n}
                    </button>
                    <span className="pointer-events-none absolute -top-1 -right-1 rounded-full bg-surface-base">
                      <OutcomeIcon outcome={card.outcome} size={16} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <div className="mt-6">
        <button
          type="button"
          className="underline underline-offset-4"
          onClick={() => dialogRef.current?.close()}
        >
          {t("sheet.back")}
        </button>
      </div>
    </dialog>
  );
}
