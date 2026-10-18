import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import {
  type FinishedSection,
  type LevelCheckAttempt,
  type LevelCheckResultRecord,
} from "../model/records";
import { type LevelCheckHistory, openLevelCheckHistory } from "./history";

// Two connections to one database stand in for two tabs: IndexedDB runs
// their overlapping read-write transactions one after the other, as browsers
// do across tabs (ADR-0011 §3, as ADR-0009 §11).

const T0 = Date.UTC(2026, 9, 18, 9, 0);
const id = (n: number) =>
  `s-00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

function section(
  n: number,
  answers: FinishedSection["answers"] = { "1": "TRUE" },
): FinishedSection {
  return {
    id: id(n),
    skill: "reading",
    formId: "level-check-reading-a",
    formVersion: 1,
    startedAt: T0 + n * 60_000,
    finishedAt: T0 + n * 60_000 + 600_000,
    answers,
  };
}

function record(
  a: LevelCheckAttempt,
  versions: Partial<
    Pick<
      LevelCheckResultRecord,
      "keyRevision" | "rulesVersion" | "levelRulesVersion"
    >
  > = {},
  level: LevelCheckResultRecord["level"] = 2,
): LevelCheckResultRecord {
  return {
    attemptId: a.id,
    keyRevision: 1,
    rulesVersion: 1,
    levelRulesVersion: 1,
    ...versions,
    checkedAt: T0 + 2_000_000,
    outcomes: { 1: "correct", 2: "incorrect" },
    score: 1,
    total: 2,
    answered: 2,
    level,
    practiseFirst: [],
  };
}

async function twoTabs() {
  const factory = new IDBFactory();
  return {
    factory,
    tabA: await openLevelCheckHistory(factory),
    tabB: await openLevelCheckHistory(factory),
  };
}

describe("committing a finished section", () => {
  it("keeps the first committed attempt when two tabs commit the same session", async () => {
    const { tabA, tabB } = await twoTabs();
    const [a, b] = await Promise.all([
      tabA.commit(section(1, { "1": "TRUE" }), T0 + 1),
      tabB.commit(section(1, { "1": "FALSE" }), T0 + 2),
    ]);
    expect(a).toEqual(b);
    const attempts = await tabB.read("reading");
    expect(attempts).toHaveLength(1);
    expect(attempts[0]?.committedAt).toBe(T0 + 1);
    expect(attempts[0]?.answers).toEqual({ "1": "TRUE" });
  });

  it("records the time taken and reads attempts oldest first", async () => {
    const { tabA } = await twoTabs();
    await tabA.commit(section(2), T0);
    await tabA.commit(section(1), T0);
    const attempts = await tabA.read("reading");
    expect(attempts.map((a) => a.id)).toEqual([id(1), id(2)]);
    expect(attempts[0]?.timeTakenMs).toBe(600_000);
    expect(await tabA.read("listening")).toEqual([]);
  });

  it("keeps at most ten attempts per skill, removing the oldest with their results", async () => {
    const { tabA } = await twoTabs();
    const first = await tabA.commit(section(1), T0);
    if (!first) throw new Error("not committed");
    await tabA.addResult(first, record(first));
    for (let n = 2; n <= 11; n++) await tabA.commit(section(n), T0);
    const attempts = await tabA.read("reading");
    expect(attempts).toHaveLength(10);
    expect(attempts.map((a) => a.id)).not.toContain(id(1));
    expect(await tabA.results(first)).toEqual([]);
  });

  it("never touches a record of a newer schema with the same id", async () => {
    const { factory, tabA } = await twoTabs();
    await rawPut(factory, "ielts-prep-level-check", "attempts", {
      schema: 2,
      id: id(1),
      skill: "reading",
      future: true,
    });
    expect(await tabA.commit(section(1), T0)).toBeUndefined();
    expect(
      await rawGet(factory, "ielts-prep-level-check", "attempts", id(1)),
    ).toMatchObject({ schema: 2, future: true });
  });
});

describe("result records", () => {
  it("adds one record per attempt and version triple, whichever tab is first, and keeps earlier triples", async () => {
    const { tabA, tabB } = await twoTabs();
    const a = await tabA.commit(section(1), T0);
    if (!a) throw new Error("not committed");
    const [x, y] = await Promise.all([
      tabA.addResult(a, record(a, {}, 2)),
      tabB.addResult(a, record(a, {}, 3)),
    ]);
    expect(x.level).toBe(2);
    expect(y.level).toBe(2);
    await tabB.addResult(a, record(a, { levelRulesVersion: 2 }, 3));
    const records = await tabA.results(a);
    expect(records.map((r) => [r.levelRulesVersion, r.level])).toEqual([
      [1, 2],
      [2, 3],
    ]);
  });
});

describe("unavailable storage", () => {
  it("falls back to memory for the tab when IndexedDB is missing", async () => {
    const history: LevelCheckHistory = await openLevelCheckHistory(undefined);
    expect(history.persistent).toBe(false);
    const a = await history.commit(section(1), T0);
    expect(a?.id).toBe(id(1));
    expect((await history.read("reading")).map((x) => x.id)).toEqual([id(1)]);
  });
});

describe("the Reading history", () => {
  it("is untouched: the level check uses its own database and leaves the Reading one as it was", async () => {
    const factory = new IDBFactory();
    // The Reading database as ADR-0009 creates it, with one attempt in it.
    await new Promise<void>((resolve, reject) => {
      const req = factory.open("ielts-prep-reading", 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore("attempts", { keyPath: "id" }).createIndex(
          "testId",
          "testId",
        );
        db.createObjectStore("results", {
          keyPath: ["attemptId", "keyRevision", "rulesVersion"],
        });
        db.createObjectStore("firstTry", { keyPath: "testId" });
      };
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
    const readingAttempt = { schema: 1, id: id(7), testId: "demo-academic-1" };
    await rawPut(factory, "ielts-prep-reading", "attempts", readingAttempt);

    const history = await openLevelCheckHistory(factory);
    const a = await history.commit(section(1), T0);
    if (!a) throw new Error("not committed");
    await history.addResult(a, record(a));

    const databases = await factory.databases();
    expect(databases.map((d) => [d.name, d.version]).sort()).toEqual([
      ["ielts-prep-level-check", 1],
      ["ielts-prep-reading", 1],
    ]);
    expect(
      await rawGet(factory, "ielts-prep-reading", "attempts", id(7)),
    ).toEqual(readingAttempt);
    expect(
      await rawGet(factory, "ielts-prep-reading", "attempts", id(1)),
    ).toBeUndefined();
  });
});

function rawOpen(factory: IDBFactory, name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = factory.open(name);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function rawPut(
  factory: IDBFactory,
  name: string,
  store: string,
  value: object,
) {
  const db = await rawOpen(factory, name);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function rawGet(
  factory: IDBFactory,
  name: string,
  store: string,
  key: string,
): Promise<unknown> {
  const db = await rawOpen(factory, name);
  const value = await new Promise<unknown>((resolve, reject) => {
    const req = db.transaction(store).objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return value;
}
