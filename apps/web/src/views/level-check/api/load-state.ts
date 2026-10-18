import {
  type Skill,
  deviceLevelCheckHistory,
  latestAttempt,
} from "@/entities/level-check";
import {
  type ListeningTest,
  answeredNumbers as listeningAnswered,
  loadSessions as loadListeningSessions,
} from "@/entities/listening";
import {
  type ReadingTest,
  answeredNumbers,
  deviceStorage,
  loadSessions,
} from "@/entities/reading";

/** What this device knows about a section (USER_FLOWS.md, The level check with two sections). */
export type DeviceState =
  | { kind: "notStarted" }
  | { kind: "inProgress"; answered: number }
  | { kind: "finished"; finishedAt: number };

/**
 * Reads the device for both sections: a section in progress in its form's
 * localStorage entry wins; otherwise the latest finished attempt at the
 * current form in the level-check history (ADR-0011 §2, §3; ADR-0014 §7).
 * Reading only, never writing.
 */
export async function loadDeviceStates(
  reading: ReadingTest,
  listening: ListeningTest,
): Promise<Record<Skill, DeviceState>> {
  const storage = deviceStorage();
  const readingSession = loadSessions(storage, reading).current;
  const listeningSession = loadListeningSessions(storage, listening).current;
  const history = await deviceLevelCheckHistory();
  const finished = async (
    skill: Skill,
    form: { id: string; version: number },
  ): Promise<DeviceState> => {
    const attempt = latestAttempt(await history.read(skill), form);
    return attempt
      ? { kind: "finished", finishedAt: attempt.finishedAt }
      : { kind: "notStarted" };
  };
  return {
    reading:
      readingSession?.status === "inProgress"
        ? {
            kind: "inProgress",
            answered: answeredNumbers(readingSession, reading).size,
          }
        : await finished("reading", reading),
    listening: listeningSession?.check
      ? {
          kind: "inProgress",
          answered: listeningAnswered(listeningSession, listening).size,
        }
      : await finished("listening", listening),
  };
}
