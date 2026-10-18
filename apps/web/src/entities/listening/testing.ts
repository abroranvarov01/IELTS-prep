// Test-only entry point: a parsed fixture test with every question type, its
// transcript and its answer key (ADR-0010).
import {
  fixtureKey,
  fixtureTest,
  fixtureTranscript,
} from "./model/listening-test.fixture";
import {
  parseListeningKey,
  parseListeningTest,
  parseTranscript,
} from "./model/parse-content";

function parsed<T>(
  result: { ok: true; value: T } | { ok: false; errors: string[] },
): T {
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
}

export const fixtureListeningTest = parsed(parseListeningTest(fixtureTest()));
export const fixtureListeningTranscript = parsed(
  parseTranscript(fixtureListeningTest, fixtureTranscript()),
);
export const fixtureListeningKey = parsed(
  parseListeningKey(
    fixtureListeningTest,
    fixtureListeningTranscript,
    fixtureKey(),
  ),
);
