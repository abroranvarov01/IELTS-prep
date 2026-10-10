"use client";

import { useTranslations } from "next-intl";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { QUESTION_COUNT } from "@/domain/reading/content";
import { type SheetState, answeredNumbers } from "@/domain/reading/session";
import { type QuestionUnit, unitOf } from "@/domain/reading/units";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { MultiChoiceQuestion } from "./MultiChoiceQuestion";
import { OptionPicker } from "./OptionPicker";
import { FlagIcon, QuestionNavigator } from "./QuestionNavigator";
import { useReading } from "./reading-context";
import { SecondaryButton } from "./SecondaryButton";
import { TypedQuestion } from "./TypedQuestion";

/** Sheet heights per state (DESIGN_SYSTEM.md, M4: question sheet). */
export const SHEET_HEIGHT: Record<SheetState, string> = {
  collapsed: "6rem",
  partial: "max(45dvh, 15rem)",
  expanded: "calc(100dvh - 3rem)",
};

// A drag shorter than this is a tap on the handle.
const DRAG_THRESHOLD_PX = 8;

type Drag = {
  startY: number;
  startHeight: number;
  height: number;
  moved: boolean;
};

/** What the open sheet shows: the question, the navigator, or a question's option list. */
type Panel = "question" | "navigator" | "options";
type FocusTarget = "navigatorButton" | "answerButton";

/**
 * The persistent, non-modal question sheet (READING_EXPERIENCE.md, Mobile
 * reading screen; ADR-0007): three states, each reachable by the handle button
 * as well as by dragging, docked above the phone keyboard while typing. The
 * navigator and option lists open inside it, expanded.
 */
export function QuestionSheet({ goTo }: { goTo: (number: number) => void }) {
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
  const wasDragged = useRef(false);
  const isFirstQuestion = useRef(true);
  // Where focus goes when a panel closes, once that control is rendered again.
  const returnFocusTo = useRef<FocusTarget | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [keyboard, setKeyboard] = useState({ inset: 0, viewport: 0 });
  const [panel, setPanel] = useState<Panel>("question");

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
  const opener: FocusTarget =
    panel === "navigator" ? "navigatorButton" : "answerButton";

  // Escape closes a panel (a document listener: the sheet is not a control).
  useEffect(() => {
    if (panel === "question") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      returnFocusTo.current =
        panel === "navigator" ? "navigatorButton" : "answerButton";
      setPanel("question");
      send({ type: "setView", view: { sheet: "partial" } });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panel, send]);

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
        96,
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
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="question-body"
        onClick={onHandleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        className="flex h-12 w-full shrink-0 touch-none items-center justify-center"
      >
        <span
          aria-hidden="true"
          className="h-1 w-8 rounded-full bg-border-control"
        />
        <span className="sr-only">
          {isOpen ? t("sheet.hide") : t("sheet.show")}
        </span>
      </button>

      <div className="flex shrink-0 flex-wrap items-center gap-x-2 px-gutter">
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

      {isOpen && panel === "question" && (
        <div className="flex shrink-0 flex-wrap gap-x-4 px-gutter">
          <button
            type="button"
            aria-pressed={isFlagged}
            onClick={() => send({ type: "toggleFlag", number })}
            className="inline-flex min-h-12 items-center gap-2 font-medium underline"
          >
            <FlagIcon className="size-4" />
            {isFlagged ? t("flag.remove") : t("flag.add")}
          </button>
          <button
            ref={navigatorButtonRef}
            type="button"
            onClick={() => openPanel("navigator")}
            className="inline-flex min-h-12 items-center gap-2 font-medium underline"
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
                  className="inline-flex min-h-12 items-center font-medium underline"
                >
                  {t("sheet.back")}
                </button>
              </div>
              <div className="mt-4">
                <QuestionNavigator onChoose={chooseFromNavigator} />
              </div>
            </>
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
              <QuestionBody unit={unit} onChoose={() => openPanel("options")} />
            </div>
          </div>
          <div className="flex shrink-0 justify-between gap-4 border-t border-border-subtle px-gutter py-2">
            {previous ? (
              <SecondaryButton onClick={() => goTo(previous.numbers[0] ?? 1)}>
                {t("question.previous")}
              </SecondaryButton>
            ) : (
              <span />
            )}
            {next && (
              <SecondaryButton onClick={() => goTo(next.numbers[0] ?? 1)}>
                {t("question.next")}
              </SecondaryButton>
            )}
          </div>
        </>
      )}
    </section>
  );
}

/** The question's own interaction, by how it is answered (READING_EXPERIENCE.md, Question types). */
function QuestionBody({
  unit,
  onChoose,
}: {
  unit: QuestionUnit;
  onChoose: () => void;
}) {
  switch (unit.kind) {
    case "single":
      return <ChoiceQuestion unit={unit} />;
    case "multi":
      return <MultiChoiceQuestion unit={unit} />;
    case "select":
      return <MatchingQuestion unit={unit} onChoose={onChoose} />;
    case "text":
      return <TypedQuestion unit={unit} />;
  }
}

function nearestState(height: number): SheetState {
  const viewport = window.visualViewport?.height ?? window.innerHeight;
  const heights: [SheetState, number][] = [
    ["collapsed", 96],
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
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4"
      fill="currentColor"
    >
      <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />
    </svg>
  );
}
