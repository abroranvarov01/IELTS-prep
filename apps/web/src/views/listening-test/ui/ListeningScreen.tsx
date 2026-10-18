"use client";

import { type ListeningTest, examClock } from "@/entities/listening";
import { FinishedPage } from "./FinishedPage";
import { Preparing } from "./Preparing";
import { StartScreen } from "./StartScreen";
import { TestBar } from "./TestBar";
import { useListeningSession } from "./use-listening-session";
import { Workspace } from "./Workspace";
import { useState } from "react";

/**
 * The Listening test screen (LISTENING_EXPERIENCE.md, USER_FLOWS.md,
 * Listening flows): start, an Exam's download and its one tap, listening
 * and answering, and the finished page.
 */
export function ListeningScreen({ test }: { test: ListeningTest }) {
  const screen = useListeningSession(test);
  // The tap that lets an Exam play, once per page (the browser needs it).
  const [tapped, setTapped] = useState(false);
  const { session } = screen;

  if (!screen.loaded) return <TestBar />;
  if (!session)
    return screen.finished ? (
      <FinishedPage
        test={test}
        session={screen.finished}
        onStartAgain={screen.startAgain}
      />
    ) : (
      <StartScreen test={test} onStart={screen.start} />
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
