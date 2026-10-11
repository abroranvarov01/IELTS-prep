"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { answeredNumbers } from "@/domain/reading/session";
import { unitOf } from "@/domain/reading/units";
import { ConfirmDialog } from "./ConfirmDialog";
import { FINISH_TITLE_ID, FinishConfirmation } from "./FinishConfirmation";
import { FlagIcon, NavigatorCell } from "./QuestionNavigator";
import { useReading } from "./reading-context";
import { SecondaryButton } from "./SecondaryButton";

/**
 * The desktop navigator bar along the bottom (READING_EXPERIENCE.md, desktop
 * layout): the passage on screen's questions as cells, the other passages with
 * their progress, then "Mark for review" for the current question, Previous /
 * Next and "Finish test", which asks in a dialog (owner, 2026-10-11). Its
 * height follows its content: the approved labels do not fit one 64 px row.
 */
export function QuestionBar({ goTo }: { goTo: (number: number) => void }) {
  const t = useTranslations("reading");
  const { test, units, session, send } = useReading();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const finishHeadingRef = useRef<HTMLHeadingElement>(null);
  const answered = answeredNumbers(session, test);
  const number = session.currentQuestion;
  const unit = unitOf(units, number);
  const unitIndex = unit ? units.indexOf(unit) : -1;
  const previous = units[unitIndex - 1];
  const next = units[unitIndex + 1];
  const isFlagged = session.flagged.includes(number);
  const numbersOf = (passageNumber: number) =>
    units
      .filter((u) => u.passageNumber === passageNumber)
      .flatMap((u) => u.numbers);
  const choose = (target: number) => {
    if (target === number) document.getElementById("question-heading")?.focus();
    else goTo(target);
  };

  return (
    // One wrapping row of items, so the bar stays as low as the window allows.
    <section
      aria-label={t("navigator.open")}
      className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle px-gutter py-2"
    >
      {/* The passage on screen first, so its cells take the first row. */}
      {[
        ...test.passages.filter((p) => p.number === session.view.passage),
        ...test.passages.filter((p) => p.number !== session.view.passage),
      ].map((passage) => {
        const numbers = numbersOf(passage.number);
        if (passage.number !== session.view.passage) {
          return (
            <SecondaryButton
              key={passage.id}
              onClick={() => goTo(numbers[0] ?? 1)}
            >
              {t("navigator.passageProgress", {
                number: passage.number,
                answered: numbers.filter((n) => answered.has(n)).length,
                total: numbers.length,
              })}
            </SecondaryButton>
          );
        }
        return (
          <div key={passage.id} className="flex flex-wrap items-center gap-x-3">
            <span className="font-bold">
              {t("navigator.passage", { number: passage.number })}
            </span>
            <ul className="flex flex-wrap gap-1 pt-2">
              {numbers.map((n) => (
                <li key={n} className="pb-2">
                  <NavigatorCell
                    number={n}
                    isAnswered={answered.has(n)}
                    isFlagged={session.flagged.includes(n)}
                    isCurrent={n === number}
                    onChoose={choose}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {/* The current question's controls stay together at the bar's end. */}
      <div className="ms-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          aria-pressed={isFlagged}
          onClick={() => send({ type: "toggleFlag", number })}
          className="inline-flex min-h-12 items-center gap-2 font-medium underline"
        >
          <FlagIcon className="size-4" />
          {isFlagged ? t("flag.remove") : t("flag.add")}
        </button>
        {previous && (
          <SecondaryButton onClick={() => goTo(previous.numbers[0] ?? 1)}>
            {t("question.previous")}
          </SecondaryButton>
        )}
        {next && (
          <SecondaryButton onClick={() => goTo(next.numbers[0] ?? 1)}>
            {t("question.next")}
          </SecondaryButton>
        )}
        <PrimaryButton
          onClick={() => {
            dialogRef.current?.showModal();
            finishHeadingRef.current?.focus();
          }}
        >
          {t("finish.button")}
        </PrimaryButton>
      </div>
      <ConfirmDialog dialogRef={dialogRef} labelledBy={FINISH_TITLE_ID}>
        <FinishConfirmation
          headingRef={finishHeadingRef}
          onFinish={() => send({ type: "finish" })}
          onCancel={() => dialogRef.current?.close()}
        />
      </ConfirmDialog>
    </section>
  );
}
