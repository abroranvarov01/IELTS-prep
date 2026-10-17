import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type Mode,
  type ReadingEvent,
  type ReadingSession,
  type ReadingTest,
  type StorageSnapshot,
  deviceHistory,
  deviceStorage,
  loadSessions,
  newSessionId,
  saveSession,
  settleStoredSessions,
  storageSnapshot,
} from "@/entities/reading";
import { type Sessions, screenReducer } from "../model/screen-state";
import { useCommitFinished } from "./use-commit-finished";

/** What the test screen shows, from the first render to its results. */
export type ReadingScreenState =
  /** On the server and before the device is read. */
  | { status: "loading" }
  /** No session in progress. `hasResults`: a committed test attempt is known (ADR-0009 §9). */
  | { status: "start"; hasResults: boolean; start: (mode: Mode) => void }
  /** A session in progress. `canSave` is false when the device keeps nothing (ADR-0006 §2). */
  | {
      status: "active";
      session: ReadingSession;
      canSave: boolean;
      send: (event: ReadingEvent) => void;
    }
  /** Finished: being committed, then replaced by its results page. */
  | { status: "finishing" };

// Storage is read on the client only; the server renders the loading frame.
const noSubscription = () => () => {};

/**
 * The test screen's session, from the device to its results (ADR-0006,
 * ADR-0009). It owns every state of the session: the device's copy, read on
 * the client as the screen renders; the screen's own once the user acts; and
 * the history, read after mounting. Every change is kept on the device. A
 * finished session, whether it finished here or was found finished on load,
 * has one way out: committed once the device has settled, then replaced by
 * its results page.
 */
export function useReadingSession(test: ReadingTest): ReadingScreenState {
  const snapshot = useSyncExternalStore(
    noSubscription,
    () => storageSnapshot(test),
    () => null,
  );
  const stored = useMemo(
    () => snapshot && storedSessions(snapshot),
    [snapshot],
  );
  const [state, dispatch] = useReducer(screenReducer, {});
  const [hasResults, setHasResults] = useState(false);
  // Settling the device on load; finishing waits for it (see below).
  const settled = useRef<Promise<void>>(null);
  const sessions = stored && (state.local ?? stored);
  const current = sessions?.current;
  const finished = sessions?.finished;
  const isExamRunning = current?.mode === "exam";

  // Settle what this load finds on the device (ADR-0009 §4, §6): import M4's
  // finished session, commit a finished session left uncommitted, remove a
  // stale copy of a committed one. Then read the history for "See your last
  // results", unless the session found here is finished and on its way to
  // its results: nothing renders again before it leaves. A history that
  // cannot be read leaves the localStorage sources as they are, and the start
  // screen offers no results.
  useEffect(() => {
    let active = true;
    const foundFinished =
      loadSessions(deviceStorage(), test).current?.status === "finished";
    const settling = deviceHistory().then(async (history) => {
      await settleStoredSessions(deviceStorage(), history, test, Date.now());
      return history;
    });
    settled.current = settling.then(
      () => undefined,
      () => undefined,
    );
    if (!foundFinished)
      settling
        .then((history) => history.read(test))
        .then(
          ({ attempts }) => {
            if (active) setHasResults(attempts.some((a) => a.kind === "test"));
          },
          () => undefined,
        );
    return () => {
      active = false;
    };
  }, [test]);

  // Keep every change on the device as it happens, a finished session
  // included, so closing the tab loses nothing (ADR-0006 §2, ADR-0009 §4).
  useEffect(() => {
    const changed = state.local?.current ?? state.local?.finished;
    if (changed) saveSession(deviceStorage(), changed);
  }, [state.local]);

  useCommitFinished(test, finished, settled);

  // The Exam clock: a tick at once and every second lets the session finish
  // at 0:00, also when the time ran out while the user was away. A tick
  // before then returns the same state, so nothing below this screen renders
  // again; the timer in the test bar keeps its own time (ExamTimer).
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

  const start = useCallback(
    (mode: Mode) => {
      if (!stored) return;
      dispatch({
        type: "start",
        test,
        mode,
        now: Date.now(),
        sessionId: newSessionId(),
        stored,
      });
    },
    [test, stored],
  );
  const send = useCallback(
    (event: ReadingEvent) => {
      if (!stored) return;
      dispatch({ type: "event", test, event, now: Date.now(), stored });
    },
    [test, stored],
  );

  if (!snapshot || !sessions) return { status: "loading" };
  if (finished) return { status: "finishing" };
  if (!current) return { status: "start", hasResults, start };
  return {
    status: "active",
    session: current,
    canSave: snapshot.canSave,
    send,
  };
}

/**
 * The stored test session as the screen uses it: one in progress is the
 * current session; a finished one not yet committed is on its way to its
 * results.
 */
function storedSessions(snapshot: StorageSnapshot): Sessions {
  const session = snapshot.current;
  if (!session) return {};
  return session.status === "inProgress"
    ? { current: session }
    : { finished: session };
}
