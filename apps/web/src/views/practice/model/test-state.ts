import type {
  Mode,
  PracticeRawScore,
  ReadingAttempt,
  ReadingSession,
  ResultRecord,
} from "@/entities/reading";

/** Where a learner stands with one test on this device (USER_FLOWS.md, Practice Hub (M6)). */
export type TestState =
  | { kind: "notStarted" }
  | { kind: "inProgress"; mode: Mode }
  /** `score`: the latest stored practice score, when its results were shown once. */
  | { kind: "finished"; score?: PracticeRawScore };

/**
 * A session in progress wins (the learner is in the middle of it); otherwise
 * a finished test attempt, or a finished session not committed yet, makes the
 * test finished; retries never count. Nothing here reads or writes storage.
 */
export function testState(
  current: ReadingSession | undefined,
  attempts: readonly ReadingAttempt[],
  latestTestRecord: ResultRecord | undefined,
): TestState {
  if (current?.status === "inProgress")
    return { kind: "inProgress", mode: current.mode };
  const finished =
    current?.status === "finished" || attempts.some((a) => a.kind === "test");
  if (!finished) return { kind: "notStarted" };
  return latestTestRecord
    ? { kind: "finished", score: latestTestRecord.score }
    : { kind: "finished" };
}
