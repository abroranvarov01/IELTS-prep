import temporaryVoa1 from "../../../../content/listening/temporary-voa-1.json";
import type { ListeningTest } from "../model/content";
import { parseListeningTest } from "../model/parse-content";

// The Listening tests shipped with the app (ADR-0012), validated when this
// module loads, so an invalid file fails the build. Transcripts and keys are
// never loaded by the test pages (ADR-0012 §4, §5).
const FILES: Record<string, unknown> = {
  "temporary-voa-1": temporaryVoa1,
};

const TESTS = new Map(
  Object.entries(FILES).map(([id, json]) => {
    const parsed = parseListeningTest(json);
    if (!parsed.ok)
      throw new Error(
        `Listening test "${id}" is invalid:\n${parsed.errors.join("\n")}`,
      );
    return [id, parsed.value] as const;
  }),
);

export function listeningTestIds(): string[] {
  return [...TESTS.keys()];
}

export function listeningTest(id: string): ListeningTest | undefined {
  return TESTS.get(id);
}
