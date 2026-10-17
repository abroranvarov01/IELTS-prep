import {
  type AnswerKey,
  type Correction,
  type PatternsView,
  type ReadingAttempt,
  type ReadingTest,
  type ResultRecord,
  SCORING_RULES_VERSION,
  UNKNOWN_FIRST_TRY,
  attemptFromSession,
  checkAttempt,
  currentResult,
  deviceHistory,
  deviceStorage,
  latestRecord,
  loadSessions,
  patternsView,
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
      /** "Mistakes that repeated": test attempts only, never a retry. */
      patterns?: PatternsView;
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
  // Not stored: checked for this tab only.
  const result = shown ?? {
    record: {
      attemptId: attempt.id,
      ...pair,
      checkedAt: now,
      ...checkAttempt(test, key, attempt),
    },
  };
  return {
    kind: "result",
    attempt,
    ...result,
    saved: Boolean(shown) && history.persistent,
    ...(attempt.kind === "test" && {
      patterns: await firstTryPatterns(
        history,
        test,
        key,
        attempt,
        result.record,
        all,
        now,
      ),
    }),
  };
}

/**
 * Repeated mistakes come from the test's first try only (ADR-0009 §5, §7):
 * its marker, and its record for the current pair, written first if needed.
 */
async function firstTryPatterns(
  history: Awaited<ReturnType<typeof deviceHistory>>,
  test: ReadingTest,
  key: AnswerKey,
  shown: ReadingAttempt,
  shownRecord: ResultRecord,
  attempts: ReadingAttempt[],
  now: number,
): Promise<PatternsView> {
  const firstTry = await history.read(test).then(
    (h) => h.firstTry,
    () => undefined,
  );
  if (!firstTry || firstTry === UNKNOWN_FIRST_TRY)
    return patternsView(test, key, shown.id, undefined);
  if (firstTry === shown.id)
    return patternsView(test, key, shown.id, {
      attempt: shown,
      record: shownRecord,
    });
  const first = attempts.find((a) => a.id === firstTry);
  if (!first || first.testVersion !== test.version)
    return patternsView(test, key, shown.id, first && { attempt: first });
  const pair = {
    keyRevision: key.revision,
    rulesVersion: SCORING_RULES_VERSION,
  };
  const records = await recordResult(history, test, key, first, now).catch(
    () => [],
  );
  return patternsView(test, key, shown.id, {
    attempt: first,
    record: currentResult(records, pair)?.record ?? {
      attemptId: first.id,
      ...pair,
      checkedAt: now,
      ...checkAttempt(test, key, first),
    },
  });
}
