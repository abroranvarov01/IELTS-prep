"use client";

import { useTranslations } from "next-intl";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  QUESTION_COUNT,
  type ReadingTest,
  type SheetState,
} from "@/entities/reading";
import { ChevronIcon, GridIcon } from "@/shared/ui/icons";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { SecondaryButton } from "@/shared/ui/SecondaryButton";
import { BottomSheet } from "@/widgets/reading-layout";
import type { ReviewPosition, ReviewSet } from "../model/review";
import { OutcomeIcon } from "./OutcomeIcon";
import { ReviewNavigator } from "./ReviewNavigator";

const OUTCOME_WORD = {
  correct: "review.correct",
  incorrect: "review.incorrect",
  unanswered: "review.unanswered",
} as const;

/**
 * The review on phones and tablets (READING_EXPERIENCE.md, Evidence-first
 * review (M5)): the current card in the bottom sheet, its heading naming the
 * question and its outcome, "All questions" opening the navigator with
 * outcome badges in the expanded sheet, Previous and Next within the
 * sequence.
 */
export function ReviewSheet({
  test,
  position,
  state,
  onStateChange,
  onGo,
  headingRef,
  children,
}: {
  test: ReadingTest;
  position: ReviewPosition;
  state: SheetState;
  onStateChange: (state: SheetState) => void;
  /** Shows a question's card, in the given sequence. */
  onGo: (number: number, set: ReviewSet) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** The current card. */
  children: ReactNode;
}) {
  const t = useTranslations("reading");
  const { set, cards, index } = position;
  const card = cards[index];
  const previous = cards[index - 1];
  const next = cards[index + 1];
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const navigatorButtonRef = useRef<HTMLButtonElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const isOpen = state !== "collapsed";
  const showsNavigator = isOpen && navigatorOpen;

  const openNavigator = () => {
    setNavigatorOpen(true);
    onStateChange("expanded");
  };
  const closeNavigator = (returnFocus: boolean) => {
    setNavigatorOpen(false);
    onStateChange("partial");
    if (returnFocus)
      requestAnimationFrame(() => navigatorButtonRef.current?.focus());
  };

  useEffect(() => {
    if (showsNavigator) panelHeadingRef.current?.focus();
  }, [showsNavigator]);

  // Escape closes the navigator and returns to "All questions".
  useEffect(() => {
    if (!showsNavigator) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNavigatorOpen(false);
      onStateChange("partial");
      requestAnimationFrame(() => navigatorButtonRef.current?.focus());
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showsNavigator, onStateChange]);

  if (!card) return null;
  const { unit, outcome } = card;
  const label =
    unit.numbers.length > 1
      ? t("question.range", {
          from: unit.numbers[0] ?? 0,
          to: unit.numbers.at(-1) ?? 0,
        })
      : t("question.of", { number: unit.key, total: QUESTION_COUNT });
  const outcomeWord =
    outcome === "partlyCorrect"
      ? t("review.partly", {
          correct: card.marks,
          total: unit.numbers.length,
        })
      : t(OUTCOME_WORD[outcome]);

  return (
    <BottomSheet
      label={t("sheet.label")}
      state={state}
      onStateChange={(sheet) => {
        if (sheet === "collapsed") setNavigatorOpen(false);
        onStateChange(sheet);
      }}
      bodyId="question-body"
      header={
        <h2
          id="question-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-heading-3 font-bold focus:outline-none"
        >
          {label}
          <span className="mt-1 flex items-center gap-2 text-body">
            <OutcomeIcon outcome={outcome} />
            {outcomeWord}
          </span>
        </h2>
      }
    >
      {isOpen && !showsNavigator && (
        // One row under the heading: the sequence's progress, then the navigator.
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 px-gutter">
          {set === "mistakes" ? (
            <p className="text-meta text-text-secondary">
              {t("review.toReview", {
                current: index + 1,
                total: cards.length,
              })}
            </p>
          ) : (
            <span />
          )}
          <button
            ref={navigatorButtonRef}
            type="button"
            onClick={openNavigator}
            className={`${QUIET_BUTTON} -me-3`}
          >
            <GridIcon />
            {t("navigator.open")}
          </button>
        </div>
      )}

      {showsNavigator && (
        <div
          id="question-body"
          className="min-h-0 flex-1 overflow-y-auto px-gutter pt-2 pb-4"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              ref={panelHeadingRef}
              tabIndex={-1}
              className="text-heading-3 font-bold focus:outline-none"
            >
              {t("navigator.open")}
            </h2>
            <button
              type="button"
              onClick={() => closeNavigator(true)}
              className={`${QUIET_BUTTON} -me-3`}
            >
              <ChevronIcon direction="left" />
              {t("sheet.back")}
            </button>
          </div>
          <div className="mt-4">
            <ReviewNavigator
              test={test}
              cards={position.all}
              current={card}
              onChoose={(number) => {
                closeNavigator(false);
                onGo(number, "all");
              }}
            />
          </div>
        </div>
      )}

      {isOpen && !showsNavigator && (
        <>
          {/* A new element per card, so each one starts at its top. */}
          <div
            key={unit.key}
            id="question-body"
            className="min-h-0 flex-1 overflow-y-auto px-gutter pt-2 pb-4"
          >
            {children}
          </div>
          <div className="flex shrink-0 flex-wrap justify-between gap-x-4 gap-y-2 border-t border-border-subtle px-gutter py-2">
            {previous ? (
              <SecondaryButton
                onClick={() => onGo(previous.unit.numbers[0] ?? 1, set)}
              >
                <ChevronIcon direction="left" />
                {t("question.previous")}
              </SecondaryButton>
            ) : (
              <span />
            )}
            {next && (
              <SecondaryButton
                onClick={() => onGo(next.unit.numbers[0] ?? 1, set)}
              >
                {t("question.next")}
                <ChevronIcon direction="right" />
              </SecondaryButton>
            )}
          </div>
        </>
      )}
    </BottomSheet>
  );
}
