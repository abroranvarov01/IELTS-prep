"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useReducer, useSyncExternalStore } from "react";
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

function ReadingView({ canSave }: { canSave: boolean }) {
  const t = useTranslations("reading");
  const { test, units, session, send } = useReading();
  const passage = test.passages[session.view.passage - 1] ?? test.passages[0];
  const savedScroll = passage ? (session.view.scroll[passage.id] ?? 0) : 0;

  // Show each passage where the user last left it (READING_EXPERIENCE.md).
  useEffect(() => {
    window.scrollTo(0, savedScroll);
  }, [passage?.id, savedScroll]);

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
        />
      </main>
      <QuestionSheet goTo={goTo} />
    </>
  );
}
