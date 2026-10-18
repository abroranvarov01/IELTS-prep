import {
  type FinishedSection,
  HISTORY_SCHEMA,
  type LevelCheckAttempt,
  type LevelCheckResultRecord,
  type Skill,
  type StoredRecord,
  attemptFromSection,
  attemptsToRemove,
  parseLevelCheckAttempt,
  parseLevelCheckResultRecord,
} from "../model/records";

// Committed level-check attempts and their result records live in their own
// IndexedDB database (ADR-0011 §3), apart from the Reading history, so
// neither database's version, retention or transactions can touch the other.
// Every "only if it does not exist yet" decision is made inside one
// read-write transaction, which browsers run one at a time across tabs, so
// the first committed attempt and one record per attempt and version triple
// hold with two tabs open. The section in progress stays in the Reading
// session's localStorage entry (ADR-0011 §2), handled by the page.

const DB_NAME = "ielts-prep-level-check";
const DB_VERSION = 1;
const STORES = ["attempts", "results"];

type ResultKey = [string, number, number, number];

/** The operations one transaction needs; records are returned as stored (untrusted). */
type Transaction = {
  attempt(id: string): Promise<unknown>;
  attemptsOf(skill: Skill): Promise<unknown[]>;
  writeAttempt(record: object, replace: boolean): Promise<void>;
  deleteAttempt(id: string): Promise<void>;
  result(key: ResultKey): Promise<unknown>;
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
          attemptsOf: (skill) =>
            request(store("attempts").index("skill").getAll(skill)),
          writeAttempt: (record, replace) => save("attempts", record, replace),
          deleteAttempt: (id) =>
            request(store("attempts").delete(id)).then(() => undefined),
          result: (key) => request(store("results").get(key)),
          resultsOf: (attemptId) =>
            request(store("results").index("attemptId").getAll(attemptId)),
          writeResult: (record, replace) => save("results", record, replace),
          deleteResultsOf: (attemptId) =>
            request(
              store("results").delete(
                IDBKeyRange.bound([attemptId], [attemptId, [], [], []]),
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

/** The fallback when IndexedDB is unavailable: the same operations in memory for this tab (ADR-0011 §6). */
function memoryBackend(): Backend {
  const attempts = new Map<string, unknown>();
  const results = new Map<string, unknown>();
  const field = (record: unknown, name: string) =>
    typeof record === "object" && record !== null
      ? (record as Record<string, unknown>)[name]
      : undefined;
  const keyOf = (record: unknown): ResultKey => [
    String(field(record, "attemptId")),
    Number(field(record, "keyRevision")),
    Number(field(record, "rulesVersion")),
    Number(field(record, "levelRulesVersion")),
  ];
  const tx: Transaction = {
    attempt: async (id) => structuredClone(attempts.get(id)),
    attemptsOf: async (skill) =>
      [...attempts.values()]
        .filter((r) => field(r, "skill") === skill)
        .map((r) => structuredClone(r)),
    writeAttempt: async (record) =>
      void attempts.set(String(field(record, "id")), structuredClone(record)),
    deleteAttempt: async (id) => void attempts.delete(id),
    result: async (key) => structuredClone(results.get(key.join("|"))),
    resultsOf: async (attemptId) =>
      [...results.values()]
        .filter((r) => field(r, "attemptId") === attemptId)
        .map((r) => structuredClone(r)),
    writeResult: async (record) =>
      void results.set(keyOf(record).join("|"), structuredClone(record)),
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

export type LevelCheckHistory = {
  /** False when IndexedDB is unavailable and the history lives in memory for this tab. */
  persistent: boolean;
  /**
   * Commits a finished section as an attempt (ADR-0011 §3): keeps an attempt
   * already committed with its id unchanged and applies retention, in one
   * transaction. Returns the committed attempt with this id (this one or the
   * earlier one), or undefined when a record of an unknown schema holds it.
   */
  commit(
    section: FinishedSection,
    now: number,
  ): Promise<LevelCheckAttempt | undefined>;
  /** The skill's committed attempts, oldest first. */
  read(skill: Skill): Promise<LevelCheckAttempt[]>;
  /**
   * Adds a result record unless one exists for its attempt and version triple
   * (key revision, checking rules, level rules); returns the stored record.
   */
  addResult(
    attempt: LevelCheckAttempt,
    record: LevelCheckResultRecord,
  ): Promise<LevelCheckResultRecord>;
  /** The attempt's result records, oldest first. */
  results(attempt: LevelCheckAttempt): Promise<LevelCheckResultRecord[]>;
};

function historyOn(backend: Backend, persistent: boolean): LevelCheckHistory {
  const validAttempts = (records: unknown[]) =>
    records.flatMap((r) => {
      const parsed = parseLevelCheckAttempt(r);
      return parsed.kind === "valid" ? [parsed.value] : [];
    });

  return {
    persistent,

    commit(section, now) {
      const candidate = attemptFromSection(section, now);
      return backend.run(true, async (tx) => {
        const existing = await stored(
          tx.attempt(candidate.id),
          parseLevelCheckAttempt,
        );
        if (existing?.kind === "valid") return existing.value;
        if (existing?.kind === "unknownSchema") return undefined;
        const others = validAttempts(await tx.attemptsOf(section.skill)).filter(
          (a) => a.id !== candidate.id,
        );
        await tx.writeAttempt(
          { schema: HISTORY_SCHEMA, ...candidate },
          existing !== undefined,
        );
        for (const id of attemptsToRemove([...others, candidate])) {
          await tx.deleteAttempt(id);
          await tx.deleteResultsOf(id);
        }
        return candidate;
      });
    },

    read(skill) {
      return backend.run(false, async (tx) =>
        validAttempts(await tx.attemptsOf(skill)).sort(
          (a, b) => a.finishedAt - b.finishedAt,
        ),
      );
    },

    addResult(attempt, record) {
      return backend.run(true, async (tx) => {
        const key: ResultKey = [
          attempt.id,
          record.keyRevision,
          record.rulesVersion,
          record.levelRulesVersion,
        ];
        const existing = await stored(tx.result(key), (r) =>
          parseLevelCheckResultRecord(r, attempt),
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

    results(attempt) {
      return backend.run(false, async (tx) =>
        (await tx.resultsOf(attempt.id))
          .flatMap((r) => {
            const parsed = parseLevelCheckResultRecord(r, attempt);
            return parsed.kind === "valid" ? [parsed.value] : [];
          })
          .sort((a, b) => a.checkedAt - b.checkedAt),
      );
    },
  };
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
      attempts.createIndex("skill", "skill");
      const results = db.createObjectStore("results", {
        keyPath: [
          "attemptId",
          "keyRevision",
          "rulesVersion",
          "levelRulesVersion",
        ],
      });
      results.createIndex("attemptId", "attemptId");
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
 * The level-check history in IndexedDB, or in memory for this tab when
 * IndexedDB is missing, blocked or newer than this app (ADR-0011 §6).
 */
export async function openLevelCheckHistory(
  factory: IDBFactory | undefined,
): Promise<LevelCheckHistory> {
  if (factory) {
    try {
      return historyOn(indexedDbBackend(await openDatabase(factory)), true);
    } catch {
      // Unavailable: fall through to memory, never deleting or downgrading.
    }
  }
  return historyOn(memoryBackend(), false);
}

let deviceHistoryPromise: Promise<LevelCheckHistory> | undefined;

/** This browser's level-check history, opened once per page load. */
export function deviceLevelCheckHistory(): Promise<LevelCheckHistory> {
  deviceHistoryPromise ??= openLevelCheckHistory(
    typeof indexedDB === "undefined" ? undefined : indexedDB,
  );
  return deviceHistoryPromise;
}
