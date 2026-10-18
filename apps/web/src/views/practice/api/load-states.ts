import {
  type ReadingAttempt,
  type ReadingTest,
  type ResultRecord,
  deviceHistory,
  deviceStorage,
  latestRecord,
  loadSessions,
} from "@/entities/reading";
import { type TestState, testState } from "../model/test-state";

/**
 * Each test's state on this device, read only: the Hub never settles,
 * commits, imports or removes anything (USER_FLOWS.md, Practice Hub (M6)).
 * `readable` is false when the device keeps nothing (storage blocked, or the
 * history only in this tab's memory), and then no state is claimed.
 */
export async function loadStates(
  tests: readonly ReadingTest[],
): Promise<{ readable: boolean; states: Record<string, TestState> }> {
  const storage = deviceStorage();
  const history = await deviceHistory().catch(() => undefined);
  if (!storage || !history?.persistent) return { readable: false, states: {} };

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
  return { readable: true, states };
}
