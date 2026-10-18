import {
  type Correction,
  LISTENING_SCORING_RULES_VERSION,
  type ListeningAttempt,
  type ListeningKey,
  type ListeningTest,
  type ResultRecord,
  type Transcript,
  attemptFromSession,
  checkAttempt,
  currentResult,
  deviceHistory,
  latestRecord,
  loadSessions,
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
    }
  | {
      kind: "earlierVersion";
      attempt: ListeningAttempt;
      record?: ResultRecord;
    };

/**
 * Finds the attempt (the one asked for, or the latest), settles what the
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
  const left = loadSessions(storage, test).finished;
  const uncommitted =
    left && !attempts.some((a) => a.id === left.sessionId)
      ? attemptFromSession(left, now)
      : undefined;
  const all = uncommitted ? [...attempts, uncommitted] : attempts;
  const attempt = attemptId
    ? all.find((a) => a.id === attemptId)
    : all[all.length - 1];
  if (!attempt) return { kind: "none" };

  const committed = attempt !== uncommitted;
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
    record: {
      attemptId: attempt.id,
      ...pair,
      checkedAt: now,
      ...checkAttempt(test, key, transcript, {
        answers: attempt.answers,
        mode: attempt.mode,
        finishReason: attempt.finishReason,
        ...(attempt.exam?.playedToMs && {
          playedToMs: attempt.exam.playedToMs,
        }),
      }),
    },
  };
  return {
    kind: "result",
    attempt,
    ...result,
    saved: Boolean(shown) && history.persistent,
  };
}
