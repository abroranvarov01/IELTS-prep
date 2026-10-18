import {
  type ReadingAttempt,
  type ReadingTest,
  type ResultRecord,
  deviceHistory,
  deviceStorage,
  latestRecord,
  loadSessions,
} from "@/entities/reading";
import {
  type ListeningTest,
  loadSessions as loadListeningSessions,
} from "@/entities/listening";
import { type TestState, testState } from "../model/test-state";

/** A Listening test on this device: not started, in progress in a mode, or finished (no score until M9). */
export type ListeningState =
  | { kind: "notStarted" }
  | { kind: "inProgress"; mode: "practice" | "exam" }
  | { kind: "finished" };

/**
 * Each test's state on this device, read only: the Hub never settles,
 * commits, imports or removes anything (USER_FLOWS.md, Practice Hub (M6)).
 * `readable` is false when the device keeps nothing (storage blocked, or the
 * history only in this tab's memory), and then no state is claimed.
 */
export async function loadStates(
  tests: readonly ReadingTest[],
  listeningTests: readonly ListeningTest[] = [],
): Promise<{
  readable: boolean;
  states: Record<string, TestState>;
  listening: Record<string, ListeningState>;
}> {
  const storage = deviceStorage();
  const history = await deviceHistory().catch(() => undefined);
  if (!storage || !history?.persistent)
    return { readable: false, states: {}, listening: {} };

  const listening: Record<string, ListeningState> = {};
  for (const test of listeningTests) {
    const { current, finished } = loadListeningSessions(storage, test);
    listening[test.id] = current
      ? { kind: "inProgress", mode: current.mode }
      : finished
        ? { kind: "finished" }
        : { kind: "notStarted" };
  }

  const states: Record<string, TestState> = {};
  for (const test of tests) {
    const attempts = await history.read(test).then(
      (h) => h.attempts,
      () => [] as ReadingAttempt[],
    );
    const latest = attempts.filter((a) => a.kind === "test").at(-1);
    const records = latest
      ? await history.results(latest).catch(() => [] as ResultRecord[])
      : [];
    states[test.id] = testState(
      loadSessions(storage, test).current,
      attempts,
      latestRecord(records),
    );
  }
  return { readable: true, states, listening };
}
