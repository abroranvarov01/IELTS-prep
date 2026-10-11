import { afterEach, describe, expect, it } from "vitest";
import { demoTest as test, testSessionId } from "../model/demo-test.fixture";
import { isSessionId } from "../model/parse-session";
import { apply, startSession } from "../model/session";
import {
  deviceStorage,
  loadSessions,
  newSessionId,
  removeLegacyFinished,
  removeSession,
  saveSession,
} from "./session-storage";

const T0 = Date.UTC(2026, 9, 10, 9, 0);

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

const blockedStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("quota");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

afterEach(() => window.localStorage.clear());

describe("Reading sessions on the device", () => {
  it("keeps the current session of a test and reads it back", () => {
    const storage = memoryStorage();
    const session = apply(
      startSession(test, "exam", T0, testSessionId()),
      test,
      { type: "answer", number: 2, answer: "FALSE" },
      T0,
    );

    expect(saveSession(storage, session)).toBe(true);
    expect([...storage.values.keys()]).toEqual(["reading:demo-academic-1"]);
    expect(loadSessions(storage, test)).toEqual({ current: session });
  });

  it("keeps a finished session in its entry until it is committed (ADR-0009 §4)", () => {
    const storage = memoryStorage();
    const session = startSession(test, "practice", T0, testSessionId());
    saveSession(storage, session);
    const finished = apply(session, test, { type: "finish" }, T0 + 1000);

    saveSession(storage, finished);
    expect([...storage.values.keys()]).toEqual(["reading:demo-academic-1"]);
    expect(loadSessions(storage, test)).toEqual({ current: finished });
  });

  it("never lets a stale in-progress copy replace a finished one of the same session", () => {
    const storage = memoryStorage();
    const session = startSession(test, "practice", T0, testSessionId());
    const finished = apply(session, test, { type: "finish" }, T0 + 1000);
    saveSession(storage, finished);

    const stale = apply(
      session,
      test,
      { type: "answer", number: 1, answer: "TRUE" },
      T0 + 2000,
    );
    expect(saveSession(storage, stale)).toBe(true);
    expect(loadSessions(storage, test)).toEqual({ current: finished });

    const next = startSession(test, "practice", T0 + 3000, testSessionId(2));
    saveSession(storage, next);
    expect(loadSessions(storage, test)).toEqual({ current: next });
  });

  it("removes an entry only while it holds the same session", () => {
    const storage = memoryStorage();
    const first = startSession(test, "practice", T0, testSessionId());
    const second = startSession(test, "practice", T0 + 1, testSessionId(2));
    saveSession(storage, second);
    removeSession(storage, first);
    expect(loadSessions(storage, test)).toEqual({ current: second });
    removeSession(storage, second);
    expect(loadSessions(storage, test)).toEqual({});
  });

  it("keeps a retry in its own entry, apart from the test session", () => {
    const storage = memoryStorage();
    const current = startSession(test, "practice", T0, testSessionId());
    const retry = {
      ...startSession(test, "practice", T0, testSessionId(2)),
      retry: { of: testSessionId(3), questions: [22, 23] },
    };
    saveSession(storage, current);
    saveSession(storage, retry);
    expect([...storage.values.keys()].sort()).toEqual([
      "reading:demo-academic-1",
      "reading:demo-academic-1:retry",
    ]);
    expect(loadSessions(storage, test)).toEqual({ current, retry });
  });

  it("reads M4's finished entry as a legacy session with its derived id", () => {
    const storage = memoryStorage();
    // As M4 stored it: no session id.
    const m4: Record<string, unknown> = {
      ...apply(
        startSession(test, "exam", T0, testSessionId()),
        test,
        { type: "finish" },
        T0 + 1000,
      ),
    };
    delete m4.sessionId;
    storage.setItem(
      "reading:demo-academic-1:finished",
      JSON.stringify({ schema: 1, session: m4 }),
    );
    expect(loadSessions(storage, test).legacyFinished?.sessionId).toBe(
      `m4-finished-${T0}`,
    );
    removeLegacyFinished(storage, test.id);
    expect(storage.values.size).toBe(0);
  });

  it("makes a new random session id each time", () => {
    const ids = new Set(Array.from({ length: 50 }, () => newSessionId()));
    expect(ids.size).toBe(50);
    for (const id of ids) expect(isSessionId(id)).toBe(true);
  });

  it("reads malformed or tampered data as no session", () => {
    const storage = memoryStorage();
    storage.setItem("reading:demo-academic-1", "{not json");
    storage.setItem(
      "reading:demo-academic-1:finished",
      JSON.stringify({ schema: 1, session: { testId: "demo-academic-1" } }),
    );
    expect(loadSessions(storage, test)).toEqual({});
  });

  it("reports that nothing was kept when storage is blocked or full", () => {
    expect(
      saveSession(
        blockedStorage,
        startSession(test, "practice", T0, testSessionId()),
      ),
    ).toBe(false);
    expect(
      saveSession(
        undefined,
        startSession(test, "practice", T0, testSessionId()),
      ),
    ).toBe(false);
    expect(loadSessions(blockedStorage, test)).toEqual({});
  });

  it("uses the browser's localStorage", () => {
    const storage = deviceStorage();
    expect(storage).toBe(window.localStorage);
    saveSession(storage, startSession(test, "practice", T0, testSessionId()));
    expect(window.localStorage.getItem("reading:demo-academic-1")).toContain(
      '"schema":1',
    );
  });
});
