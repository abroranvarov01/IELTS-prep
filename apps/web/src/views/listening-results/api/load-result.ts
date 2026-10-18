import {
  type Correction,
  LISTENING_SCORING_RULES_VERSION,
  type ListeningAttempt,
  type ListeningKey,
  type ListeningTest,
  type PatternsView,
  type ResultRecord,
  type Transcript,
  UNKNOWN_FIRST_TRY,
  attemptFromSession,
  checkAttempt,
  currentResult,
  deviceHistory,
  latestRecord,
  loadSessions,
  patternsView,
  recordResult,
  settleStoredSessions,
} from "@/entities/listening";
import { deviceStorage } from "@/shared/lib/device-storage";

/** The result the page shows for an attempt (LISTENING_EXPERIENCE.md, Results page (M9)). */
export type Loaded =
  | { kind: "none" }
  | {
      kind: "result";
      attempt: ListeningAttempt;
      record: ResultRecord;
      correction?: Correction;
      /** False when the result lives only in this tab (ADR-0009 §9). */
      saved: boolean;
      /** "Mistakes that repeated": test attempts only, never a retry. */
      patterns?: PatternsView;
    }
  | {
      kind: "earlierVersion";
      attempt: ListeningAttempt;
      record?: ResultRecord;
    };

/**
 * Finds the attempt (the one asked for, or the latest test attempt), settles what the
 * device holds, and makes sure the attempt has a result record for the
 * current key revision and rules version (ADR-0014 §3, ADR-0009 §7).
 */
export async function loadResult(
  test: ListeningTest,
  key: ListeningKey,
  transcript: Transcript,
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
    () => [] as ListeningAttempt[],
  );
  const { finished, retry } = loadSessions(storage, test);
  const uncommitted = [finished, retry].flatMap((left) =>
    left?.status === "finished" &&
    !attempts.some((a) => a.id === left.sessionId)
      ? (attemptFromSession(left, now) ?? [])
      : [],
  );
  const all = [...attempts, ...uncommitted];
  const tests = all.filter((a) => a.kind === "test");
  const attempt = attemptId
    ? all.find((a) => a.id === attemptId)
    : tests[tests.length - 1];
  if (!attempt) return { kind: "none" };

  const committed = !uncommitted.includes(attempt);
  if (attempt.testVersion !== test.version) {
    const records = committed
      ? await history.results(test, attempt).catch(() => [])
      : [];
    return { kind: "earlierVersion", attempt, record: latestRecord(records) };
  }

  const pair = {
    keyRevision: key.revision,
    rulesVersion: LISTENING_SCORING_RULES_VERSION,
  };
  const records = committed
    ? await recordResult(history, test, key, transcript, attempt, now).catch(
        () => [],
      )
    : [];
  const shown = currentResult(records, pair);
  // Not stored: checked for this tab only.
  const result = shown ?? {
    record: checked(test, key, transcript, attempt, now),
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
        transcript,
        attempt,
        result.record,
        all,
        now,
      ),
    }),
  };
}

/** A record for the current pair, checked for this tab only. */
function checked(
  test: ListeningTest,
  key: ListeningKey,
  transcript: Transcript,
  attempt: ListeningAttempt,
  now: number,
): ResultRecord {
  return {
    attemptId: attempt.id,
    keyRevision: key.revision,
    rulesVersion: LISTENING_SCORING_RULES_VERSION,
    checkedAt: now,
    ...checkAttempt(test, key, transcript, {
      answers: attempt.answers,
      mode: attempt.mode,
      finishReason: attempt.finishReason,
      ...(attempt.questions && { questions: attempt.questions }),
      ...(attempt.exam?.playedToMs && {
        playedToMs: attempt.exam.playedToMs,
      }),
    }),
  };
}

/**
 * Repeated mistakes come from the test's first try only (ADR-0014 §3, as
 * ADR-0009 §5, §7): its marker, and its record for the current pair, written
 * first if needed.
 */
async function firstTryPatterns(
  history: Awaited<ReturnType<typeof deviceHistory>>,
  test: ListeningTest,
  key: ListeningKey,
  transcript: Transcript,
  shown: ListeningAttempt,
  shownRecord: ResultRecord,
  attempts: ListeningAttempt[],
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
  const records = await recordResult(
    history,
    test,
    key,
    transcript,
    first,
    now,
  ).catch(() => []);
  return patternsView(test, key, shown.id, {
    attempt: first,
    record:
      currentResult(records, {
        keyRevision: key.revision,
        rulesVersion: LISTENING_SCORING_RULES_VERSION,
      })?.record ?? checked(test, key, transcript, first, now),
  });
}
