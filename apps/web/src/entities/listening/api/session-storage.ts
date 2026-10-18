import type { KeyValueStore } from "@/shared/lib/device-storage";
import type { ListeningTest } from "../model/content";
import { SESSION_SCHEMA, parseStoredSession } from "../model/parse-session";
import { type ListeningSession, settleLoaded } from "../model/session";

// Listening sessions live on the device, in localStorage (ADR-0013 §3): the
// session in progress, and the finished one until the attempt history of
// M9 takes it over (as ADR-0009 §6 took over Reading's M4 sessions).

const currentKey = (testId: string) => `listening:${testId}`;
const finishedKey = (testId: string) => `listening:${testId}:finished`;

export type StoredSessions = {
  current?: ListeningSession;
  finished?: ListeningSession;
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
  const finished = read(storage, test, finishedKey(test.id));
  return {
    ...(current?.status === "inProgress" && { current: settleLoaded(current) }),
    ...(finished?.status === "finished" && { finished }),
  };
}

/**
 * Keeps a session: in progress in its test's entry; finished in the
 * finished entry, which then frees the current one. A stale tab never
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
    const value = JSON.stringify({ schema: SESSION_SCHEMA, session });
    if (session.status === "inProgress") {
      if (
        read(storage, test, finishedKey(test.id))?.sessionId ===
        session.sessionId
      )
        return true;
      storage.setItem(currentKey(test.id), value);
      return true;
    }
    storage.setItem(finishedKey(test.id), value);
    if (
      read(storage, test, currentKey(test.id))?.sessionId === session.sessionId
    )
      storage.removeItem(currentKey(test.id));
    return true;
  } catch {
    // Quota exceeded or storage blocked: the caller shows the notice.
    return false;
  }
}
