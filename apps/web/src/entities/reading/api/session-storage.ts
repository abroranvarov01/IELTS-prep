import type { ReadingTest } from "../model/content";
import { SESSION_SCHEMA, parseStoredSession } from "../model/parse-session";
import type { ReadingSession } from "../model/session";

// Reading sessions live on the device, in localStorage (ADR-0006): the
// current test session and the current retry, each in progress or finished
// and not yet committed to the attempt history (ADR-0009 §2, §4). M4's
// finished entry is only read, to be imported, and then removed.

export type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const currentKey = (testId: string) => `reading:${testId}`;
const retryKey = (testId: string) => `reading:${testId}:retry`;
const legacyFinishedKey = (testId: string) => `reading:${testId}:finished`;
const keyOf = (session: ReadingSession) =>
  session.retry ? retryKey(session.testId) : currentKey(session.testId);

/**
 * A new session id (ADR-0009 §3): "s-" and a random version 4 UUID. Built
 * from `crypto.getRandomValues`, which, unlike `randomUUID`, also works
 * outside secure contexts.
 */
export function newSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `s-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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
  /** The test session, in progress or finished and not yet committed. */
  current?: ReadingSession;
  /** The retry session, likewise. */
  retry?: ReadingSession;
  /** The finished session M4 kept, until it is imported. */
  legacyFinished?: ReadingSession;
};

function readSession(
  storage: KeyValueStore | undefined,
  test: ReadingTest,
  key: string,
  slot: "current" | "finished",
): ReadingSession | undefined {
  try {
    const raw = storage?.getItem(key);
    return raw ? parseStoredSession(test, JSON.parse(raw), slot) : undefined;
  } catch {
    // Unreadable storage or malformed JSON both mean "no session".
    return undefined;
  }
}

/** Reads the sessions of a test; anything invalid reads as absent. */
export function loadSessions(
  storage: KeyValueStore | undefined,
  test: ReadingTest,
): StoredSessions {
  const current = readSession(storage, test, currentKey(test.id), "current");
  const retry = readSession(storage, test, retryKey(test.id), "current");
  const legacyFinished = readSession(
    storage,
    test,
    legacyFinishedKey(test.id),
    "finished",
  );
  return {
    ...(current && !current.retry && { current }),
    ...(retry?.retry && { retry }),
    ...(legacyFinished?.status === "finished" && { legacyFinished }),
  };
}

/**
 * Keeps a session in its entry, in progress or finished. A stored finished
 * copy of the same session is never replaced by an in-progress one (a stale
 * tab). Returns false when the device does not keep it.
 */
export function saveSession(
  storage: KeyValueStore | undefined,
  session: ReadingSession,
): boolean {
  if (!storage) return false;
  try {
    if (session.status === "inProgress") {
      const stored = storedSession(storage, keyOf(session));
      if (
        stored?.status === "finished" &&
        storedSessionId(stored) === session.sessionId
      )
        return true;
    }
    storage.setItem(
      keyOf(session),
      JSON.stringify({ schema: SESSION_SCHEMA, session }),
    );
    return true;
  } catch {
    // Quota exceeded or storage blocked: the caller shows the notice.
    return false;
  }
}

/** Removes a session's entry, only while it still holds that session. */
export function removeSession(
  storage: KeyValueStore | undefined,
  session: ReadingSession,
): void {
  try {
    const stored = storedSession(storage, keyOf(session));
    if (stored && storedSessionId(stored) === session.sessionId)
      storage?.removeItem(keyOf(session));
  } catch {
    // Blocked storage keeps the entry; the next load settles it again.
  }
}

/** Removes M4's finished entry once it is imported (ADR-0009 §6). */
export function removeLegacyFinished(
  storage: KeyValueStore | undefined,
  testId: string,
): void {
  try {
    storage?.removeItem(legacyFinishedKey(testId));
  } catch {
    // Blocked storage keeps the entry; importing it again changes nothing.
  }
}

/** The raw session in an entry, without validating it (may throw). */
function storedSession(
  storage: KeyValueStore | undefined,
  key: string,
): Record<string, unknown> | undefined {
  const raw = storage?.getItem(key);
  const envelope: unknown = raw ? JSON.parse(raw) : undefined;
  const session =
    typeof envelope === "object" && envelope !== null
      ? (envelope as { session?: unknown }).session
      : undefined;
  return typeof session === "object" && session !== null
    ? (session as Record<string, unknown>)
    : undefined;
}

/** A stored session's id, derived as the parser derives it for an M4 session (ADR-0009 §3). */
function storedSessionId(session: Record<string, unknown>): unknown {
  return session.sessionId ?? `m4-current-${String(session.startedAt)}`;
}

export type StorageSnapshot = StoredSessions & {
  /** False when the device does not keep anything (blocked or full). */
  canSave: boolean;
};

// useSyncExternalStore needs the same snapshot object until the stored values
// change, so parsed snapshots are cached by their raw stored text.
const snapshots = new Map<string, { raw: string; snapshot: StorageSnapshot }>();

/** The stored sessions of a test, for `useSyncExternalStore` (ADR-0006). */
export function storageSnapshot(test: ReadingTest): StorageSnapshot {
  const storage = deviceStorage();
  const raw = [currentKey, retryKey, legacyFinishedKey]
    .map((key) => {
      try {
        return storage?.getItem(key(test.id)) ?? "";
      } catch {
        return "";
      }
    })
    .join("\n");
  const cached = snapshots.get(test.id);
  if (cached?.raw === raw) return cached.snapshot;
  const snapshot = {
    ...loadSessions(storage, test),
    canSave: canWrite(storage),
  };
  snapshots.set(test.id, { raw, snapshot });
  return snapshot;
}

function canWrite(storage: KeyValueStore | undefined): boolean {
  if (!storage) return false;
  try {
    storage.setItem("reading:probe", "1");
    storage.removeItem("reading:probe");
    return true;
  } catch {
    return false;
  }
}
