"use client";

import { useTranslations } from "next-intl";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import {
  QUESTION_COUNT,
  type SheetState,
  answeredNumbers,
  unitOf,
  useReading,
} from "@/entities/reading";
import { AnswerControl, OptionPicker } from "@/features/answer-question";
import { EvidenceList } from "@/features/mark-passage";
import { ChevronIcon, LineIcon } from "@/shared/ui/icons";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { FinishConfirmation } from "./FinishConfirmation";
import { FlagIcon, QuestionNavigator } from "./QuestionNavigator";
import { SecondaryButton } from "./SecondaryButton";

/** Sheet heights per state (DESIGN_SYSTEM.md, M4: question sheet). */
export const SHEET_HEIGHT: Record<SheetState, string> = {
  collapsed: "5rem",
  partial: "max(45dvh, 15rem)",
  expanded: "calc(100dvh - 3rem)",
};

// A drag shorter than this is a tap on the handle.
const DRAG_THRESHOLD_PX = 8;
const COLLAPSED_PX = 80;

type Drag = {
  startY: number;
  startHeight: number;
  height: number;
  moved: boolean;
};

/** What the open sheet shows: the question, the navigator, a question's option list, or the finish confirmation. */
type Panel = "question" | "navigator" | "options" | "finish";
type FocusTarget = "navigatorButton" | "answerButton" | "finishButton";

/**
 * The persistent, non-modal question sheet (READING_EXPERIENCE.md, Mobile
 * reading screen; ADR-0007): three states, each reachable by the handle button
 * as well as by dragging, docked above the phone keyboard while typing. The
 * navigator, option lists and the finish confirmation open inside it,
 * expanded.
 */
export function QuestionSheet({
  goTo,
  showSentence,
}: {
  goTo: (number: number) => void;
  showSentence: (sentenceId: string) => void;
}) {
  const t = useTranslations("reading");
  const { test, units, session, send } = useReading();
  const state = session.view.sheet;
  const number = session.currentQuestion;
  const unit = unitOf(units, number);
  const unitIndex = unit ? units.indexOf(unit) : -1;
  const previous = units[unitIndex - 1];
  const next = units[unitIndex + 1];

  const sheetRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const navigatorButtonRef = useRef<HTMLButtonElement>(null);
  const answerAreaRef = useRef<HTMLDivElement>(null);
  const finishButtonRef = useRef<HTMLButtonElement>(null);
  const wasDragged = useRef(false);
  const isFirstQuestion = useRef(true);
  // Where focus goes when a panel closes, once that control is rendered again.
  const returnFocusTo = useRef<FocusTarget | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [keyboard, setKeyboard] = useState({ inset: 0, viewport: 0 });
  const [panel, setPanel] = useState<Panel>("question");
  // "Finish test" is in the footer and at the end of the navigator.
  const [finishFrom, setFinishFrom] = useState<FocusTarget>("finishButton");

  // Keep the sheet above the on-screen keyboard (VisualViewport, ADR-0007).
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () =>
      setKeyboard({
        inset: Math.max(
          0,
          window.innerHeight - viewport.height - viewport.offsetTop,
        ),
        viewport: viewport.height,
      });
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

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

  // When the sheet's height settles (a state change, or the keyboard taking
  // room), a control focused while it was moving may now be below the body's
  // visible part. Scroll only the body back to it; the passage never moves.
  const keepFocusInView = () => {
    const body = sheetRef.current?.querySelector("#question-body");
    const focused = document.activeElement;
    if (!body || !(focused instanceof HTMLElement) || !body.contains(focused))
      return;
    const room = body.getBoundingClientRect();
    const box = focused.getBoundingClientRect();
    if (box.bottom > room.bottom) body.scrollTop += box.bottom - room.bottom;
    else if (box.top < room.top) body.scrollTop -= room.top - box.top;
  };

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

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const height = sheetRef.current?.getBoundingClientRect().height ?? 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      startY: event.clientY,
      startHeight: height,
      height,
      moved: false,
    });
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const delta = drag.startY - event.clientY;
    setDrag({
      ...drag,
      height: Math.max(
        COLLAPSED_PX,
        Math.min(window.innerHeight - 48, drag.startHeight + delta),
      ),
      moved: drag.moved || Math.abs(delta) > DRAG_THRESHOLD_PX,
    });
  };
  const onPointerUp = () => {
    if (!drag) return;
    wasDragged.current = drag.moved;
    if (drag.moved) {
      const target = nearestState(drag.height);
      if (target === "collapsed") setPanel("question");
      setSheet(target);
    }
    setDrag(null);
  };
  const onHandleClick = () => {
    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }
    if (state !== "collapsed") setPanel("question");
    setSheet(state === "collapsed" ? "partial" : "collapsed");
  };

  const height = drag
    ? `${drag.height}px`
    : keyboard.inset > 0
      ? `min(${SHEET_HEIGHT[state]}, ${keyboard.viewport}px - 3rem)`
      : SHEET_HEIGHT[state];
  const label =
    unit && unit.numbers.length > 1
      ? t("question.range", {
          from: unit.numbers[0] ?? 0,
          to: unit.numbers.at(-1) ?? 0,
        })
      : t("question.of", { number, total: QUESTION_COUNT });
  const isAnswered = answeredNumbers(session, test).has(number);
  const isFlagged = session.flagged.includes(number);
  const isOpen = state !== "collapsed";

  return (
    <section
      ref={sheetRef}
      aria-label={t("sheet.label")}
      className={`fixed inset-x-[0] z-10 mx-auto flex max-w-measure flex-col rounded-t-xl bg-surface-base shadow-raised ${
        drag ? "" : "transition-[height] duration-(--duration-base)"
      }`}
      style={{ height, bottom: keyboard.inset }}
      onTransitionEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.propertyName === "height"
        )
          keepFocusInView();
      }}
    >
      {/* The handle (READING_EXPERIENCE.md) spans the bar and the question's
          title, so the grab area is large without a row of its own. */}
      <div className="relative shrink-0 px-gutter pt-2 pb-1">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="question-body"
          onClick={onHandleClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => setDrag(null)}
          className="absolute inset-[0] w-full touch-none rounded-t-xl"
        >
          <span className="sr-only">
            {isOpen ? t("sheet.hide") : t("sheet.show")}
          </span>
        </button>
        <span
          aria-hidden="true"
          className="mx-auto block h-1 w-8 rounded-full bg-border-control"
        />
        <div className="pointer-events-none relative mt-3 flex flex-wrap items-baseline gap-x-2">
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
          {!isOpen && isFlagged && (
            <span className="text-meta text-text-secondary">
              · <FlagIcon className="inline size-3" /> {t("navigator.flagged")}
            </span>
          )}
        </div>
      </div>

      {isOpen && panel === "question" && (
        // One row: a long label wraps inside its own button.
        <div className="flex shrink-0 px-gutter">
          <button
            type="button"
            aria-pressed={isFlagged}
            onClick={() => send({ type: "toggleFlag", number })}
            className={`${QUIET_BUTTON} group -ms-3`}
          >
            <FlagIcon className="size-4 group-aria-pressed:fill-current" />
            {isFlagged ? t("flag.remove") : t("flag.add")}
          </button>
          <button
            ref={navigatorButtonRef}
            type="button"
            onClick={() => openPanel("navigator")}
            className={QUIET_BUTTON}
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
                  {t("finish.button")}
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
            {session.mode === "practice" && (
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
                {t("finish.button")}
              </PrimaryButton>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function nearestState(height: number): SheetState {
  const viewport = window.visualViewport?.height ?? window.innerHeight;
  const heights: [SheetState, number][] = [
    ["collapsed", COLLAPSED_PX],
    ["partial", Math.max(viewport * 0.45, 240)],
    ["expanded", viewport - 48],
  ];
  return heights.reduce((best, candidate) =>
    Math.abs(candidate[1] - height) < Math.abs(best[1] - height)
      ? candidate
      : best,
  )[0];
}

function GridIcon() {
  return (
    <LineIcon className="size-4">
      <rect x="2.25" y="2.25" width="4.5" height="4.5" rx="1" />
      <rect x="9.25" y="2.25" width="4.5" height="4.5" rx="1" />
      <rect x="2.25" y="9.25" width="4.5" height="4.5" rx="1" />
      <rect x="9.25" y="9.25" width="4.5" height="4.5" rx="1" />
    </LineIcon>
  );
}
