"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type {
  AnswerKey,
  Explanations,
  ReadingAttempt,
  ReadingTest,
  ResultRecord,
  SheetState,
} from "@/entities/reading";
import { PassageView } from "@/features/mark-passage";
import { SHEET_HEIGHT } from "@/widgets/reading-layout";
import {
  type ReviewSet,
  keySentences,
  pinComparison,
  reviewCards,
  reviewPosition,
} from "../model/review";
import { ReviewCard } from "./ReviewCard";
import { ReviewSheet } from "./ReviewSheet";

/**
 * A checked attempt under review on phones and tablets (READING_EXPERIENCE.md,
 * Evidence-first review (M5)): the read-only passage with the attempt's
 * highlights and the current card's evidence and pins, and the card in the
 * sheet. The address (`q`, `set`) says which card is shown and is replaced on
 * every change, so Back leaves the review. Changing card moves focus to its
 * heading and scrolls the passage to the key's first sentence (D9).
 */
export function ReviewWorkspace({
  test,
  answerKey,
  explanations,
  attempt,
  record,
  bar,
  notice,
}: {
  test: ReadingTest;
  answerKey: AnswerKey;
  explanations: Explanations | undefined;
  attempt: ReadingAttempt;
  record: ResultRecord;
  /** The test bar, given the passage on screen. */
  bar: (passageNumber: number) => ReactNode;
  notice: ReactNode;
}) {
  const t = useTranslations("reading");
  const params = useSearchParams();
  const all = useMemo(
    () => reviewCards(test, attempt, record),
    [test, attempt, record],
  );
  const position = reviewPosition(all, params.get("set"), params.get("q"));
  const card = position.cards[position.index];
  const unit = card?.unit;
  const entry = unit && answerKey.answers[unit.numbers[0] ?? 0];
  const passage = test.passages.find((p) => p.number === unit?.passageNumber);
  const [sheet, setSheet] = useState<SheetState>("partial");
  const passageRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownPassage = useRef<string | undefined>(undefined);
  const firstSentence = keySentences(entry).sentenceIds[0];

  // On opening and on every card change: focus to the card's heading, and the
  // passage to the key's first sentence, instantly with reduced motion; with
  // none, the passage stays (the top of a passage not shown before).
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    const sentence =
      firstSentence &&
      passageRef.current?.querySelector(`[data-sentence="${firstSentence}"]`);
    const instant = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (sentence)
      sentence.scrollIntoView({
        block: "start",
        behavior: instant ? "instant" : "smooth",
      });
    else if (shownPassage.current !== passage?.id) window.scrollTo(0, 0);
    shownPassage.current = passage?.id;
  }, [unit?.key, firstSentence, passage?.id]);

  if (!card || !unit || !passage) return null;

  const go = (number: number, set: ReviewSet) => {
    const address = new URLSearchParams({
      attempt: attempt.id,
      q: String(number),
      set,
    });
    window.history.replaceState(null, "", `?${address}`);
  };
  // "Show in passage" lowers a raised sheet, then moves to the sentence.
  const showSentence = (id: string) => {
    if (sheet === "expanded") setSheet("partial");
    const sentence = passageRef.current?.querySelector<HTMLElement>(
      `[data-sentence="${id}"]`,
    );
    sentence?.scrollIntoView({ block: "start" });
    sentence?.focus({ preventScroll: true });
  };
  const evidence = keySentences(entry);
  const pins = pinComparison(unit, attempt, entry);

  return (
    <>
      <a
        href="#question-heading"
        className="sr-only focus:not-sr-only focus:block focus:px-gutter focus:py-3 focus:font-bold focus:underline"
      >
        {t("skipToQuestion")}
      </a>
      {bar(passage.number)}
      <main id="main" className="px-gutter">
        {notice}
        <PassageView
          ref={passageRef}
          passage={passage}
          bottomSpace={`calc(${SHEET_HEIGHT[sheet]} + 1rem)`}
          highlights={new Set(attempt.highlights ?? [])}
          selected={null}
          focusable={passage.paragraphs[0]?.sentences[0]?.id ?? ""}
          pins={
            pins
              ? {
                  number: unit.numbers[0] ?? 0,
                  sentenceIds: new Set(pins.sentenceIds),
                }
              : null
          }
          readOnly
          evidence={{
            number: unit.numbers[0] ?? 0,
            kind: evidence.kind,
            sentenceIds: new Set(evidence.sentenceIds),
          }}
        />
      </main>
      <ReviewSheet
        test={test}
        position={position}
        state={sheet}
        onStateChange={setSheet}
        onGo={go}
        headingRef={headingRef}
      >
        <ReviewCard
          test={test}
          unit={unit}
          outcome={card.outcome}
          attempt={attempt}
          entry={entry}
          signals={record.signals[unit.key] ?? []}
          explanation={explanations?.items[unit.key]}
          onShowSentence={showSentence}
        />
      </ReviewSheet>
    </>
  );
}
