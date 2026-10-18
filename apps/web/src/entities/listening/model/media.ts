import type { ListeningTest } from "./content";

/** Where a test's audio and pictures are served (ADR-0013 §1). */
export function mediaUrl(test: Pick<ListeningTest, "id">, src: string): string {
  return `/media/listening/${test.id}/${src}`;
}

/** The test's whole recording, in bytes: what an Exam downloads first. */
export function audioBytes(test: ListeningTest): number {
  return test.parts.reduce((sum, part) => sum + part.audio.bytes, 0);
}

/** The recording's length in minutes, rounded (the start screen's "about … minutes"). */
export function recordingMinutes(test: ListeningTest): number {
  const ms = test.parts.reduce((sum, part) => sum + part.audio.durationMs, 0);
  return Math.round(ms / 60_000);
}
