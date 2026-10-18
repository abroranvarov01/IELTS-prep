import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { UNKNOWN_FIRST_TRY } from "../model/attempts";
import {
  fixtureKey,
  fixtureTest,
  fixtureTranscript,
} from "../model/listening-test.fixture";
import {
  parseListeningKey,
  parseListeningTest,
  parseTranscript,
} from "../model/parse-content";
import { type ListeningSession, apply, startSession } from "../model/session";
import {
  commitFinishedSession,
  openHistory,
  recordResult,
  settleStoredSessions,
} from "./history";
import { loadSessions } from "./session-storage";

// Two connections to one database stand in for two tabs: IndexedDB runs
// their overlapping read-write transactions one after the other, as browsers
// do across tabs (ADR-0009 §11, ADR-0014 §3).

function parsed<T>(
  result: { ok: true; value: T } | { ok: false; errors: string[] },
): T {
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
}
const test = parsed(parseListeningTest(fixtureTest()));
const transcript = parsed(parseTranscript(test, fixtureTranscript()));
const key = parsed(parseListeningKey(test, transcript, fixtureKey()));

const T0 = Date.UTC(2026, 9, 18, 9, 0);
const id = (n: number) =>
  `s-00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const CURRENT = "listening:fixture-listening";
const LEGACY = "listening:fixture-listening:finished";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => void values.set(k, v),
    removeItem: (k: string) => void values.delete(k),
  };
}

async function twoTabs(factory = new IDBFactory()) {
  return {
    factory,
    tabA: await openHistory(factory),
    tabB: await openHistory(factory),
  };
}

/** A Practice session with id `n` that answered question 1 and finished at `finishedAt`. */
function finished(n: number, answer: string, finishedAt: number) {
  let s = startSession(test, "practice", T0, id(n));
  s = apply(s, test, { type: "answer", number: 1, answer }, T0);
  return apply(s, test, { type: "finish" }, finishedAt);
}

const envelope = (session: ListeningSession) =>
  JSON.stringify({ schema: 1, session });

describe("committing a finished Listening session across tabs", () => {
  it("keeps the first committed attempt when two tabs commit the same session at once", async () => {
    const { tabA, tabB } = await twoTabs();
    const [a, b] = await Promise.all([
      tabA.commit(test, finished(1, "here", T0 + 60_000), T0 + 1),
      tabB.commit(test, finished(1, "there", T0 + 70_000), T0 + 2),
    ]);
    expect(a).toEqual(b);
    const { attempts, firstTry } = await tabB.read(test);
    expect(attempts).toHaveLength(1);
    expect(firstTry).toBe(id(1));
  });

  it("decides the first try once when two tabs commit different first attempts at once", async () => {
    const { tabA, tabB } = await twoTabs();
    await Promise.all([
      tabA.commit(test, finished(1, "here", T0 + 60_000), T0 + 1),
      tabB.commit(test, finished(2, "here", T0 + 60_000), T0 + 1),
    ]);
    const { attempts, firstTry } = await tabA.read(test);
    expect(attempts).toHaveLength(2);
    expect([id(1), id(2)]).toContain(firstTry);
  });

  it("keeps exactly one result record per attempt and pair when two tabs check it at once", async () => {
    const { tabA, tabB } = await twoTabs();
    const attempt = (await tabA.commit(
      test,
      finished(1, "here", T0 + 60_000),
      T0 + 1,
    ))!;
    const [ra, rb] = await Promise.all([
      recordResult(tabA, test, key, transcript, attempt, T0 + 2),
      recordResult(tabB, test, key, transcript, attempt, T0 + 3),
    ]);
    expect(ra.at(-1)).toEqual(rb.at(-1));
    const records = await tabA.results(test, attempt);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ keyRevision: 1, rulesVersion: 1 });
    expect(records[0]?.score).toEqual({
      kind: "practiceRawScore",
      marks: 1,
      positions: 40,
    });
  });
});

describe("a Listening retry", () => {
  it("is kept apart from the test session, committed as its own attempt over its questions only, and never becomes the first try", async () => {
    const { tabA } = await twoTabs();
    const storage = memoryStorage();
    const source = (await tabA.commit(
      test,
      finished(1, "here", T0 + 60_000),
      T0 + 1,
    ))!;
    const inProgress = startSession(test, "practice", T0, id(2));
    storage.setItem(CURRENT, envelope(inProgress));

    let retry = startSession(test, "exam", T0 + 2, id(3), {
      of: source.id,
      questions: [2, 37, 38],
    });
    expect(retry).toMatchObject({ mode: "practice", currentQuestion: 2 });
    retry = apply(retry, test, { type: "answer", number: 1, answer: "x" }, T0);
    retry = apply(retry, test, { type: "answer", number: 2, answer: "x" }, T0);
    retry = apply(retry, test, { type: "finish" }, T0 + 90_000);
    expect(retry.answers).toEqual({ "2": "x" });
    storage.setItem(`${CURRENT}:retry`, envelope(retry));
    expect(loadSessions(storage, test)).toMatchObject({
      current: { sessionId: id(2) },
      retry: { sessionId: id(3) },
    });

    await settleStoredSessions(storage, tabA, test, T0 + 100_000);
    expect(storage.values.has(`${CURRENT}:retry`)).toBe(false);
    expect(storage.values.has(CURRENT)).toBe(true);
    const { attempts, firstTry } = await tabA.read(test);
    const committed = attempts.find((a) => a.id === id(3))!;
    expect(committed).toMatchObject({
      kind: "retry",
      retryOf: source.id,
      questions: [2, 37, 38],
    });
    expect(firstTry).toBe(source.id);

    const [record] = await recordResult(
      tabA,
      test,
      key,
      transcript,
      committed,
      T0 + 100_001,
    );
    expect(Object.keys(record!.outcomes)).toEqual(["2", "37", "38"]);
    expect(record!.score.positions).toBe(3);
    expect(await tabA.results(test, committed)).toEqual([record]);
  });
});

describe("settling Listening sessions on load", () => {
  it("removes the finished session's copy only after a persistent commit", async () => {
    const { tabA } = await twoTabs();
    const storage = memoryStorage();
    const session = finished(1, "here", T0 + 60_000);
    expect(
      (await commitFinishedSession(storage, tabA, test, session, T0 + 1))?.id,
    ).toBe(id(1));
    expect(storage.values.has(CURRENT)).toBe(false);
  });

  it("keeps the finished session when the commit fails, and commits it on the next load", async () => {
    const { tabA } = await twoTabs();
    const storage = memoryStorage();
    const session = finished(1, "here", T0 + 60_000);
    const failing = {
      ...tabA,
      commit: () => Promise.reject(new Error("transaction aborted")),
    };
    expect(
      await commitFinishedSession(storage, failing, test, session, T0 + 1),
    ).toBeUndefined();
    expect(loadSessions(storage, test).finished).toEqual(session);

    await settleStoredSessions(storage, tabA, test, T0 + 2);
    expect(storage.values.size).toBe(0);
    expect((await tabA.read(test)).attempts.map((a) => a.id)).toEqual([id(1)]);
  });

  it("imports M8's finished session once, under its own id, with the first try unknown, when two tabs import at once", async () => {
    const { tabA, tabB } = await twoTabs();
    const storage = memoryStorage();
    storage.setItem(LEGACY, envelope(finished(1, "here", T0 + 60_000)));
    await Promise.all([
      settleStoredSessions(storage, tabA, test, T0 + 1),
      settleStoredSessions(storage, tabB, test, T0 + 2),
    ]);
    const { attempts, firstTry } = await tabA.read(test);
    expect(attempts.map((a) => [a.id, a.importedFromM8])).toEqual([
      [id(1), true],
    ]);
    expect(await tabA.results(test, attempts[0]!)).toEqual([]);
    expect(firstTry).toBe(UNKNOWN_FIRST_TRY);
    expect(storage.values.has(LEGACY)).toBe(false);
  });

  it("keeps M8's entry when its import fails, to import it on a later load", async () => {
    const { tabA } = await twoTabs();
    const storage = memoryStorage();
    storage.setItem(LEGACY, envelope(finished(1, "here", T0 + 60_000)));
    const failing = {
      ...tabA,
      importM8Finished: () => Promise.reject(new Error("transaction aborted")),
    };
    await expect(
      settleStoredSessions(storage, failing, test, T0 + 1),
    ).rejects.toThrow();
    expect(storage.values.has(LEGACY)).toBe(true);

    await settleStoredSessions(storage, tabA, test, T0 + 2);
    expect(storage.values.has(LEGACY)).toBe(false);
    expect((await tabA.read(test)).attempts).toHaveLength(1);
  });

  it("keeps one attempt when a stale tab commits the session M8's entry held", async () => {
    const { tabA, tabB } = await twoTabs();
    const storage = memoryStorage();
    const session = finished(1, "here", T0 + 60_000);
    storage.setItem(LEGACY, envelope(session));
    await tabB.commit(test, session, T0 + 1);
    await settleStoredSessions(storage, tabA, test, T0 + 2);
    const { attempts, firstTry } = await tabA.read(test);
    expect(attempts.map((a) => a.id)).toEqual([id(1)]);
    expect(attempts[0]?.importedFromM8).toBeUndefined();
    expect(firstTry).toBe(UNKNOWN_FIRST_TRY);
  });

  it("never removes a localStorage source while the history lives only in memory", async () => {
    const memory = await openHistory(undefined);
    expect(memory.persistent).toBe(false);
    const storage = memoryStorage();
    storage.setItem(LEGACY, envelope(finished(1, "here", T0 + 60_000)));
    await commitFinishedSession(
      storage,
      memory,
      test,
      finished(2, "here", T0 + 70_000),
      T0 + 1,
    );
    await settleStoredSessions(storage, memory, test, T0 + 2);
    expect(storage.values.has(LEGACY)).toBe(true);
    expect(loadSessions(storage, test).finished?.sessionId).toBe(id(2));
  });
});

// --- Reading's storage stays as it is -----------------------------------------
//
// Real M4/M5 shapes, written as the Reading slice writes them (ADR-0006,
// ADR-0009): an M5 attempt with pins and highlights, an imported M4 attempt
// with highlights, a retry, a first-try marker, a result record, and
// localStorage entries for a session in progress, a retry and an M4 finish.

const RID = (n: number) =>
  `s-00000000-0000-4000-8000-${String(900 + n).padStart(12, "0")}`;
const readingRecords = {
  attempts: [
    {
      schema: 1,
      id: RID(1),
      testId: "demo-academic-1",
      testVersion: 1,
      kind: "test",
      mode: "practice",
      startedAt: T0 - 9000,
      finishedAt: T0 - 5000,
      finishReason: "user",
      answers: { "1": "TRUE", "22": ["A", "C"], "7": "phone" },
      pins: { "1": ["p1-1-s2"] },
      highlights: ["p1-1-s1", "p1-1-s3"],
      committedAt: T0 - 4900,
    },
    {
      schema: 1,
      id: "m4-finished-1760000000000",
      testId: "demo-academic-1",
      testVersion: 1,
      kind: "test",
      mode: "exam",
      startedAt: 1_760_000_000_000,
      finishedAt: 1_760_003_600_000,
      finishReason: "timeUp",
      answers: { "2": "NOT GIVEN" },
      pins: {},
      highlights: [],
      importedFromM4: true,
      committedAt: T0 - 8000,
    },
    {
      schema: 1,
      id: RID(2),
      testId: "demo-academic-1",
      testVersion: 1,
      kind: "retry",
      retryOf: RID(1),
      questions: [22, 23],
      mode: "practice",
      startedAt: T0 - 3000,
      finishedAt: T0 - 2000,
      finishReason: "user",
      answers: { "22": ["A", "C"] },
      pins: {},
      highlights: [],
      committedAt: T0 - 1900,
    },
  ],
  results: [
    {
      schema: 1,
      attemptId: RID(1),
      keyRevision: 1,
      rulesVersion: 1,
      checkedAt: T0 - 4800,
      outcomes: { "1": "correct", "2": "unanswered" },
      signals: { "7": [{ code: "notFromPassage" }] },
      score: { kind: "practiceRawScore", marks: 1, positions: 40 },
    },
  ],
  firstTry: [{ schema: 1, testId: "demo-academic-1", firstTry: "unknown" }],
};
const readingEntries: Record<string, string> = {
  "reading:demo-academic-1": JSON.stringify({
    schema: 1,
    session: {
      sessionId: RID(3),
      testId: "demo-academic-1",
      status: "inProgress",
    },
  }),
  "reading:demo-academic-1:retry": JSON.stringify({ schema: 1, session: {} }),
  "reading:demo-academic-2:finished": JSON.stringify({
    schema: 1,
    session: { testId: "demo-academic-2", status: "finished" },
  }),
};

/** Creates Reading's database exactly as ADR-0009 §2 lays it out, with records. */
function seedReading(factory: IDBFactory): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = factory.open("ielts-prep-reading", 1);
    open.onupgradeneeded = () => {
      const db = open.result;
      db.createObjectStore("attempts", { keyPath: "id" }).createIndex(
        "testId",
        "testId",
      );
      db.createObjectStore("results", {
        keyPath: ["attemptId", "keyRevision", "rulesVersion"],
      }).createIndex("attemptId", "attemptId");
      db.createObjectStore("firstTry", { keyPath: "testId" });
    };
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(
        ["attempts", "results", "firstTry"],
        "readwrite",
      );
      for (const [store, records] of Object.entries(readingRecords))
        for (const r of records) tx.objectStore(store).add(r);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
    open.onerror = () => reject(open.error);
  });
}

/** Everything in Reading's database: its version, stores and records. */
function dumpReading(factory: IDBFactory) {
  return new Promise<{ version: number; stores: Record<string, unknown[]> }>(
    (resolve, reject) => {
      const open = factory.open("ielts-prep-reading");
      open.onsuccess = () => {
        const db = open.result;
        const names = [...db.objectStoreNames];
        const tx = db.transaction(names, "readonly");
        const stores: Record<string, unknown[]> = {};
        for (const name of names) {
          const req = tx.objectStore(name).getAll();
          req.onsuccess = () => (stores[name] = req.result);
        }
        tx.oncomplete = () => {
          db.close();
          resolve({ version: db.version, stores });
        };
      };
      open.onerror = () => reject(open.error);
    },
  );
}

describe("Reading's storage during Listening activity", () => {
  it("keeps every Reading record, its database and its localStorage entries exactly as they were", async () => {
    const factory = new IDBFactory();
    await seedReading(factory);
    const before = await dumpReading(factory);
    const storage = memoryStorage();
    for (const [k, v] of Object.entries(readingEntries)) storage.setItem(k, v);

    const { tabA, tabB } = await twoTabs(factory);
    storage.setItem(LEGACY, envelope(finished(1, "here", T0 + 60_000)));
    await Promise.all([
      settleStoredSessions(storage, tabA, test, T0 + 1),
      settleStoredSessions(storage, tabB, test, T0 + 2),
    ]);
    const attempt = await commitFinishedSession(
      storage,
      tabB,
      test,
      finished(2, "there", T0 + 70_000),
      T0 + 3,
    );
    await recordResult(tabA, test, key, transcript, attempt!, T0 + 4);

    expect(await dumpReading(factory)).toEqual(before);
    expect(before.version).toBe(1);
    expect(before.stores.attempts).toHaveLength(3);
    for (const [k, v] of Object.entries(readingEntries))
      expect(storage.getItem(k)).toBe(v);
    expect((await tabA.read(test)).attempts).toHaveLength(2);
  });
});
