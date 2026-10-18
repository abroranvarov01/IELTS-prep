"use client";

import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import type { UnitOutcome } from "@/entities/reading";
import type { ReviewCard } from "../model/review";
import { OutcomeIcon } from "@/shared/ui/OutcomeIcon";

// What the phone sheet and the desktop layout of the review share: the card's
// heading and the navigator's cells (DESIGN_SYSTEM.md, M5: review card,
// navigator outcome badges).

const OUTCOME_WORD = {
  correct: "review.correct",
  incorrect: "review.incorrect",
  unanswered: "review.unanswered",
} as const;

const STATE_WORD = {
  correct: "navigator.correct",
  partlyCorrect: "navigator.partly",
  incorrect: "navigator.incorrect",
  unanswered: "navigator.unanswered",
} as const satisfies Record<UnitOutcome, string>;

/**
 * "Question 5 of 40" (or "Questions 22–23") with the unit's outcome as icon
 * and word on its own line, so focusing the heading announces the outcome.
 */
export function ReviewHeading({
  card,
  total,
  headingRef,
}: {
  card: ReviewCard;
  /** The test's or form's positions (40, or 14 for the level check). */
  total: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const t = useTranslations("reading");
  const { unit, outcome } = card;
  return (
    <h2
      id="question-heading"
      ref={headingRef}
      tabIndex={-1}
      className="text-heading-3 font-bold focus:outline-none"
    >
      {unit.numbers.length > 1
        ? t("question.range", {
            from: unit.numbers[0] ?? 0,
            to: unit.numbers.at(-1) ?? 0,
          })
        : t("question.of", { number: unit.key, total })}
      <span className="mt-1 flex items-center gap-2 text-body">
        <OutcomeIcon outcome={outcome} />
        {outcome === "partlyCorrect"
          ? t("review.partly", {
              correct: card.marks,
              total: unit.numbers.length,
            })
          : t(OUTCOME_WORD[outcome])}
      </span>
    </h2>
  );
}

/**
 * One 44 px question cell with its unit's outcome badge. All cells are
 * outlined, so the badge shapes carry the outcome, named in words; both
 * numbers of a "choose several" item carry the unit's badge and name.
 */
export function ReviewCell({
  number,
  card,
  isCurrent,
  onChoose,
}: {
  number: number;
  card: ReviewCard;
  isCurrent: boolean;
  onChoose: (number: number) => void;
}) {
  const t = useTranslations("reading");
  const { unit, outcome } = card;
  const states = [
    t(STATE_WORD[outcome]),
    ...(isCurrent ? [t("navigator.current")] : []),
  ].join(", ");

  return (
    // The badge sits on the cell's corner, outside the button.
    <div className="relative">
      <button
        type="button"
        aria-label={
          unit.numbers.length > 1
            ? t("navigator.itemRange", {
                from: unit.numbers[0] ?? 0,
                to: unit.numbers.at(-1) ?? 0,
                states,
              })
            : t("navigator.item", { number: unit.key, states })
        }
        aria-current={isCurrent ? "true" : undefined}
        onClick={() => onChoose(number)}
        className={`relative flex size-[2.75rem] items-center justify-center rounded-sm border bg-surface-base font-bold tabular-nums ${
          outcome === "unanswered" ? "border-border-control" : "border-ink"
        } ${isCurrent ? "after:absolute after:-bottom-[7px] after:inset-x-[0] after:h-[3px] after:bg-ink" : ""}`}
      >
        {number}
      </button>
      <span className="pointer-events-none absolute -top-1 -right-1 rounded-full bg-surface-base">
        <OutcomeIcon outcome={outcome} size={16} />
      </span>
    </div>
  );
}
