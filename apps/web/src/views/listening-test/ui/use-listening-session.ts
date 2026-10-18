"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type DownloadProgress,
  type DownloadedAudio,
  type ListeningEvent,
  type ListeningSession,
  type ListeningTest,
  type Mode,
  apply,
  cleanUpAudioCache,
  commitFinishedSession,
  deviceHistory,
  downloadTestAudio,
  loadSessions,
  saveSession,
  settleStoredSessions,
  startSession,
} from "@/entities/listening";
import { deviceStorage, newSessionId } from "@/shared/lib/device-storage";

const TICK_MS = 250;
const HEARTBEAT_MS = 5000;

export type Download =
  | { status: "loading"; progress?: DownloadProgress }
  | { status: "failed" }
  | { status: "ready"; audio: DownloadedAudio };

type Local = { session?: ListeningSession; finished?: ListeningSession };

// The device is read on the client only; the server renders the loading frame.
const noSubscription = () => () => {};
const SEPARATOR = "\u0000";

function readDevice(test: ListeningTest): string {
  const storage = deviceStorage();
  try {
    return [
      storage ? "1" : "0",
      storage?.getItem(`listening:${test.id}`) ?? "",
      storage?.getItem(`listening:${test.id}:finished`) ?? "",
    ].join(SEPARATOR);
  } catch {
    return "0";
  }
}

/** The snapshot as a read-only store, so the sessions are parsed from it. */
function snapshotStore(snapshot: string, test: ListeningTest) {
  const [, current, finished] = snapshot.split(SEPARATOR);
  const entries: Record<string, string | undefined> = {
    [`listening:${test.id}`]: current || undefined,
    [`listening:${test.id}:finished`]: finished || undefined,
  };
  return {
    getItem: (key: string) => entries[key] ?? null,
    setItem: () => {},
    removeItem: () => {},
  };
}

/**
 * The Listening screen's orchestration (ADR-0013): the device's copy of the
 * sessions, read as the screen renders; the screen's own once the learner
 * acts, kept on the device after every change; the Exam clock ticking; an
 * Exam's audio downloaded before anything plays.
 */
export function useListeningSession(test: ListeningTest) {
  const snapshot = useSyncExternalStore(
    noSubscription,
    () => readDevice(test),
    () => null,
  );
  const stored = useMemo(
    () =>
      snapshot === null
        ? undefined
        : loadSessions(snapshotStore(snapshot, test), test),
    [snapshot, test],
  );
  const [local, setLocal] = useState<Local>();
  const [download, setDownload] = useState<Download>();
  const [now, setNow] = useState(() => Date.now());

  const sessions: Local | undefined =
    local ?? (stored && { session: stored.current, finished: stored.finished });
  const session = sessions?.session;

  // What the device holds is settled once per load: M8's finished session is
  // imported, a finished one committed (ADR-0014 §3, §5).
  const loaded = snapshot !== null;
  useEffect(() => {
    if (!loaded) return;
    void deviceHistory().then((history) =>
      settleStoredSessions(deviceStorage(), history, test, Date.now()),
    );
  }, [loaded, test]);

  // Nothing but an Exam in progress keeps audio in the cache (ADR-0013 §2).
  useEffect(() => {
    if (stored && stored.current?.mode !== "exam") void cleanUpAudioCache([]);
  }, [stored]);

  // The latest sessions, so a change is applied and kept at once: a save on
  // pagehide must reach the device before the page goes (ADR-0013 §3).
  const latest = useRef(sessions);
  useEffect(() => {
    latest.current = sessions;
  });

  const send = useCallback(
    (event: ListeningEvent | { type: "tick" }) => {
      const base = latest.current;
      if (!base?.session) return;
      const next = apply(base.session, test, event, Date.now());
      if (next === base.session) return;
      const updated =
        next.status === "finished"
          ? { session: next, finished: next }
          : { ...base, session: next };
      latest.current = updated;
      saveSession(deviceStorage(), test, next);
      if (next.status === "finished") {
        // The finished session becomes an attempt (ADR-0014 §3); its copy in
        // localStorage stays until the commit has completed.
        void deviceHistory().then((history) =>
          commitFinishedSession(
            deviceStorage(),
            history,
            test,
            next,
            Date.now(),
          ),
        );
        if (next.mode === "exam") void cleanUpAudioCache([]);
      }
      setLocal(updated);
    },
    [test],
  );

  // The Exam clock: re-render and apply the time-out; a heartbeat for resume.
  const examRunning =
    session?.status === "inProgress" && session.mode === "exam";
  useEffect(() => {
    if (!examRunning) return;
    const tick = window.setInterval(() => {
      setNow(Date.now());
      send({ type: "tick" });
    }, TICK_MS);
    const beat = window.setInterval(
      () => send({ type: "heartbeat" }),
      HEARTBEAT_MS,
    );
    return () => {
      window.clearInterval(tick);
      window.clearInterval(beat);
    };
  }, [examRunning, send]);

  const fetchAudio = useCallback(() => {
    void downloadTestAudio(test, (progress) =>
      setDownload({ status: "loading", progress }),
    ).then(
      (audio) => setDownload({ status: "ready", audio }),
      () => setDownload({ status: "failed" }),
    );
  }, [test]);

  // An Exam in progress needs its audio on the device before anything plays.
  const needsAudio = examRunning && download === undefined;
  useEffect(() => {
    if (needsAudio) fetchAudio();
  }, [needsAudio, fetchAudio]);

  const start = (mode: Mode) => {
    const session = startSession(test, mode, Date.now(), newSessionId());
    setDownload(undefined);
    latest.current = { session };
    saveSession(deviceStorage(), test, session);
    setLocal({ session });
  };

  return {
    loaded,
    session: session?.status === "inProgress" ? session : undefined,
    finished: session?.status === "inProgress" ? undefined : sessions?.finished,
    canSave: snapshot === null || !snapshot.startsWith("0"),
    now,
    download: download ?? ({ status: "loading" } as Download),
    retryDownload: () => {
      setDownload({ status: "loading" });
      fetchAudio();
    },
    send,
    start,
    startAgain: () => {
      latest.current = {};
      setLocal({});
    },
  };
}
