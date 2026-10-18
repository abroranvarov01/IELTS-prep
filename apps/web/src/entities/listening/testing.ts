// Test-only entry point: a parsed fixture test with every question type (ADR-0010).
import { fixtureTest } from "./model/listening-test.fixture";
import { parseListeningTest } from "./model/parse-content";

const parsed = parseListeningTest(fixtureTest());
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));

export const fixtureListeningTest = parsed.value;
