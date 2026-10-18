import formA from "../../../content/level-check/level-check-reading-a.json";
import formAKey from "../../../content/level-check/level-check-reading-a.key.json";
import formAEn from "../../../content/level-check/level-check-reading-a.explanations.en.json";
import formARu from "../../../content/level-check/level-check-reading-a.explanations.ru.json";
import formAUz from "../../../content/level-check/level-check-reading-a.explanations.uz.json";
import type { ReadingTest } from "./model/content";
import { type Explanations, parseExplanations } from "./model/explanations";
import {
  type AnswerKey,
  type ContentShape,
  parseAnswerKey,
  parseReadingTest,
} from "./model/parse-content";

// The level check's Reading form (ADR-0011 §1): a file in the Reading content
// contract with its own shape, validated when this module loads, never listed
// in the Reading catalog (content.server.ts). Route files load it; only the
// result and review pages load its key and explanations (ADR-0008 §2).

export const LEVEL_CHECK_FORM_ID = "level-check-reading-a";

/** Two short passages and 14 questions (LEVEL_CHECK.md §3, D2). */
export const LEVEL_CHECK_FORM_SHAPE: ContentShape = {
  passages: 2,
  questions: 14,
};

function parsed(): ReadingTest {
  const result = parseReadingTest(formA, LEVEL_CHECK_FORM_SHAPE);
  if (!result.ok)
    throw new Error(
      `Level-check form "${LEVEL_CHECK_FORM_ID}" is invalid:\n${result.errors.join("\n")}`,
    );
  return result.value;
}

const FORM = parsed();

const KEY = (() => {
  const result = parseAnswerKey(FORM, formAKey);
  if (!result.ok)
    throw new Error(
      `Level-check key "${LEVEL_CHECK_FORM_ID}" is invalid:\n${result.errors.join("\n")}`,
    );
  return result.value;
})();

const EXPLANATIONS = new Map(
  Object.entries({ en: formAEn, ru: formARu, uz: formAUz }).map(
    ([locale, json]) => {
      const result = parseExplanations(FORM, json, locale);
      if (!result.ok)
        throw new Error(
          `Level-check explanations "${LEVEL_CHECK_FORM_ID}" (${locale}) are invalid:\n${result.errors.join("\n")}`,
        );
      return [locale, result.value] as const;
    },
  ),
);

/** The current Reading form of the level check. */
export function levelCheckForm(): ReadingTest {
  return FORM;
}

export function levelCheckKey(): AnswerKey {
  return KEY;
}

export function levelCheckExplanations(
  locale: string,
): Explanations | undefined {
  return EXPLANATIONS.get(locale);
}
