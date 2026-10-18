"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  type SheetState,
  answeredNumbers,
  positionCount,
  unitOf,
  useReading,
} from "@/entities/reading";
import { AnswerControl, OptionPicker } from "@/features/answer-question";
import { EvidenceList } from "@/features/mark-passage";
import { ChevronIcon, GridIcon } from "@/shared/ui/icons";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { SecondaryButton } from "@/shared/ui/SecondaryButton";
import { BottomSheet } from "@/widgets/reading-layout";
import { FinishConfirmation } from "./FinishConfirmation";
import { FlagIcon, QuestionNavigator } from "./QuestionNavigator";
import { RetryProgress } from "./RetryProgress";

/** What the open sheet shows: the question, the navigator, a question's option list, or the finish confirmation. */
type Panel = "question" | "navigator" | "options" | "finish";
type FocusTarget = "navigatorButton" | "answerButton" | "finishButton";

/**
 * The question sheet (READING_EXPERIENCE.md, Mobile reading screen): the
 * current question in the bottom sheet. The navigator, option lists and the
 * finish confirmation open inside it, expanded.
 */
export function QuestionSheet({
  goTo,
  showSentence,
}: {
  goTo: (number: number) => void;
  showSentence: (sentenceId: string) => void;
}) {
  const t = useTranslations("reading");
  const tCheck = useTranslations("levelCheck");
  const { test, units, session, send, variant } = useReading();
  const isCheck = variant === "check";
  const finishLabel = isCheck ? tCheck("finish.button") : t("finish.button");
  const state = session.view.sheet;
  const number = session.currentQuestion;
  const unit = unitOf(units, number);
  const unitIndex = unit ? units.indexOf(unit) : -1;
  const previous = units[unitIndex - 1];
  const next = units[unitIndex + 1];

  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const navigatorButtonRef = useRef<HTMLButtonElement>(null);
  const answerAreaRef = useRef<HTMLDivElement>(null);
  const finishButtonRef = useRef<HTMLButtonElement>(null);
  const isFirstQuestion = useRef(true);
  // Where focus goes when a panel closes, once that control is rendered again.
  const returnFocusTo = useRef<FocusTarget | null>(null);
  const [panel, setPanel] = useState<Panel>("question");
  // "Finish test" is in the footer and at the end of the navigator.
  const [finishFrom, setFinishFrom] = useState<FocusTarget>("finishButton");

  // Announce a new question by moving focus to its heading (not on first load).
  useEffect(() => {
    if (isFirstQuestion.current) {
      isFirstQuestion.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [number]);

  // Opening a panel focuses its heading; closing one returns focus to the
  // control that opened it.
  useEffect(() => {
    if (panel !== "question") {
      panelHeadingRef.current?.focus();
      return;
    }
    if (returnFocusTo.current === "navigatorButton")
      navigatorButtonRef.current?.focus();
    if (returnFocusTo.current === "answerButton")
      answerAreaRef.current?.querySelector("button")?.focus();
    if (returnFocusTo.current === "finishButton")
      finishButtonRef.current?.focus();
    returnFocusTo.current = null;
  }, [panel]);

  const setSheet = (sheet: SheetState) =>
    send({ type: "setView", view: { sheet } });
  const openPanel = (opened: Exclude<Panel, "question">) => {
    setPanel(opened);
    setSheet("expanded");
  };
  const closePanel = (focus: FocusTarget | null) => {
    returnFocusTo.current = focus;
    setPanel("question");
    setSheet("partial");
  };
  const openFinish = (from: FocusTarget) => {
    setFinishFrom(from);
    openPanel("finish");
  };
  const opener: FocusTarget =
    panel === "navigator"
      ? "navigatorButton"
      : panel === "finish"
        ? finishFrom
        : "answerButton";

  // Escape closes a panel (a document listener: the sheet is not a control).
  useEffect(() => {
    if (panel === "question") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      returnFocusTo.current = opener;
      setPanel("question");
      send({ type: "setView", view: { sheet: "partial" } });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panel, opener, send]);

  const chooseFromNavigator = (target: number) => {
    closePanel(null);
    if (target === number) headingRef.current?.focus();
    else goTo(target);
  };

  // Collapsing the sheet closes an open panel.
  const changeSheet = (sheet: SheetState) => {
    if (sheet === "collapsed") setPanel("question");
    setSheet(sheet);
  };

  const label =
    unit && unit.numbers.length > 1
      ? t("question.range", {
          from: unit.numbers[0] ?? 0,
          to: unit.numbers.at(-1) ?? 0,
        })
      : t("question.of", { number, total: positionCount(test) });
  const isAnswered = answeredNumbers(session, test).has(number);
  const isFlagged = session.flagged.includes(number);
  const isOpen = state !== "collapsed";

  return (
    <BottomSheet
      label={t("sheet.label")}
      state={state}
      onStateChange={changeSheet}
      bodyId="question-body"
      header={
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h2
            id="question-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-heading-3 font-bold focus:outline-none"
          >
            {label}
          </h2>
          {isAnswered && (
            <span className="text-meta text-text-secondary">
              · {t("navigator.answered")}
            </span>
          )}
          {!isOpen && isFlagged && !isCheck && (
            <span className="text-meta text-text-secondary">
              · <FlagIcon className="inline size-3" /> {t("navigator.flagged")}
            </span>
          )}
          {session.retry && (
            <div className="basis-full">
              <RetryProgress />
            </div>
          )}
        </div>
      }
    >
      {isOpen && panel === "question" && (
        // One row: a long label wraps inside its own button.
        <div className="flex shrink-0 px-gutter">
          {!isCheck && (
            <button
              type="button"
              aria-pressed={isFlagged}
              onClick={() => send({ type: "toggleFlag", number })}
              className={`${QUIET_BUTTON} group -ms-3`}
            >
              <FlagIcon className="size-4 group-aria-pressed:fill-current" />
              {isFlagged ? t("flag.remove") : t("flag.add")}
            </button>
          )}
          <button
            ref={navigatorButtonRef}
            type="button"
            onClick={() => openPanel("navigator")}
            className={`${QUIET_BUTTON}${isCheck ? " -ms-3" : ""}`}
          >
            <GridIcon />
            {t("navigator.open")}
          </button>
        </div>
      )}

      {isOpen && panel !== "question" && unit && (
        <div
          id="question-body"
          className="min-h-0 flex-1 overflow-y-auto px-gutter pt-2 pb-4"
        >
          {panel === "navigator" ? (
            <>
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
                  onClick={() => closePanel(opener)}
                  className={`${QUIET_BUTTON} -me-3`}
                >
                  <ChevronIcon direction="left" />
                  {t("sheet.back")}
                </button>
              </div>
              <div className="mt-4">
                <QuestionNavigator onChoose={chooseFromNavigator} />
              </div>
              <div className="mt-6">
                <PrimaryButton onClick={() => openFinish("navigatorButton")}>
                  {finishLabel}
                </PrimaryButton>
              </div>
            </>
          ) : panel === "finish" ? (
            <FinishConfirmation
              headingRef={panelHeadingRef}
              onFinish={() => send({ type: "finish" })}
              onCancel={() => closePanel(opener)}
            />
          ) : (
            <OptionPicker
              unit={unit}
              headingRef={panelHeadingRef}
              onBack={() => closePanel(opener)}
              onChosen={() => closePanel("answerButton")}
            />
          )}
        </div>
      )}

      {isOpen && panel === "question" && unit && (
        <>
          {/* A new element per question, so each one starts at its top. */}
          <div
            key={unit.key}
            id="question-body"
            className="min-h-0 flex-1 overflow-y-auto px-gutter pt-2 pb-4"
          >
            <p lang="en" className="text-text-secondary">
              {unit.group.instruction}
            </p>
            <div ref={answerAreaRef} className="mt-4">
              <AnswerControl
                unit={unit}
                onChoose={() => openPanel("options")}
              />
            </div>
            {session.mode === "practice" && !isCheck && (
              <EvidenceList
                number={unit.numbers[0] ?? number}
                onShow={showSentence}
              />
            )}
          </div>
          <div className="flex shrink-0 flex-wrap justify-between gap-x-4 gap-y-2 border-t border-border-subtle px-gutter py-2">
            {previous ? (
              <SecondaryButton onClick={() => goTo(previous.numbers[0] ?? 1)}>
                <ChevronIcon direction="left" />
                {t("question.previous")}
              </SecondaryButton>
            ) : (
              <span />
            )}
            {next ? (
              <SecondaryButton onClick={() => goTo(next.numbers[0] ?? 1)}>
                {t("question.next")}
                <ChevronIcon direction="right" />
              </SecondaryButton>
            ) : (
              <PrimaryButton
                ref={finishButtonRef}
                onClick={() => openFinish("finishButton")}
              >
                {finishLabel}
              </PrimaryButton>
            )}
          </div>
        </>
      )}
    </BottomSheet>
  );
}
