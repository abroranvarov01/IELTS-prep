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
import type { ReadingEvent } from "@/domain/reading/session";
import { questionUnits, unitOf } from "@/domain/reading/units";
import { PassageView } from "./PassageView";
import { QuestionSheet, SHEET_HEIGHT } from "./QuestionSheet";
import { ReadingContext, useReading } from "./reading-context";
import { SentenceActions } from "./SentenceActions";
import { screenReducer } from "./screen-state";
import { StartScreen } from "./StartScreen";
import { TestBar } from "./TestBar";

// Storage is read on the client only; the server renders the loading frame.
const noSubscription = () => () => {};

/** The Reading test screen: start, reading and answering (ADR-0006, ADR-0007). */
export function ReadingScreen({ test }: { test: ReadingTest }) {
  const stored = useSyncExternalStore(
    noSubscription,
    () => storageSnapshot(test),
    () => null,
  );
  const [state, dispatch] = useReducer(screenReducer, { now: 0 });
  const units = useMemo(() => questionUnits(test), [test]);

  // Keep every change on the device (ADR-0006).
  useEffect(() => {
    const changed = state.local?.current ?? state.local?.finished;
    if (changed) saveSession(deviceStorage(), changed);
  }, [state.local]);

  if (!stored) return <TestBar />;
  const current = (state.local ?? stored).current;
  if (!current) {
    return (
      <StartScreen
        test={test}
        onStart={(mode) =>
          dispatch({ type: "start", test, mode, now: Date.now(), stored })
        }
      />
    );
  }

  const send = (event: ReadingEvent) =>
    dispatch({ type: "event", test, event, now: Date.now(), stored });
  return (
    <ReadingContext.Provider value={{ test, units, session: current, send }}>
      <ReadingView canSave={stored.canSave} />
    </ReadingContext.Provider>
  );
}

function sentenceElement(id: string) {
  return document.querySelector<HTMLElement>(`main [data-sentence="${id}"]`);
}

function ReadingView({ canSave }: { canSave: boolean }) {
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
    sentenceElement(id)?.focus({ preventScroll: true });
  }

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
  const isHighlighted =
    selected !== null && session.highlights.includes(selected);
  return (
    <>
      <a
        href="#question-heading"
        className="sr-only focus:not-sr-only focus:block focus:px-gutter focus:py-3 focus:font-bold focus:underline"
      >
        {t("skipToQuestion")}
      </a>
      <TestBar>
        <span className="font-medium">
          {t("passageOf", {
            number: passage.number,
            total: test.passages.length,
          })}
        </span>
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
        />
      </main>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {selected && (
        <SentenceActions
          bottom={`calc(${SHEET_HEIGHT[session.view.sheet]} + 0.5rem)`}
          isHighlighted={isHighlighted}
          firstActionRef={firstActionRef}
          onToggleHighlight={() => {
            send({ type: "toggleHighlight", sentenceId: selected });
            setAnnouncement(isHighlighted ? "" : t("mark.highlighted"));
            closeActions(selected);
          }}
          onCancel={() => closeActions(selected)}
        />
      )}
      <QuestionSheet goTo={goTo} />
    </>
  );
}
