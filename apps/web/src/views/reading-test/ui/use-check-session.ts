import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useSyncExternalStore,
} from "react";
import {
  type FinishedSection,
  deviceLevelCheckHistory,
  setLevelCheckSectionState,
} from "@/entities/level-check";
import {
  type ReadingEvent,
  type ReadingSession,
  type ReadingTest,
  deviceStorage,
  newSessionId,
  removeSession,
  saveSession,
  storageSnapshot,
} from "@/entities/reading";
import { useRouter } from "@/shared/i18n/navigation";
import { screenReducer } from "../model/screen-state";

/** What a level-check section shows, from the first render to its result. */
export type CheckScreenState =
  /** On the server and before the device is read. */
  | { status: "loading" }
  /** Nothing in progress: the intro is the way in. */
  | { status: "none" }
  | {
      status: "active";
      session: ReadingSession;
      canSave: boolean;
      send: (event: ReadingEvent) => void;
    }
  /** Finished: being committed to the level-check history, then the result. */
  | { status: "finishing" };

const noSubscription = () => () => {};

/**
 * A level-check section's session (ADR-0011 §2, §3): a Reading session in
 * the form's localStorage entry, started by the intro, kept on the device at
 * every change, and committed once to the level-check history when it
 * finishes, never to the Reading attempt history. The result page replaces
 * the screen; Home learns "done" through the state cookie. Every visit from
 * the intro carries a token (`visit`): the screen is kept alive between
 * visits, with its effects run again when it is shown, so a state of an
 * earlier visit is ignored (never saved) and the device is read again. With
 * `start`, and nothing stored, the section starts
 * a session itself: the device may keep nothing (storage blocked), so the
 * intro's session never arrives; it then lives in this screen's state for
 * the tab.
 */
export function useCheckSession(
  form: ReadingTest,
  visit: string,
  start: boolean,
): CheckScreenState {
  const snapshot = useSyncExternalStore(
    noSubscription,
    () => storageSnapshot(form),
    () => null,
  );
  const stored = useMemo(() => {
    const session = snapshot?.current;
    if (!snapshot) return undefined;
    if (!session) return {};
    return session.status === "inProgress"
      ? { current: session }
      : { finished: session };
  }, [snapshot]);
  const [state, dispatch] = useReducer(screenReducer, {});
  const router = useRouter();
  const local = state.visit === visit ? state.local : undefined;
  const sessions = stored && (local ?? stored);
  const current = sessions?.current;
  const finished = sessions?.finished;

  useEffect(() => {
    const changed = local?.current ?? local?.finished;
    if (changed) saveSession(deviceStorage(), changed);
  }, [local]);

  useEffect(() => {
    if (!start || !stored || stored.current || stored.finished) return;
    dispatch({
      type: "start",
      visit,
      test: form,
      mode: "practice",
      now: Date.now(),
      sessionId: newSessionId(),
      stored,
    });
  }, [start, stored, form, visit]);

  // The one way out of a finished section: its localStorage copy is written
  // first and removed only after a durable commit; a commit that fails leaves
  // it there, and the result page says the result is not saved.
  useEffect(() => {
    if (!finished || finished.finishedAt === undefined) return;
    let active = true;
    const section: FinishedSection = {
      id: finished.sessionId,
      skill: "reading",
      formId: form.id,
      formVersion: form.version,
      startedAt: finished.startedAt,
      finishedAt: finished.finishedAt,
      answers: finished.answers,
    };
    saveSession(deviceStorage(), finished);
    deviceLevelCheckHistory()
      .then(async (history) => {
        const committed = await history.commit(section, Date.now());
        if (committed && history.persistent)
          removeSession(deviceStorage(), finished);
      })
      .catch(() => undefined)
      .then(() => setLevelCheckSectionState("reading", "done"))
      .catch(() => undefined)
      .finally(() => {
        if (active)
          router.replace(
            `/level-check/result?attempt=${encodeURIComponent(finished.sessionId)}`,
          );
      });
    return () => {
      active = false;
    };
  }, [finished, form, router]);

  const send = useCallback(
    (event: ReadingEvent) => {
      if (!stored) return;
      dispatch({
        type: "event",
        visit,
        test: form,
        event,
        now: Date.now(),
        stored,
      });
    },
    [form, stored, visit],
  );

  if (!snapshot || !sessions) return { status: "loading" };
  if (finished) return { status: "finishing" };
  if (!current) return { status: start ? "loading" : "none" };
  return {
    status: "active",
    session: current,
    canSave: snapshot.canSave,
    send,
  };
}
