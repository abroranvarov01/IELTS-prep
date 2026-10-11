import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import {
  type ReadingAttempt,
  type ResultRecord,
  UNKNOWN_FIRST_TRY,
} from "../model/attempts";
import {
  demoKey,
  demoTest as test,
  testSessionId,
} from "../model/demo-test.fixture";
import { checkAttempt } from "../model/scoring";
import { type ReadingSession, apply, startSession } from "../model/session";
import {
  commitFinishedSession,
  openHistory,
  recordResult,
  settleStoredSessions,
} from "./history";
import { loadSessions, saveSession } from "./session-storage";

// Two connections to one database stand in for two tabs: IndexedDB runs
// their overlapping read-write transactions one after the other, as browsers
// do across tabs (ADR-0009 §11).

const T0 = Date.UTC(2026, 9, 11, 9, 0);

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

/** Two tabs on one fresh database. */
async function twoTabs() {
  const factory = new IDBFactory();
  return {
    factory,
    tabA: await openHistory(factory),
    tabB: await openHistory(factory),
  };
}

/** A session with id `n`, finished at `finishedAt` after answering `answer` to question 1. */
function finishedSession(
  n: number,
  answer: string,
  finishedAt: number,
  options: { startedAt?: number; highlight?: string; retry?: boolean } = {},
): ReadingSession {
  let s = startSession(
    test,
    "practice",
    options.startedAt ?? T0,
    testSessionId(n),
  );
  if (options.retry)
    s = { ...s, retry: { of: testSessionId(99), questions: [1] } };
  s = apply(s, test, { type: "answer", number: 1, answer }, T0);
  if (options.highlight)
    s = apply(
      s,
      test,
      { type: "toggleHighlight", sentenceId: options.highlight },
      T0,
    );
  s = apply(s, test, { type: "pin", number: 1, sentenceId: "p1-1-s2" }, T0);
  return apply(s, test, { type: "finish" }, finishedAt);
}

/** What M4 wrote to localStorage: a session without an id. */
function asM4(session: ReadingSession): string {
  const m4: Partial<ReadingSession> = { ...session };
  delete m4.sessionId;
  return JSON.stringify({ schema: 1, session: m4 });
}

function record(attempt: ReadingAttempt, checkedAt: number, revision = 1) {
  return {
    attemptId: attempt.id,
    keyRevision: revision,
    rulesVersion: 1,
    checkedAt,
    ...checkAttempt(test, demoKey, attempt),
  } satisfies ResultRecord;
}

/** Reads a store directly, as another app version would see it. */
function rawRecords(factory: IDBFactory, store: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const open = factory.open("ielts-prep-reading");
    open.onsuccess = () => {
      const req = open.result
        .transaction(store, "readonly")
        .objectStore(store)
        .getAll();
      req.onsuccess = () => {
        open.result.close();
        resolve(req.result);
      };
      req.onerror = () => reject(req.error);
    };
    open.onerror = () => reject(open.error);
  });
}

function putRaw(factory: IDBFactory, store: string, value: object) {
  return new Promise<void>((resolve, reject) => {
    const open = factory.open("ielts-prep-reading");
    open.onsuccess = () => {
      const tx = open.result.transaction(store, "readwrite");
      tx.objectStore(store).put(value);
      tx.oncomplete = () => {
        open.result.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
    open.onerror = () => reject(open.error);
  });
}

describe("committing a finished session across tabs", () => {
  it("keeps the first committed attempt when two tabs commit the same session at once", async () => {
    const { tabA, tabB } = await twoTabs();
    const fromA = finishedSession(1, "TRUE", T0 + 60_000, {
      highlight: "p1-1-s1",
    });
    const fromB = finishedSession(1, "FALSE", T0 + 90_000);

    const [a, b] = await Promise.all([
      tabA.commit(test, fromA, T0 + 61_000),
      tabB.commit(test, fromB, T0 + 91_000),
    ]);

    expect(a).toMatchObject({
      id: testSessionId(1),
      answers: { "1": "TRUE" },
      pins: { "1": ["p1-1-s2"] },
      highlights: ["p1-1-s1"],
      finishedAt: T0 + 60_000,
      committedAt: T0 + 61_000,
    });
    expect(b).toEqual(a);
    expect((await tabB.read(test)).attempts).toEqual([a]);
  });

  it("keeps the first committed attempt when a stale tab commits the same session later", async () => {
    const { tabA, tabB } = await twoTabs();
    const first = await tabA.commit(
      test,
      finishedSession(1, "TRUE", T0 + 60_000),
      T0 + 61_000,
    );
    const later = await tabB.commit(
      test,
      finishedSession(1, "NOT GIVEN", T0 + 600_000),
      T0 + 601_000,
    );
    expect(later).toEqual(first);
    expect((await tabA.read(test)).attempts).toEqual([first]);
  });

  it("decides the first try once when two tabs commit different first attempts at once", async () => {
    const { tabA, tabB } = await twoTabs();
    const [a, b] = await Promise.all([
      tabA.commit(test, finishedSession(1, "TRUE", T0 + 60_000), T0 + 61_000),
      tabB.commit(test, finishedSession(2, "FALSE", T0 + 70_000), T0 + 71_000),
    ]);
    const history = await tabA.read(test);
    expect(history.attempts.map((x) => x.id).sort()).toEqual(
      [a?.id, b?.id].sort(),
    );
    expect(history.firstTry).toBe(testSessionId(1));
  });

  it("gives a test and a retry, and two test sessions, started in the same millisecond distinct ids", async () => {
    const { tabA, tabB } = await twoTabs();
    await Promise.all([
      tabA.commit(test, finishedSession(1, "TRUE", T0 + 1), T0 + 2),
      tabB.commit(
        test,
        finishedSession(2, "TRUE", T0 + 1, { retry: true }),
        T0 + 2,
      ),
      tabB.commit(test, finishedSession(3, "FALSE", T0 + 1), T0 + 2),
    ]);
    const { attempts } = await tabA.read(test);
    expect(attempts.map((a) => [a.id, a.kind])).toEqual(
      expect.arrayContaining([
        [testSessionId(1), "test"],
        [testSessionId(2), "retry"],
        [testSessionId(3), "test"],
      ]),
    );
    expect(attempts).toHaveLength(3);
  });

  it("never overwrites a record of another schema at the session's id", async () => {
    const { factory, tabA } = await twoTabs();
    const future = { schema: 2, id: testSessionId(1), testId: test.id };
    await putRaw(factory, "attempts", future);
    expect(
      await tabA.commit(test, finishedSession(1, "TRUE", T0 + 1), T0 + 2),
    ).toBeUndefined();
    expect(await rawRecords(factory, "attempts")).toEqual([future]);
  });

  it("keeps at most 20 attempts of a test, always including the first try", async () => {
    const { tabA } = await twoTabs();
    for (let n = 1; n <= 22; n++)
      await tabA.commit(
        test,
        finishedSession(n, "TRUE", T0 + n * 1000, { startedAt: T0 + n }),
        T0 + n * 1000 + 1,
      );
    const { attempts, firstTry } = await tabA.read(test);
    expect(attempts).toHaveLength(20);
    expect(firstTry).toBe(testSessionId(1));
    expect(attempts.map((a) => a.id)).not.toContain(testSessionId(2));
    expect(attempts.map((a) => a.id)).not.toContain(testSessionId(3));
  });
});

describe("result records across tabs", () => {
  it("keeps exactly one record per attempt and pair when two tabs check it at once", async () => {
    const { tabA, tabB } = await twoTabs();
    const attempt = await tabA.commit(
      test,
      finishedSession(1, "TRUE", T0 + 60_000),
      T0 + 61_000,
    );
    if (!attempt) throw new Error("not committed");
    const [a, b] = await Promise.all([
      tabA.addResult(attempt, record(attempt, T0 + 100)),
      tabB.addResult(attempt, record(attempt, T0 + 200)),
    ]);
    expect(a.checkedAt).toBe(T0 + 100);
    expect(b).toEqual(a);
    expect(await tabB.results(attempt)).toEqual([a]);
  });

  it("adds a record for a new key revision and keeps the earlier one", async () => {
    const { tabA } = await twoTabs();
    const attempt = await tabA.commit(
      test,
      finishedSession(1, "TRUE", T0 + 60_000),
      T0 + 61_000,
    );
    if (!attempt) throw new Error("not committed");
    const first = await tabA.addResult(attempt, record(attempt, T0 + 100));
    const second = await tabA.addResult(attempt, record(attempt, T0 + 200, 2));
    expect(await tabA.results(attempt)).toEqual([first, second]);
  });
});

describe("recording the result of an attempt", () => {
  it("adds one record for the current pair, once, even when two tabs show the results at once", async () => {
    const { tabA, tabB } = await twoTabs();
    const attempt = await tabA.commit(
      test,
      finishedSession(1, "TRUE", T0 + 60_000),
      T0 + 61_000,
    );
    if (!attempt) throw new Error("not committed");
    const [a, b] = await Promise.all([
      recordResult(tabA, test, demoKey, attempt, T0 + 100),
      recordResult(tabB, test, demoKey, attempt, T0 + 200),
    ]);
    expect(b).toEqual(a);
    expect(a).toHaveLength(1);
    expect(a[0]).toMatchObject({ keyRevision: 1, rulesVersion: 1 });
    expect(await recordResult(tabA, test, demoKey, attempt, T0 + 300)).toEqual(
      a,
    );
  });

  it("adds a record for a new key revision even when nothing changes, keeping the earlier one", async () => {
    const { tabA } = await twoTabs();
    const attempt = await tabA.commit(
      test,
      finishedSession(1, "TRUE", T0 + 60_000),
      T0 + 61_000,
    );
    if (!attempt) throw new Error("not committed");
    const [first] = await recordResult(tabA, test, demoKey, attempt, T0 + 100);
    const records = await recordResult(
      tabA,
      test,
      { ...demoKey, revision: 2 },
      attempt,
      T0 + 200,
    );
    expect(records.map((r) => r.keyRevision)).toEqual([1, 2]);
    expect(records[0]).toEqual(first);
    expect(records[1]?.score).toEqual(first?.score);
  });
});

describe("importing M4's finished session", () => {
  it("imports it once, with its highlights and no result, when two tabs import at once", async () => {
    const { tabA, tabB } = await twoTabs();
    const m4 = {
      ...finishedSession(1, "TRUE", T0 + 60_000, { highlight: "p1-1-s1" }),
      sessionId: `m4-finished-${T0}`,
    };
    const [a, b] = await Promise.all([
      tabA.importM4Finished(test, m4, T0 + 61_000),
      tabB.importM4Finished(test, m4, T0 + 62_000),
    ]);
    expect([a, b]).toEqual([true, true]);
    const { attempts, firstTry } = await tabA.read(test);
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      id: `m4-finished-${T0}`,
      importedFromM4: true,
      highlights: ["p1-1-s1"],
      committedAt: T0 + 61_000,
    });
    expect(firstTry).toBe(UNKNOWN_FIRST_TRY);
    expect(await tabA.results(attempts[0] as ReadingAttempt)).toEqual([]);
  });

  it("makes a first try already decided unknown, never another id", async () => {
    const { tabA } = await twoTabs();
    await tabA.commit(test, finishedSession(2, "TRUE", T0 + 60_000), T0 + 61);
    expect((await tabA.read(test)).firstTry).toBe(testSessionId(2));
    await tabA.importM4Finished(
      test,
      { ...finishedSession(1, "TRUE", T0 + 1), sessionId: `m4-finished-${T0}` },
      T0 + 62,
    );
    expect((await tabA.read(test)).firstTry).toBe(UNKNOWN_FIRST_TRY);
  });
});

describe("settling localStorage on load", () => {
  it("removes the localStorage copy only after a persistent commit", async () => {
    const { tabA } = await twoTabs();
    const storage = memoryStorage();
    const session = finishedSession(1, "TRUE", T0 + 60_000);
    const committed = await commitFinishedSession(
      storage,
      tabA,
      test,
      session,
      T0 + 61_000,
    );
    expect(committed?.id).toBe(testSessionId(1));
    expect(storage.values.size).toBe(0);
  });

  it("keeps the finished session when the commit fails, and commits it on the next load", async () => {
    const { tabA } = await twoTabs();
    const storage = memoryStorage();
    const session = finishedSession(1, "TRUE", T0 + 60_000);
    const failing = {
      ...tabA,
      commit: () => Promise.reject(new Error("transaction aborted")),
    };
    expect(
      await commitFinishedSession(storage, failing, test, session, T0 + 1),
    ).toBeUndefined();
    expect(loadSessions(storage, test).current).toEqual(session);

    await settleStoredSessions(storage, tabA, test, T0 + 2);
    expect(loadSessions(storage, test)).toEqual({});
    expect((await tabA.read(test)).attempts.map((a) => a.id)).toEqual([
      testSessionId(1),
    ]);
  });

  it("removes a stale in-progress copy of a session another tab committed", async () => {
    const { tabA, tabB } = await twoTabs();
    const finished = finishedSession(1, "TRUE", T0 + 60_000);
    await tabA.commit(test, finished, T0 + 61_000);
    const storage = memoryStorage();
    const stale = startSession(test, "practice", T0, testSessionId(1));
    saveSession(storage, stale);

    await settleStoredSessions(storage, tabB, test, T0 + 62_000);
    expect(loadSessions(storage, test)).toEqual({});
    expect((await tabB.read(test)).attempts).toHaveLength(1);
  });

  it("imports M4's entries: the finished one into the history, the one in progress kept to resume", async () => {
    const { tabA } = await twoTabs();
    const storage = memoryStorage();
    const m4Finished = finishedSession(1, "TRUE", T0 + 60_000, {
      highlight: "p1-1-s1",
    });
    const m4Current = startSession(test, "exam", T0 + 100_000, testSessionId());
    storage.setItem("reading:demo-academic-1:finished", asM4(m4Finished));
    storage.setItem("reading:demo-academic-1", asM4(m4Current));

    await settleStoredSessions(storage, tabA, test, T0 + 200_000);
    expect(storage.values.has("reading:demo-academic-1:finished")).toBe(false);
    expect(loadSessions(storage, test).current?.sessionId).toBe(
      `m4-current-${T0 + 100_000}`,
    );
    const { attempts, firstTry } = await tabA.read(test);
    expect(attempts.map((a) => [a.id, a.highlights])).toEqual([
      [`m4-finished-${T0}`, ["p1-1-s1"]],
    ]);
    expect(firstTry).toBe(UNKNOWN_FIRST_TRY);
  });

  it("keeps M4's finished entry when its import fails, to import it on a later load", async () => {
    const { tabA } = await twoTabs();
    const storage = memoryStorage();
    storage.setItem(
      "reading:demo-academic-1:finished",
      asM4(finishedSession(1, "TRUE", T0 + 60_000)),
    );
    const failing = {
      ...tabA,
      importM4Finished: () => Promise.reject(new Error("transaction aborted")),
    };
    await expect(
      settleStoredSessions(storage, failing, test, T0 + 1),
    ).rejects.toThrow();
    expect(storage.values.has("reading:demo-academic-1:finished")).toBe(true);

    await settleStoredSessions(storage, tabA, test, T0 + 2);
    expect(storage.values.has("reading:demo-academic-1:finished")).toBe(false);
    expect((await tabA.read(test)).attempts).toHaveLength(1);
  });

  it("never removes a localStorage source while the history lives only in memory", async () => {
    const memory = await openHistory(undefined);
    expect(memory.persistent).toBe(false);
    const storage = memoryStorage();
    const session = finishedSession(1, "TRUE", T0 + 60_000);
    expect(
      (await commitFinishedSession(storage, memory, test, session, T0 + 1))?.id,
    ).toBe(testSessionId(1));
    expect(loadSessions(storage, test).current).toEqual(session);

    storage.setItem("reading:demo-academic-1:finished", asM4(session));
    await settleStoredSessions(storage, memory, test, T0 + 2);
    expect(storage.values.has("reading:demo-academic-1:finished")).toBe(true);
  });
});

describe("a database the app cannot use", () => {
  it("leaves a newer database untouched and keeps the history in memory", async () => {
    const factory = new IDBFactory();
    await new Promise<void>((resolve, reject) => {
      const open = factory.open("ielts-prep-reading", 2);
      open.onupgradeneeded = () => open.result.createObjectStore("future");
      open.onsuccess = () => {
        open.result.close();
        resolve();
      };
      open.onerror = () => reject(open.error);
    });
    const history = await openHistory(factory);
    expect(history.persistent).toBe(false);
    const stores = await new Promise<string[]>((resolve) => {
      const open = factory.open("ielts-prep-reading");
      open.onsuccess = () => {
        const names = [...open.result.objectStoreNames];
        open.result.close();
        resolve(names);
      };
    });
    expect(stores).toEqual(["future"]);
  });
});
