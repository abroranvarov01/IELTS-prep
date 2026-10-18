import type { KeyValueStore } from "@/shared/lib/device-storage";
import type { ListeningTest } from "../model/content";
import { SESSION_SCHEMA, parseStoredSession } from "../model/parse-session";
import { type ListeningSession, settleLoaded } from "../model/session";

// Listening sessions live on the device, in localStorage (ADR-0013 §3): the
// session in progress, and a finished one until the attempt history commits
// it (ADR-0014 §3). M8 kept its finished session in a separate entry, which
// the history imports once (ADR-0014 §5).

const currentKey = (testId: string) => `listening:${testId}`;
const legacyFinishedKey = (testId: string) => `listening:${testId}:finished`;

export type StoredSessions = {
  current?: ListeningSession;
  /** The finished session not committed yet, else M8's finished one. */
  finished?: ListeningSession;
  /** M8's finished session, to be imported (ADR-0014 §5). */
  legacyFinished?: ListeningSession;
};

function read(
  storage: KeyValueStore | undefined,
  test: ListeningTest,
  key: string,
): ListeningSession | undefined {
  try {
    const raw = storage?.getItem(key);
    return raw ? parseStoredSession(test, JSON.parse(raw)) : undefined;
  } catch {
    // Unreadable storage or malformed JSON both mean "no session".
    return undefined;
  }
}

/**
 * Reads the sessions of a test; anything invalid reads as absent. A session
 * in progress is settled for a reload (ADR-0013 §3).
 */
export function loadSessions(
  storage: KeyValueStore | undefined,
  test: ListeningTest,
): StoredSessions {
  const current = read(storage, test, currentKey(test.id));
  const legacy = read(storage, test, legacyFinishedKey(test.id));
  const legacyFinished = legacy?.status === "finished" ? legacy : undefined;
  const finished = current?.status === "finished" ? current : legacyFinished;
  return {
    ...(current?.status === "inProgress" && { current: settleLoaded(current) }),
    ...(finished && { finished }),
    ...(legacyFinished && { legacyFinished }),
  };
}

/**
 * Keeps a session in its test's entry, in progress or finished; a finished
 * one stays there until it is committed (ADR-0014 §3). A stale tab never
 * brings a finished session back as in progress. Returns false when the
 * device does not keep it.
 */
export function saveSession(
  storage: KeyValueStore | undefined,
  test: ListeningTest,
  session: ListeningSession,
): boolean {
  if (!storage) return false;
  try {
    if (session.status === "inProgress") {
      const finished = [currentKey(test.id), legacyFinishedKey(test.id)].map(
        (key) => read(storage, test, key),
      );
      if (
        finished.some(
          (s) => s?.status === "finished" && s.sessionId === session.sessionId,
        )
      )
        return true;
    }
    storage.setItem(
      currentKey(test.id),
      JSON.stringify({ schema: SESSION_SCHEMA, session }),
    );
    return true;
  } catch {
    // Quota exceeded or storage blocked: the caller shows the notice.
    return false;
  }
}

/** Removes the test's entry when it holds this session (ADR-0009 §4). */
export function removeSession(
  storage: KeyValueStore | undefined,
  test: ListeningTest,
  session: ListeningSession,
): void {
  try {
    if (
      read(storage, test, currentKey(test.id))?.sessionId === session.sessionId
    )
      storage?.removeItem(currentKey(test.id));
  } catch {
    // Storage blocked: nothing to remove.
  }
}

/** Removes M8's finished entry once it is imported (ADR-0014 §5). */
export function removeLegacyFinished(
  storage: KeyValueStore | undefined,
  testId: string,
): void {
  try {
    storage?.removeItem(legacyFinishedKey(testId));
  } catch {
    // Storage blocked: nothing to remove.
  }
}
