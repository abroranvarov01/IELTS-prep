import {
  type AnswerKey,
  type Correction,
  type ReadingAttempt,
  type ReadingTest,
  type ResultRecord,
  SCORING_RULES_VERSION,
  attemptFromSession,
  checkAttempt,
  currentResult,
  deviceHistory,
  deviceStorage,
  latestRecord,
  loadSessions,
  recordResult,
  settleStoredSessions,
} from "@/entities/reading";

/** The result the page shows for an attempt (READING_EXPERIENCE.md, Results page (M5)). */
export type Loaded =
  | { kind: "none" }
  | {
      kind: "result";
      attempt: ReadingAttempt;
      record: ResultRecord;
      correction?: Correction;
      /** False when the result lives only in this tab (ADR-0009 §9). */
      saved: boolean;
    }
  | { kind: "earlierVersion"; attempt: ReadingAttempt; record?: ResultRecord };

/**
 * Finds the attempt (the one asked for, or the latest test attempt), settles
 * what the device holds, and makes sure the attempt has a result record for
 * the current key revision and rules version (ADR-0009 §4, §7).
 */
export async function loadResult(
  test: ReadingTest,
  key: AnswerKey,
  attemptId: string | null,
): Promise<Loaded> {
  const storage = deviceStorage();
  const history = await deviceHistory();
  const now = Date.now();
  try {
    await settleStoredSessions(storage, history, test, now);
  } catch {
    // Not committed: a finished session stays in localStorage, shown below.
  }
  const attempts = await history.read(test).then(
    (h) => h.attempts,
    () => [] as ReadingAttempt[],
  );
  const left = loadSessions(storage, test).current;
  const uncommitted =
    left?.status === "finished" &&
    !attempts.some((a) => a.id === left.sessionId)
      ? attemptFromSession(left, now)
      : undefined;
  const all = uncommitted ? [...attempts, uncommitted] : attempts;
  const tests = all.filter((a) => a.kind === "test");
  const attempt = attemptId
    ? all.find((a) => a.id === attemptId)
    : tests[tests.length - 1];
  if (!attempt) return { kind: "none" };

  const committed = attempt !== uncommitted;
  if (attempt.testVersion !== test.version) {
    const records = committed
      ? await history.results(attempt).catch(() => [])
      : [];
    return { kind: "earlierVersion", attempt, record: latestRecord(records) };
  }

  const pair = {
    keyRevision: key.revision,
    rulesVersion: SCORING_RULES_VERSION,
  };
  const records = committed
    ? await recordResult(history, test, key, attempt, now).catch(() => [])
    : [];
  const shown = currentResult(records, pair);
  if (shown)
    return { kind: "result", attempt, ...shown, saved: history.persistent };
  // Not stored: checked for this tab only.
  return {
    kind: "result",
    attempt,
    record: {
      attemptId: attempt.id,
      ...pair,
      checkedAt: now,
      ...checkAttempt(test, key, attempt),
    },
    saved: false,
  };
}
