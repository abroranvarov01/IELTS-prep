import type { KeyValueStore } from "@/shared/lib/device-storage";
import {
  type FirstTry,
  HISTORY_SCHEMA,
  type ListeningAttempt,
  type ResultRecord,
  type StoredRecord,
  UNKNOWN_FIRST_TRY,
  attemptFromSession,
  attemptsToRemove,
  firstTryOf,
  firstTryOnCommit,
  parseAttempt,
  parseFirstTry,
  parseResultRecord,
} from "../model/attempts";
import type { ListeningKey, ListeningTest, Transcript } from "../model/content";
import {
  LISTENING_SCORING_RULES_VERSION,
  checkAttempt,
} from "../model/scoring";
import type { ListeningSession } from "../model/session";
import {
  loadSessions,
  removeLegacyFinished,
  removeSession,
  saveSession,
} from "./session-storage";

// Committed Listening attempts, their result records and first-try markers
// live in their own IndexedDB database, in the layout of ADR-0009 (ADR-0014
// §1): Reading's database is never opened here, so no Listening operation
// can touch a Reading record. Every "only if it does not exist yet" decision
// is made inside one read-write transaction, so the first committed attempt,
// the first-try marker and one record per attempt and pair hold across tabs.
// The storage layer follows Reading's (entities/reading/api/history.ts) and
// the level check's, each kept with its own database (ADR-0011, ADR-0014).

const DB_NAME = "ielts-prep-listening";
const DB_VERSION = 1;
const STORES = ["attempts", "results", "firstTry"];

/** The operations one transaction needs; records are returned as stored (untrusted). */
type Transaction = {
  attempt(id: string): Promise<unknown>;
  attemptsOf(testId: string): Promise<unknown[]>;
  writeAttempt(record: object, replace: boolean): Promise<void>;
  deleteAttempt(id: string): Promise<void>;
  firstTry(testId: string): Promise<unknown>;
  writeFirstTry(record: object): Promise<void>;
  result(key: [string, number, number]): Promise<unknown>;
  resultsOf(attemptId: string): Promise<unknown[]>;
  writeResult(record: object, replace: boolean): Promise<void>;
  deleteResultsOf(attemptId: string): Promise<void>;
};

type Backend = {
  run<T>(write: boolean, work: (tx: Transaction) => Promise<T>): Promise<T>;
};

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function indexedDbBackend(db: IDBDatabase): Backend {
  return {
    async run(write, work) {
      const tx = write
        ? db.transaction(STORES, "readwrite", { durability: "strict" })
        : db.transaction(STORES, "readonly");
      const done = new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error ?? new Error("transaction aborted"));
      });
      const store = (name: string) => tx.objectStore(name);
      const save = (name: string, record: object, replace: boolean) =>
        request(
          replace ? store(name).put(record) : store(name).add(record),
        ).then(() => undefined);
      try {
        const value = await work({
          attempt: (id) => request(store("attempts").get(id)),
          attemptsOf: (testId) =>
            request(store("attempts").index("testId").getAll(testId)),
          writeAttempt: (record, replace) => save("attempts", record, replace),
          deleteAttempt: (id) =>
            request(store("attempts").delete(id)).then(() => undefined),
          firstTry: (testId) => request(store("firstTry").get(testId)),
          writeFirstTry: (record) => save("firstTry", record, true),
          result: (key) => request(store("results").get(key)),
          resultsOf: (attemptId) =>
            request(store("results").index("attemptId").getAll(attemptId)),
          writeResult: (record, replace) => save("results", record, replace),
          deleteResultsOf: (attemptId) =>
            request(
              store("results").delete(
                IDBKeyRange.bound([attemptId], [attemptId, []]),
              ),
            ).then(() => undefined),
        });
        await done;
        return value;
      } catch (error) {
        // Nothing of a failed transaction is kept; the caller keeps its source.
        done.catch(() => undefined);
        if (!tx.error) tx.abort();
        throw error;
      }
    },
  };
}

/**
 * The fallback when IndexedDB is unavailable: the same operations in memory
 * for this tab's lifetime (ADR-0009 §9), run one after the other.
 */
function memoryBackend(): Backend {
  const attempts = new Map<string, unknown>();
  const results = new Map<string, unknown>();
  const firstTries = new Map<string, unknown>();
  const resultKey = (key: [string, number, number]) => key.join("|");
  const field = (record: unknown, name: string) =>
    typeof record === "object" && record !== null
      ? (record as Record<string, unknown>)[name]
      : undefined;
  const tx: Transaction = {
    attempt: async (id) => structuredClone(attempts.get(id)),
    attemptsOf: async (testId) =>
      [...attempts.values()]
        .filter((r) => field(r, "testId") === testId)
        .map((r) => structuredClone(r)),
    writeAttempt: async (record) =>
      void attempts.set(String(field(record, "id")), structuredClone(record)),
    deleteAttempt: async (id) => void attempts.delete(id),
    firstTry: async (testId) => structuredClone(firstTries.get(testId)),
    writeFirstTry: async (record) =>
      void firstTries.set(
        String(field(record, "testId")),
        structuredClone(record),
      ),
    result: async (key) => structuredClone(results.get(resultKey(key))),
    resultsOf: async (attemptId) =>
      [...results.values()]
        .filter((r) => field(r, "attemptId") === attemptId)
        .map((r) => structuredClone(r)),
    writeResult: async (record) =>
      void results.set(
        resultKey([
          String(field(record, "attemptId")),
          Number(field(record, "keyRevision")),
          Number(field(record, "rulesVersion")),
        ]),
        structuredClone(record),
      ),
    deleteResultsOf: async (attemptId) => {
      for (const [key, record] of results)
        if (field(record, "attemptId") === attemptId) results.delete(key);
    },
  };
  let queue: Promise<unknown> = Promise.resolve();
  return {
    run(_write, work) {
      const next = queue.then(() => work(tx));
      queue = next.catch(() => undefined);
      return next;
    },
  };
}

export type History = {
  /** False when IndexedDB is unavailable and the history lives in memory for this tab. */
  persistent: boolean;
  /**
   * Commits a finished session as an attempt (ADR-0009 §4): keeps an attempt
   * already committed with its id unchanged, decides the first-try marker and
   * applies retention, all in one transaction. Returns the committed attempt
   * with this id (this one or the earlier one), or undefined when a record of
   * an unknown schema holds the id.
   */
  commit(
    test: ListeningTest,
    session: ListeningSession,
    now: number,
  ): Promise<ListeningAttempt | undefined>;
  /** Imports M8's finished session (ADR-0014 §5); true when its entry may be removed. */
  importM8Finished(
    test: ListeningTest,
    session: ListeningSession,
    now: number,
  ): Promise<boolean>;
  /** The test's committed attempts, oldest first, and its first try. */
  read(test: ListeningTest): Promise<{
    attempts: ListeningAttempt[];
    firstTry: FirstTry | undefined;
  }>;
  /**
   * Adds a result record unless one exists for its attempt, key revision and
   * rules version (ADR-0009 §7); returns the stored record.
   */
  addResult(
    test: ListeningTest,
    attempt: ListeningAttempt,
    record: ResultRecord,
  ): Promise<ResultRecord>;
  /** The attempt's result records, oldest first. */
  results(
    test: ListeningTest,
    attempt: ListeningAttempt,
  ): Promise<ResultRecord[]>;
};

/** The history operations on `backend`, IndexedDB or memory. */
function historyOn(backend: Backend, persistent: boolean): History {
  const validAttempts = (records: unknown[], test: ListeningTest) =>
    records.flatMap((r) => {
      const parsed = parseAttempt(r, test);
      return parsed.kind === "valid" ? [parsed.value] : [];
    });
  const markerOf = (raw: unknown, testId: string) =>
    raw === undefined ? undefined : parseFirstTry(raw, testId);

  return {
    persistent,

    commit(test, session, now) {
      const candidate = attemptFromSession(session, now);
      if (!candidate || candidate.testId !== test.id)
        return Promise.resolve(undefined);
      return backend.run(true, async (tx) => {
        const existing = await stored(tx.attempt(candidate.id), (r) =>
          parseAttempt(r, test),
        );
        if (existing?.kind === "valid") return existing.value;
        if (existing?.kind === "unknownSchema") return undefined;

        const records = await tx.attemptsOf(test.id);
        const others = validAttempts(records, test).filter(
          (a) => a.id !== candidate.id,
        );
        const othersCount = records.filter(
          (r) => idOf(r) !== candidate.id,
        ).length;
        const marker = markerOf(await tx.firstTry(test.id), test.id);
        const decided = firstTryOnCommit(marker, candidate, othersCount);

        await tx.writeAttempt(
          { schema: HISTORY_SCHEMA, ...candidate },
          existing !== undefined,
        );
        if (decided !== undefined)
          await tx.writeFirstTry({
            schema: HISTORY_SCHEMA,
            testId: test.id,
            firstTry: decided,
          });
        const firstTryId =
          decided ?? (marker?.kind === "valid" ? marker.value : undefined);
        for (const id of attemptsToRemove([...others, candidate], firstTryId)) {
          await tx.deleteAttempt(id);
          await tx.deleteResultsOf(id);
        }
        return candidate;
      });
    },

    importM8Finished(test, session, now) {
      const candidate = attemptFromSession(session, now, true);
      if (!candidate || candidate.testId !== test.id)
        return Promise.resolve(false);
      return backend.run(true, async (tx) => {
        // The session's own id: a stale tab committing the same session
        // meets the same key, and the first commit is kept (ADR-0014 §5).
        const existing = await stored(tx.attempt(candidate.id), (r) =>
          parseAttempt(r, test),
        );
        if (existing?.kind === "unknownSchema") return false;
        if (existing?.kind !== "valid")
          await tx.writeAttempt(
            { schema: HISTORY_SCHEMA, ...candidate },
            existing !== undefined,
          );
        // M8 kept only its latest finished session, so the first try is unknown.
        const marker = markerOf(await tx.firstTry(test.id), test.id);
        if (marker?.kind !== "unknownSchema")
          await tx.writeFirstTry({
            schema: HISTORY_SCHEMA,
            testId: test.id,
            firstTry: UNKNOWN_FIRST_TRY,
          });
        return true;
      });
    },

    read(test) {
      return backend.run(false, async (tx) => {
        const attempts = validAttempts(await tx.attemptsOf(test.id), test).sort(
          (a, b) => a.startedAt - b.startedAt,
        );
        const marker = markerOf(await tx.firstTry(test.id), test.id);
        return { attempts, firstTry: firstTryOf(marker, attempts) };
      });
    },

    addResult(test, attempt, record) {
      return backend.run(true, async (tx) => {
        const key: [string, number, number] = [
          attempt.id,
          record.keyRevision,
          record.rulesVersion,
        ];
        const existing = await stored(tx.result(key), (r) =>
          parseResultRecord(r, attempt, test),
        );
        if (existing?.kind === "valid") return existing.value;
        if (existing?.kind === "unknownSchema") return record;
        await tx.writeResult(
          { schema: HISTORY_SCHEMA, ...record, attemptId: attempt.id },
          existing !== undefined,
        );
        return record;
      });
    },

    results(test, attempt) {
      return backend.run(false, async (tx) =>
        (await tx.resultsOf(attempt.id))
          .flatMap((r) => {
            const parsed = parseResultRecord(r, attempt, test);
            return parsed.kind === "valid" ? [parsed.value] : [];
          })
          .sort((a, b) => a.checkedAt - b.checkedAt),
      );
    },
  };
}

function idOf(record: unknown): unknown {
  return typeof record === "object" && record !== null
    ? (record as Record<string, unknown>).id
    : undefined;
}

/** A stored record, parsed; undefined when nothing is stored. */
async function stored<T>(
  record: Promise<unknown>,
  parse: (raw: unknown) => StoredRecord<T>,
): Promise<StoredRecord<T> | undefined> {
  const raw = await record;
  return raw === undefined ? undefined : parse(raw);
}

function openDatabase(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = factory.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      const attempts = db.createObjectStore("attempts", { keyPath: "id" });
      attempts.createIndex("testId", "testId");
      const results = db.createObjectStore("results", {
        keyPath: ["attemptId", "keyRevision", "rulesVersion"],
      });
      results.createIndex("attemptId", "attemptId");
      db.createObjectStore("firstTry", { keyPath: "testId" });
    };
    req.onsuccess = () => {
      const db = req.result;
      // Let a newer version of the app upgrade the database in another tab.
      db.onversionchange = () => db.close();
      resolve(db);
    };
    // A database newer than this app (VersionError) is never touched.
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("the database is blocked"));
  });
}

/**
 * The history in IndexedDB, or in memory for this tab when IndexedDB is
 * missing, blocked or newer than this app (ADR-0009 §9).
 */
export async function openHistory(
  factory: IDBFactory | undefined,
): Promise<History> {
  if (factory) {
    try {
      return historyOn(indexedDbBackend(await openDatabase(factory)), true);
    } catch {
      // Unavailable: fall through to memory, never deleting or downgrading.
    }
  }
  return historyOn(memoryBackend(), false);
}

let deviceHistoryPromise: Promise<History> | undefined;

/** This browser's Listening history, opened once per page load. */
export function deviceHistory(): Promise<History> {
  deviceHistoryPromise ??= openHistory(
    typeof indexedDB === "undefined" ? undefined : indexedDB,
  );
  return deviceHistoryPromise;
}

/**
 * Commits a finished session (ADR-0014 §3, as ADR-0009 §4): its localStorage
 * copy is written first and removed only after a persistent commit of an
 * attempt with its id. Returns the committed attempt, or undefined when it
 * could not be committed (the copy then stays, and the next load tries again).
 */
export async function commitFinishedSession(
  storage: KeyValueStore | undefined,
  history: History,
  test: ListeningTest,
  session: ListeningSession,
  now: number,
): Promise<ListeningAttempt | undefined> {
  saveSession(storage, test, session);
  let committed: ListeningAttempt | undefined;
  try {
    committed = await history.commit(test, session, now);
  } catch {
    // The transaction committed nothing; the localStorage copy is the source.
    return undefined;
  }
  if (committed && history.persistent) removeSession(storage, test, session);
  return committed;
}

/**
 * Settles what a page load finds in localStorage (ADR-0014 §3, §5): imports
 * M8's finished session, commits a finished test or retry session that was
 * not committed yet, and removes an in-progress copy of a session already
 * committed.
 */
export async function settleStoredSessions(
  storage: KeyValueStore | undefined,
  history: History,
  test: ListeningTest,
  now: number,
): Promise<void> {
  const { current, finished, legacyFinished, retry } = loadSessions(
    storage,
    test,
  );
  if (legacyFinished) {
    const imported = await history.importM8Finished(test, legacyFinished, now);
    if (imported && history.persistent) removeLegacyFinished(storage, test.id);
  }
  for (const session of [finished, retry])
    if (session?.status === "finished" && session !== legacyFinished)
      await commitFinishedSession(storage, history, test, session, now);
  for (const session of [current, retry]) {
    if (session?.status !== "inProgress") continue;
    const committed = (await history.read(test)).attempts;
    if (committed.some((a) => a.id === session.sessionId) && history.persistent)
      removeSession(storage, test, session);
  }
}

/**
 * The attempt's result records, with one for the current key revision and
 * checking-rules version (ADR-0009 §7): checked from its unchanged answers
 * and added even when nothing differs, unless one exists. The key revision
 * also pins the transcript (ADR-0014 §7). Earlier records stay.
 */
export async function recordResult(
  history: History,
  test: ListeningTest,
  key: ListeningKey,
  transcript: Transcript,
  attempt: ListeningAttempt,
  now: number,
): Promise<ResultRecord[]> {
  const pair = {
    keyRevision: key.revision,
    rulesVersion: LISTENING_SCORING_RULES_VERSION,
  };
  const records = await history.results(test, attempt);
  if (
    records.some(
      (r) =>
        r.keyRevision === pair.keyRevision &&
        r.rulesVersion === pair.rulesVersion,
    )
  )
    return records;
  const stored = await history.addResult(test, attempt, {
    attemptId: attempt.id,
    ...pair,
    checkedAt: now,
    ...checkAttempt(test, key, transcript, {
      answers: attempt.answers,
      mode: attempt.mode,
      finishReason: attempt.finishReason,
      ...(attempt.questions && { questions: attempt.questions }),
      ...(attempt.exam?.playedToMs && { playedToMs: attempt.exam.playedToMs }),
    }),
  });
  return [...records, stored];
}
