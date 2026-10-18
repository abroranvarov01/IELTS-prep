import temporaryVoa1Key from "../../../../content/listening/temporary-voa-1.key.json";
import temporaryVoa1Transcript from "../../../../content/listening/temporary-voa-1.transcript.json";
import type { ListeningKey, Transcript } from "../model/content";
import { parseListeningKey, parseTranscript } from "../model/parse-content";
import { listeningTest } from "./content.server";

// The answer keys and transcripts of the Listening tests (ADR-0012 §4, §5),
// validated against their tests when this module loads, so an invalid file
// fails the build. Only the results and review pages import this module
// (ADR-0014 §6): the test screen never carries a key or a transcript.
const FILES: Record<string, { key: unknown; transcript: unknown }> = {
  "temporary-voa-1": {
    key: temporaryVoa1Key,
    transcript: temporaryVoa1Transcript,
  },
};

const CHECKING = new Map(
  Object.entries(FILES).map(([testId, files]) => {
    const test = listeningTest(testId);
    if (!test) throw new Error(`Answer key for unknown test "${testId}"`);
    const transcript = parseTranscript(test, files.transcript);
    if (!transcript.ok)
      throw new Error(
        `Transcript "${testId}" is invalid:\n${transcript.errors.join("\n")}`,
      );
    const key = parseListeningKey(test, transcript.value, files.key);
    if (!key.ok)
      throw new Error(
        `Answer key "${testId}" is invalid:\n${key.errors.join("\n")}`,
      );
    return [testId, { key: key.value, transcript: transcript.value }] as const;
  }),
);

/** The key and the transcript it was checked against. */
export function listeningChecking(
  testId: string,
): { key: ListeningKey; transcript: Transcript } | undefined {
  return CHECKING.get(testId);
}
