import { afterEach, describe, expect, it } from "vitest";
import { demoTest as test } from "@/domain/reading/demo-test.fixture";
import { apply, startSession } from "@/domain/reading/session";
import {
  deviceStorage,
  loadSessions,
  saveSession,
} from "./reading-session-storage";

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
      startSession(test, "exam", T0),
      test,
      { type: "answer", number: 2, answer: "FALSE" },
      T0,
    );

    expect(saveSession(storage, session)).toBe(true);
    expect([...storage.values.keys()]).toEqual(["reading:demo-academic-1"]);
    expect(loadSessions(storage, test)).toEqual({ current: session });
  });

  it("moves a finished session aside, so the test can be started again", () => {
    const storage = memoryStorage();
    const session = startSession(test, "practice", T0);
    saveSession(storage, session);
    const finished = apply(session, test, { type: "finish" }, T0 + 1000);

    saveSession(storage, finished);
    expect([...storage.values.keys()]).toEqual([
      "reading:demo-academic-1:finished",
    ]);
    expect(loadSessions(storage, test)).toEqual({ finished });

    const again = startSession(test, "practice", T0 + 2000);
    saveSession(storage, again);
    expect(loadSessions(storage, test)).toEqual({ current: again, finished });
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
      saveSession(blockedStorage, startSession(test, "practice", T0)),
    ).toBe(false);
    expect(saveSession(undefined, startSession(test, "practice", T0))).toBe(
      false,
    );
    expect(loadSessions(blockedStorage, test)).toEqual({});
  });

  it("uses the browser's localStorage", () => {
    const storage = deviceStorage();
    expect(storage).toBe(window.localStorage);
    saveSession(storage, startSession(test, "practice", T0));
    expect(window.localStorage.getItem("reading:demo-academic-1")).toContain(
      '"schema":1',
    );
  });
});
