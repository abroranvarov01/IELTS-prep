"use client";

import { type ListeningTest, examClock } from "@/entities/listening";
import { Preparing } from "./Preparing";
import { StartScreen } from "./StartScreen";
import { TestBar } from "./TestBar";
import { useCommitFinished } from "./use-commit-finished";
import { useListeningSession } from "./use-listening-session";
import { Workspace } from "./Workspace";
import { useState } from "react";

/**
 * The Listening test screen (LISTENING_EXPERIENCE.md, USER_FLOWS.md,
 * Listening flows): start, an Exam's download and its one tap, listening
 * and answering. A finished test is replaced by its results page.
 */
export function ListeningScreen({ test }: { test: ListeningTest }) {
  const screen = useListeningSession(test);
  // The tap that lets an Exam play, once per page (the browser needs it).
  const [tapped, setTapped] = useState(false);
  const { session } = screen;
  useCommitFinished(test, screen.finished, screen.settled);

  // While a finished test goes to its results page, only the test bar shows.
  if (!screen.loaded || screen.finished) return <TestBar />;
  if (!session)
    return (
      <StartScreen
        test={test}
        onStart={screen.start}
        lastResultsHref={
          screen.hasResults ? `/listening/${test.id}/results` : undefined
        }
      />
    );

  if (session.mode === "exam") {
    const clock = examClock(session, test, screen.now);
    const audioReady = screen.download.status === "ready";
    if (!audioReady || !tapped)
      return (
        <Preparing
          download={screen.download}
          clock={clock}
          onRetry={screen.retryDownload}
          onGo={() => {
            setTapped(true);
            if (clock.phase === "notStarted")
              screen.send({ type: "startRecording" });
          }}
        />
      );
  }

  return (
    <Workspace
      test={test}
      session={session}
      send={screen.send}
      now={screen.now}
      audio={
        screen.download.status === "ready" ? screen.download.audio : undefined
      }
      canSave={screen.canSave}
    />
  );
}
