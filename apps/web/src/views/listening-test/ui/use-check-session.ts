"use client";

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
  type ListeningEvent,
  type ListeningSession,
  type ListeningTest,
  apply,
  loadSessions,
  removeSession,
  saveSession,
  startCheckSession,
} from "@/entities/listening";
import { useRouter } from "@/shared/i18n/navigation";
import { deviceStorage, newSessionId } from "@/shared/lib/device-storage";

/** What the level check's Listening section shows, from the first render to its result. */
export type CheckScreenState =
  /** On the server and before the device is read. */
  | { status: "loading" }
  /** Nothing in progress: the intro is the way in. */
  | { status: "none" }
  | {
      status: "active";
      session: ListeningSession;
      canSave: boolean;
      send: (event: ListeningEvent) => void;
    }
  /** Finished: being committed to the level-check history, then the result. */
  | { status: "finishing" };

const noSubscription = () => () => {};
const SEPARATOR = "\u0000";
const entryOf = (form: ListeningTest) => `listening:${form.id}`;

/** The device's entry for the form, as a string snapshot ("0" when storage is blocked). */
function readDevice(form: ListeningTest): string {
  const storage = deviceStorage();
  try {
    return storage
      ? ["1", storage.getItem(entryOf(form)) ?? ""].join(SEPARATOR)
      : "0";
  } catch {
    return "0";
  }
}

type Local = { visit: string; session: ListeningSession };
type Action =
  | { type: "set"; visit: string; session: ListeningSession }
  | {
      type: "event";
      visit: string;
      base: ListeningSession;
      form: ListeningTest;
      event: ListeningEvent;
      now: number;
    };

function reducer(state: Local | undefined, action: Action): Local | undefined {
  if (action.type === "set")
    return { visit: action.visit, session: action.session };
  // Events apply to this visit's session, or to the device's at the start.
  const base = state?.visit === action.visit ? state.session : action.base;
  const next = apply(base, action.form, action.event, action.now);
  return next === base && state?.visit === action.visit
    ? state
    : { visit: action.visit, session: next };
}

/**
 * The level check's Listening section (ADR-0014 §7, as Reading's section of
 * ADR-0011 §2, §3): a Listening session with the check's counts in the
 * form's localStorage entry, started by the intro, kept on the device at
 * every change, and committed once to the level-check history when it
 * finishes, never to the Listening attempt history. Every visit from the
 * intro carries a token (`visit`), so a state of an earlier visit is
 * ignored and the device is read again. With `start` and nothing stored
 * (storage blocked), the section starts a session itself, for this tab.
 */
export function useListeningCheckSession(
  form: ListeningTest,
  visit: string,
  start: boolean,
): CheckScreenState {
  const snapshot = useSyncExternalStore(
    noSubscription,
    () => readDevice(form),
    () => null,
  );
  const stored = useMemo(() => {
    if (snapshot === null) return undefined;
    const [, raw = ""] = snapshot.split(SEPARATOR);
    const { current, finished } = loadSessions(
      {
        getItem: (key) => (key === entryOf(form) && raw ? raw : null),
        setItem: () => {},
        removeItem: () => {},
      },
      form,
    );
    // Only a check session belongs to this page.
    return {
      current: current?.check ? current : undefined,
      finished: finished?.check ? finished : undefined,
    };
  }, [snapshot, form]);
  const [state, dispatch] = useReducer(reducer, undefined);
  const router = useRouter();
  const local = state?.visit === visit ? state.session : undefined;
  const session = local ?? stored?.current ?? stored?.finished;
  const finished = session?.status === "finished" ? session : undefined;

  useEffect(() => {
    if (local) saveSession(deviceStorage(), form, local);
  }, [local, form]);

  useEffect(() => {
    if (!start || !stored || stored.current || stored.finished) return;
    dispatch({
      type: "set",
      visit,
      session: startCheckSession(form, Date.now(), newSessionId()),
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
      skill: "listening",
      formId: form.id,
      formVersion: form.version,
      startedAt: finished.startedAt,
      finishedAt: finished.finishedAt,
      answers: finished.answers,
      pauses: finished.check?.pauses ?? 0,
      interruptions: finished.check?.interruptions ?? 0,
    };
    saveSession(deviceStorage(), form, finished);
    deviceLevelCheckHistory()
      .then(async (history) => {
        const committed = await history.commit(section, Date.now());
        if (committed && history.persistent)
          removeSession(deviceStorage(), form, finished);
      })
      .catch(() => undefined)
      .then(() => setLevelCheckSectionState("listening", "done"))
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
    (event: ListeningEvent) => {
      if (!session) return;
      dispatch({
        type: "event",
        visit,
        base: session,
        form,
        event,
        now: Date.now(),
      });
    },
    [form, session, visit],
  );

  if (snapshot === null || !stored) return { status: "loading" };
  if (finished) return { status: "finishing" };
  if (!session) return { status: start ? "loading" : "none" };
  return {
    status: "active",
    session,
    canSave: !snapshot.startsWith("0"),
    send,
  };
}
