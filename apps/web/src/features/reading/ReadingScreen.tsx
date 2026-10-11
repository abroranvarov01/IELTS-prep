"use client";

import { useTranslations } from "next-intl";
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  deviceStorage,
  saveSession,
  storageSnapshot,
} from "@/data/reading-session-storage";
import type { ReadingTest } from "@/domain/reading/content";
import {
  MAX_PINS,
  type ReadingEvent,
  remainingMs,
} from "@/domain/reading/session";
import { questionUnits, unitOf } from "@/domain/reading/units";
import { ExamTimer } from "./ExamTimer";
import { FinishedScreen } from "./FinishedScreen";
import { PassageView } from "./PassageView";
import { QuestionSheet, SHEET_HEIGHT } from "./QuestionSheet";
import { ReadingContext, useReading } from "./reading-context";
import { SentenceActions } from "./SentenceActions";
import { screenReducer } from "./screen-state";
import { StartScreen } from "./StartScreen";
import { TestBar } from "./TestBar";

// Storage is read on the client only; the server renders the loading frame.
const noSubscription = () => () => {};

/** The Reading test screen: start, reading and answering, finished (ADR-0006, ADR-0007). */
export function ReadingScreen({ test }: { test: ReadingTest }) {
  const stored = useSyncExternalStore(
    noSubscription,
    () => storageSnapshot(test),
    () => null,
  );
  const [state, dispatch] = useReducer(screenReducer, { now: 0 });
  // "Start again" shows the start screen until a new session starts.
  const [restarting, setRestarting] = useState(false);
  const units = useMemo(() => questionUnits(test), [test]);
  const sessions = stored && (state.local ?? stored);
  const isExamRunning = sessions?.current?.mode === "exam";

  // Keep every change on the device (ADR-0006).
  useEffect(() => {
    const changed = state.local?.current ?? state.local?.finished;
    if (changed) saveSession(deviceStorage(), changed);
  }, [state.local]);

  // The Exam clock: a tick at once and every second moves the timer and
  // finishes the test at 0:00, also when it ran out while the user was away.
  useEffect(() => {
    if (!isExamRunning || !stored) return;
    const tick = () =>
      dispatch({
        type: "event",
        test,
        event: { type: "tick" },
        now: Date.now(),
        stored,
      });
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isExamRunning, test, stored]);

  if (!stored || !sessions) return <TestBar />;
  const { current, finished } = sessions;
  if (!current) {
    if (finished && !restarting) {
      return (
        <FinishedScreen
          test={test}
          session={finished}
          onStartAgain={() => setRestarting(true)}
        />
      );
    }
    return (
      <StartScreen
        test={test}
        onStart={(mode) => {
          setRestarting(false);
          dispatch({ type: "start", test, mode, now: Date.now(), stored });
        }}
      />
    );
  }

  const send = (event: ReadingEvent) =>
    dispatch({ type: "event", test, event, now: Date.now(), stored });
  return (
    <ReadingContext.Provider value={{ test, units, session: current, send }}>
      <ReadingView canSave={stored.canSave} now={state.now} />
    </ReadingContext.Provider>
  );
}

function sentenceElement(id: string) {
  return document.querySelector<HTMLElement>(`main [data-sentence="${id}"]`);
}

function ReadingView({ canSave, now }: { canSave: boolean; now: number }) {
  const t = useTranslations("reading");
  const { test, units, session, send } = useReading();
  const passage = test.passages[session.view.passage - 1] ?? test.passages[0];
  const savedScroll = passage ? (session.view.scroll[passage.id] ?? 0) : 0;
  const sentenceIds = useMemo(
    () =>
      passage?.paragraphs.flatMap((p) => p.sentences.map((s) => s.id)) ?? [],
    [passage],
  );

  // The selected sentence (its action bar is open) and the sentence that holds
  // the passage's one Tab stop. Both belong to the passage on screen.
  const [selection, setSelection] = useState<string | null>(null);
  const [lastFocused, setLastFocused] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // The sentence whose pin was refused at the limit, to say why.
  const [limitFor, setLimitFor] = useState<string | null>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const selected =
    selection && sentenceIds.includes(selection) ? selection : null;
  const focusable =
    lastFocused && sentenceIds.includes(lastFocused)
      ? lastFocused
      : (sentenceIds[0] ?? "");

  // Show each passage where the user last left it (READING_EXPERIENCE.md).
  useEffect(() => {
    window.scrollTo(0, savedScroll);
  }, [passage?.id, savedScroll]);

  // Taps and keys reach the sentences through delegated listeners (ADR-0007),
  // so the sentences themselves stay plain text.
  useEffect(() => {
    const sentenceOf = (target: EventTarget | null) =>
      (target instanceof Element ? target : null)?.closest<HTMLElement>(
        "main [data-sentence]",
      );
    const onClick = (event: MouseEvent) => {
      const sentence = sentenceOf(event.target);
      // A long press that selected text natively (to copy) is left alone.
      if (!sentence || !window.getSelection()?.isCollapsed) return;
      const id = sentence.dataset.sentence ?? null;
      setSelection((current) => (current === id ? null : id));
      setLastFocused(id);
      setAnnouncement("");
      setLimitFor(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const sentence = sentenceOf(document.activeElement);
      if (!sentence) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const all = [
          ...document.querySelectorAll<HTMLElement>("main [data-sentence]"),
        ];
        const next =
          all[all.indexOf(sentence) + (event.key === "ArrowDown" ? 1 : -1)];
        if (!next) return;
        setLastFocused(next.dataset.sentence ?? null);
        next.focus();
      } else if (event.key === "Enter") {
        event.preventDefault();
        setSelection(sentence.dataset.sentence ?? null);
        setAnnouncement("");
        setLimitFor(null);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Opening the action bar moves focus into it; Escape, or scrolling the
  // sentence out of view, closes it.
  useEffect(() => {
    const sentence = selected && sentenceElement(selected);
    if (!sentence) return;
    firstActionRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeActions(selected);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) closeActions(selected);
    });
    document.addEventListener("keydown", onKeyDown);
    observer.observe(sentence);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      observer.disconnect();
    };
  }, [selected]);

  // Focus goes back to the sentence without moving the passage.
  function closeActions(id: string) {
    setSelection(null);
    setLimitFor(null);
    sentenceElement(id)?.focus({ preventScroll: true });
  }

  // "Show in passage": the passage moves to the sentence and selects it.
  const showSentence = (id: string) => {
    if (session.view.sheet === "expanded")
      send({ type: "setView", view: { sheet: "partial" } });
    sentenceElement(id)?.scrollIntoView({ block: "start" });
    if (selected === id) firstActionRef.current?.focus();
    setSelection(id);
    setLastFocused(id);
    setAnnouncement("");
    setLimitFor(null);
  };

  // Changing question never scrolls the passage; changing passage keeps the
  // old one's position for later.
  const goTo = (number: number) => {
    const target = unitOf(units, number);
    if (passage && target && target.passageNumber !== passage.number) {
      send({
        type: "setView",
        view: {
          scroll: { ...session.view.scroll, [passage.id]: window.scrollY },
        },
      });
    }
    send({ type: "goTo", number });
  };

  if (!passage) return null;
  // The Exam clock is known from its first tick (ReadingScreen).
  const remaining = now === 0 ? undefined : remainingMs(session, test, now);
  const isHighlighted =
    selected !== null && session.highlights.includes(selected);
  // Pin Evidence (Practice only) goes to the current question; a "choose
  // several" item keeps its pins under its first number.
  const pinNumber =
    session.mode === "practice"
      ? unitOf(units, session.currentQuestion)?.numbers[0]
      : undefined;
  const pinned = pinNumber === undefined ? [] : (session.pins[pinNumber] ?? []);
  const togglePin = (number: number, id: string) => {
    if (pinned.includes(id)) {
      send({ type: "unpin", number, sentenceId: id });
      setAnnouncement("");
    } else if (pinned.length >= MAX_PINS) {
      setLimitFor(id);
      setAnnouncement(t("evidence.limit", { max: MAX_PINS }));
      return;
    } else {
      send({ type: "pin", number, sentenceId: id });
      setAnnouncement(t("mark.pinned", { number }));
    }
    closeActions(id);
  };
  return (
    <>
      <a
        href="#question-heading"
        className="sr-only focus:not-sr-only focus:block focus:px-gutter focus:py-3 focus:font-bold focus:underline"
      >
        {t("skipToQuestion")}
      </a>
      <TestBar confirmExit={session.mode === "exam"}>
        <span className="font-medium">
          {t("passageOf", {
            number: passage.number,
            total: test.passages.length,
          })}
        </span>
        {remaining !== undefined && <ExamTimer remaining={remaining} />}
      </TestBar>
      <main id="main" className="px-gutter">
        {!canSave && (
          <p role="status" className="mx-auto max-w-measure pt-4 font-medium">
            {t("storage.unavailable")}
          </p>
        )}
        <PassageView
          passage={passage}
          bottomSpace={`calc(${SHEET_HEIGHT[session.view.sheet]} + 1rem)`}
          highlights={new Set(session.highlights)}
          selected={selected}
          focusable={focusable}
          pins={
            pinNumber === undefined
              ? null
              : { number: pinNumber, sentenceIds: new Set(pinned) }
          }
        />
      </main>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {selected && (
        <SentenceActions
          bottom={`calc(${SHEET_HEIGHT[session.view.sheet]} + 0.5rem)`}
          isHighlighted={isHighlighted}
          pin={
            pinNumber === undefined
              ? undefined
              : {
                  number: pinNumber,
                  isPinned: pinned.includes(selected),
                  onToggle: () => togglePin(pinNumber, selected),
                }
          }
          message={
            limitFor === selected
              ? t("evidence.limit", { max: MAX_PINS })
              : undefined
          }
          firstActionRef={firstActionRef}
          onToggleHighlight={() => {
            send({ type: "toggleHighlight", sentenceId: selected });
            setAnnouncement(isHighlighted ? "" : t("mark.highlighted"));
            closeActions(selected);
          }}
          onCancel={() => closeActions(selected)}
        />
      )}
      <QuestionSheet goTo={goTo} showSentence={showSentence} />
    </>
  );
}
