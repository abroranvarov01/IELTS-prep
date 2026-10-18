import formA from "../../../content/level-check/listening/level-check-listening-a.json";
import formAEn from "../../../content/level-check/listening/level-check-listening-a.explanations.en.json";
import formARu from "../../../content/level-check/listening/level-check-listening-a.explanations.ru.json";
import formAUz from "../../../content/level-check/listening/level-check-listening-a.explanations.uz.json";
import formAKey from "../../../content/level-check/listening/level-check-listening-a.key.json";
import formATranscript from "../../../content/level-check/listening/level-check-listening-a.transcript.json";
import type { ListeningKey, ListeningTest, Transcript } from "./model/content";
import { type Explanations, parseExplanations } from "./model/explanations";
import {
  type ContentShape,
  parseListeningKey,
  parseListeningTest,
  parseTranscript,
} from "./model/parse-content";

// The level check's Listening form (ADR-0014 §7, LISTENING_EXPERIENCE.md, The
// level check's Listening section (M9)): a file in the Listening content
// contract with its own shape, validated when this module loads, never
// listed with the Listening tests (content.server.ts). Route files load it;
// only the result and review pages use its key, transcript and explanations.

export const LEVEL_CHECK_LISTENING_FORM_ID = "level-check-listening-a";

/** Two short recordings of 7 questions each (LD19). */
export const LEVEL_CHECK_LISTENING_SHAPE: ContentShape = {
  parts: 2,
  questionsPerPart: 7,
};

function valid<T>(
  what: string,
  result: { ok: true; value: T } | { ok: false; errors: string[] },
): T {
  if (!result.ok)
    throw new Error(
      `Level-check ${what} "${LEVEL_CHECK_LISTENING_FORM_ID}" is invalid:\n${result.errors.join("\n")}`,
    );
  return result.value;
}

const FORM = valid(
  "Listening form",
  parseListeningTest(formA, LEVEL_CHECK_LISTENING_SHAPE),
);
const TRANSCRIPT = valid("transcript", parseTranscript(FORM, formATranscript));
const KEY = valid("key", parseListeningKey(FORM, TRANSCRIPT, formAKey));
const EXPLANATIONS = new Map(
  Object.entries({ en: formAEn, ru: formARu, uz: formAUz }).map(
    ([locale, json]) =>
      [
        locale,
        valid(
          `explanations (${locale})`,
          parseExplanations(FORM, KEY, TRANSCRIPT, json, locale),
        ),
      ] as const,
  ),
);

/** The current Listening form of the level check. */
export function levelCheckListeningForm(): ListeningTest {
  return FORM;
}

/** Its key and the transcript the key was checked against. */
export function levelCheckListeningChecking(): {
  key: ListeningKey;
  transcript: Transcript;
} {
  return { key: KEY, transcript: TRANSCRIPT };
}

export function levelCheckListeningExplanations(
  locale: string,
): Explanations | undefined {
  return EXPLANATIONS.get(locale);
}
