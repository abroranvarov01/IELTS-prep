import { describe, expect, it } from "vitest";
import type { KeyValueStore } from "@/shared/lib/device-storage";
import { fixtureTest } from "../model/listening-test.fixture";
import { parseListeningTest } from "../model/parse-content";
import { apply, startSession } from "../model/session";
import {
  loadSessions,
  removeLegacyFinished,
  removeSession,
  saveSession,
} from "./session-storage";

const parsed = parseListeningTest(fixtureTest());
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
const test = parsed.value;
const T0 = 1_000_000;
const ID = "s-12345678-1234-4123-8123-123456789abc";

function memoryStorage(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

describe("Listening sessions on the device", () => {
  it("keep a session in progress and read it back after a reload", () => {
    const storage = memoryStorage();
    const session = apply(
      startSession(test, "practice", T0, ID),
      test,
      { type: "answer", number: 8, answer: "B" },
      T0,
    );
    expect(saveSession(storage, test, session)).toBe(true);
    expect(storage.data.has("listening:fixture-listening")).toBe(true);
    expect(loadSessions(storage, test)).toEqual({ current: session });
  });

  it("keep Reading's entries untouched", () => {
    const storage = memoryStorage();
    storage.setItem("reading:fixture-listening", "reading data");
    saveSession(storage, test, startSession(test, "practice", T0, ID));
    expect(storage.getItem("reading:fixture-listening")).toBe("reading data");
  });

  it("keep a finished session in its entry until the history commits it (ADR-0014 §3)", () => {
    const storage = memoryStorage();
    const session = startSession(test, "practice", T0, ID);
    saveSession(storage, test, session);
    const done = apply(session, test, { type: "finish" }, T0 + 10);
    saveSession(storage, test, done);
    expect(storage.data.has("listening:fixture-listening:finished")).toBe(
      false,
    );
    expect(loadSessions(storage, test)).toEqual({ finished: done });
    removeSession(storage, test, done);
    expect(loadSessions(storage, test)).toEqual({});
  });

  it("read M8's finished entry as the finished session to import, until it is removed", () => {
    const storage = memoryStorage();
    const done = apply(
      startSession(test, "practice", T0, ID),
      test,
      { type: "finish" },
      T0 + 10,
    );
    storage.setItem(
      "listening:fixture-listening:finished",
      JSON.stringify({ schema: 1, session: done }),
    );
    expect(loadSessions(storage, test)).toEqual({
      finished: done,
      legacyFinished: done,
    });
    expect(
      saveSession(storage, test, startSession(test, "practice", T0, ID)),
    ).toBe(true);
    expect(loadSessions(storage, test).current).toBeUndefined();
    removeLegacyFinished(storage, test.id);
    expect(loadSessions(storage, test)).toEqual({});
  });

  it("never bring a finished session back from a stale tab", () => {
    const storage = memoryStorage();
    const session = startSession(test, "practice", T0, ID);
    saveSession(
      storage,
      test,
      apply(session, test, { type: "finish" }, T0 + 10),
    );
    expect(saveSession(storage, test, session)).toBe(true);
    expect(loadSessions(storage, test).current).toBeUndefined();
  });

  it("settle an Exam's open buffering pause when it is read again", () => {
    const storage = memoryStorage();
    let session = apply(
      startSession(test, "exam", T0, ID),
      test,
      { type: "startRecording" },
      T0,
    );
    session = apply(session, test, { type: "stall" }, T0 + 1000);
    session = apply(session, test, { type: "heartbeat" }, T0 + 1500);
    saveSession(storage, test, session);
    expect(loadSessions(storage, test).current?.exam).toMatchObject({
      pausedMs: 500,
    });
  });

  it("read malformed data as no session and report a device that keeps nothing", () => {
    const storage = memoryStorage();
    storage.setItem("listening:fixture-listening", "{not json");
    expect(loadSessions(storage, test)).toEqual({});
    expect(
      saveSession(undefined, test, startSession(test, "practice", T0, ID)),
    ).toBe(false);
    const full: KeyValueStore = {
      ...memoryStorage(),
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(
      saveSession(full, test, startSession(test, "practice", T0, ID)),
    ).toBe(false);
  });
});
