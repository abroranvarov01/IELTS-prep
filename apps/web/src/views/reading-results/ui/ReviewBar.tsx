"use client";

import { useTranslations } from "next-intl";
import type { ReadingTest } from "@/entities/reading";
import { ChevronIcon } from "@/shared/ui/icons";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { SecondaryButton } from "@/shared/ui/SecondaryButton";
import type { ReviewPosition, ReviewSet } from "../model/review";
import { ReviewCell } from "./ReviewParts";

/**
 * The review's desktop navigator bar (READING_EXPERIENCE.md, Evidence-first
 * review (M5)): the M4 bar with outcome badges. The passage on screen's
 * questions come first as cells, the other passages as one button each, then
 * Previous and Next within the sequence. Its height follows its content, and
 * its labels stay text (M4 decisions).
 */
export function ReviewBar({
  test,
  position,
  onGo,
}: {
  test: ReadingTest;
  position: ReviewPosition;
  onGo: (number: number, set: ReviewSet) => void;
}) {
  const t = useTranslations("reading");
  const { all, set, cards, index } = position;
  const current = cards[index];
  const previous = cards[index - 1];
  const next = cards[index + 1];
  if (!current) return null;
  const onScreen = current.unit.passageNumber;

  return (
    // One wrapping row of items, so the bar stays as low as the window allows.
    <section
      aria-label={t("navigator.open")}
      className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle px-gutter py-2"
    >
      {[
        ...test.passages.filter((p) => p.number === onScreen),
        ...test.passages.filter((p) => p.number !== onScreen),
      ].map((passage) => {
        const shown = all.filter(
          (card) => card.unit.passageNumber === passage.number,
        );
        // A retry may leave a passage without questions.
        if (shown.length === 0) return null;
        const first = shown[0]?.unit.numbers[0] ?? 1;
        if (passage.number !== onScreen)
          return (
            // The passage's first question, in the sequence when it holds it.
            <button
              key={passage.id}
              type="button"
              onClick={() => onGo(first, set)}
              className={QUIET_BUTTON}
            >
              {t("navigator.passage", { number: passage.number })}
              <ChevronIcon direction="right" />
            </button>
          );
        return (
          <div key={passage.id} className="flex flex-wrap items-center gap-x-3">
            <span className="font-bold">
              {t("navigator.passage", { number: passage.number })}
            </span>
            <ul className="flex flex-wrap gap-1 pt-2">
              {shown.flatMap((card) =>
                card.unit.numbers.map((number) => (
                  <li key={number} className="pb-2">
                    <ReviewCell
                      number={number}
                      card={card}
                      isCurrent={card === current}
                      onChoose={(chosen) => onGo(chosen, "all")}
                    />
                  </li>
                )),
              )}
            </ul>
          </div>
        );
      })}
      <div className="ms-auto flex flex-wrap items-center gap-x-2 gap-y-2">
        {previous && (
          <SecondaryButton
            onClick={() => onGo(previous.unit.numbers[0] ?? 1, set)}
          >
            <ChevronIcon direction="left" />
            {t("question.previous")}
          </SecondaryButton>
        )}
        {next && (
          <SecondaryButton onClick={() => onGo(next.unit.numbers[0] ?? 1, set)}>
            {t("question.next")}
            <ChevronIcon direction="right" />
          </SecondaryButton>
        )}
      </div>
    </section>
  );
}
