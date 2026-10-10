import type { ReadingTest } from "@/domain/reading/content";
import {
  SESSION_SCHEMA,
  parseStoredSession,
} from "@/domain/reading/parse-session";
import type { ReadingSession } from "@/domain/reading/session";

// Reading sessions live on the device, in localStorage (ADR-0006): the
// current session of a test, and its most recent finished one (kept for M5).

type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const currentKey = (testId: string) => `reading:${testId}`;
const finishedKey = (testId: string) => `reading:${testId}:finished`;

/** The browser's localStorage, or undefined where it is blocked. */
export function deviceStorage(): KeyValueStore | undefined {
  try {
    return window.localStorage;
  } catch {
    // Some browsers throw on access when site data is blocked.
    return undefined;
  }
}

export type StoredSessions = {
  current?: ReadingSession;
  finished?: ReadingSession;
};

/** Reads both sessions of a test; anything invalid reads as absent. */
export function loadSessions(
  storage: KeyValueStore | undefined,
  test: ReadingTest,
): StoredSessions {
  const read = (key: string) => {
    try {
      const raw = storage?.getItem(key);
      return raw ? parseStoredSession(test, JSON.parse(raw)) : undefined;
    } catch {
      // Unreadable storage or malformed JSON both mean "no session".
      return undefined;
    }
  };
  const current = read(currentKey(test.id));
  const finished = read(finishedKey(test.id));
  return {
    ...(current?.status === "inProgress" && { current }),
    ...(finished?.status === "finished" && { finished }),
  };
}

/**
 * Keeps a session: an unfinished one as the current session, a finished one
 * as the latest finished session (and the current one is removed).
 * Returns false when the device does not keep it.
 */
export function saveSession(
  storage: KeyValueStore | undefined,
  session: ReadingSession,
): boolean {
  if (!storage) return false;
  const value = JSON.stringify({ schema: SESSION_SCHEMA, session });
  try {
    if (session.status === "finished") {
      storage.setItem(finishedKey(session.testId), value);
      storage.removeItem(currentKey(session.testId));
    } else {
      storage.setItem(currentKey(session.testId), value);
    }
    return true;
  } catch {
    // Quota exceeded or storage blocked: the caller shows the notice.
    return false;
  }
}
