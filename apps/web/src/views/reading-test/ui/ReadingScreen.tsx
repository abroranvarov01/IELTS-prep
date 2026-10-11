"use client";

import { useMemo } from "react";
import {
  ReadingContext,
  type ReadingTest,
  questionUnits,
} from "@/entities/reading";
import { StartScreen } from "./StartScreen";
import { TestBar } from "./TestBar";
import { TestWorkspace } from "./TestWorkspace";
import { useReadingSession } from "./use-reading-session";

/**
 * The Reading test screen: start, then reading and answering (ADR-0006,
 * ADR-0007). A finished session is committed to the attempt history and the
 * screen replaces itself with its results (READING_EXPERIENCE.md, M5).
 */
export function ReadingScreen({ test }: { test: ReadingTest }) {
  const screen = useReadingSession(test);
  const units = useMemo(() => questionUnits(test), [test]);

  switch (screen.status) {
    // Before the device is read, and while a finished session is on its way
    // to its results page, only the test bar shows.
    case "loading":
    case "finishing":
      return <TestBar />;
    case "start":
      return (
        <StartScreen
          test={test}
          lastResultsHref={
            screen.hasResults ? `/reading/${test.id}/results` : undefined
          }
          onStart={screen.start}
        />
      );
    case "active":
      return (
        <ReadingContext.Provider
          value={{ test, units, session: screen.session, send: screen.send }}
        >
          <TestWorkspace canSave={screen.canSave} />
        </ReadingContext.Provider>
      );
  }
}
