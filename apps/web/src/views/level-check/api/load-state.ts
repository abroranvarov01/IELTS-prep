import {
  type Level,
  deviceLevelCheckHistory,
  latestAttempt,
} from "@/entities/level-check";
import {
  type ReadingSession,
  type ReadingTest,
  deviceStorage,
  loadSessions,
} from "@/entities/reading";

/** What this device knows about the Reading section (USER_FLOWS.md, Level check flows). */
export type DeviceState =
  | { kind: "notStarted" }
  | { kind: "inProgress"; session: ReadingSession }
  | {
      kind: "finished";
      finishedAt: number;
      /** The latest record's level; undefined while no result was shown yet. */
      level: Level | "insufficient" | undefined;
    };

/**
 * Reads the device: a section in progress in the form's localStorage entry
 * wins; otherwise the latest finished attempt at the current form in the
 * level-check history (ADR-0011 §2, §3). Reading only, never writing.
 */
export async function loadDeviceState(form: ReadingTest): Promise<DeviceState> {
  const current = loadSessions(deviceStorage(), form).current;
  if (current?.status === "inProgress")
    return { kind: "inProgress", session: current };
  const history = await deviceLevelCheckHistory();
  const attempt = latestAttempt(await history.read("reading"), form);
  if (!attempt) return { kind: "notStarted" };
  const records = await history.results(attempt);
  return {
    kind: "finished",
    finishedAt: attempt.finishedAt,
    level: records.at(-1)?.level,
  };
}
