import enTemporaryVoa1 from "../../../../content/listening/temporary-voa-1.explanations.en.json";
import ruTemporaryVoa1 from "../../../../content/listening/temporary-voa-1.explanations.ru.json";
import uzTemporaryVoa1 from "../../../../content/listening/temporary-voa-1.explanations.uz.json";
import { type Explanations, parseExplanations } from "../model/explanations";
import { listeningTest } from "./content.server";
import { listeningChecking } from "./keys.server";

// The pre-written explanations of the Listening tests, one file per
// interface language (ADR-0014 §7), validated when this module loads. Only
// the review page imports this module, with the active locale's file.
const FILES: Record<string, Record<string, unknown>> = {
  "temporary-voa-1": {
    en: enTemporaryVoa1,
    ru: ruTemporaryVoa1,
    uz: uzTemporaryVoa1,
  },
};

const EXPLANATIONS = new Map(
  Object.entries(FILES).flatMap(([testId, byLocale]) => {
    const test = listeningTest(testId);
    const checking = listeningChecking(testId);
    if (!test || !checking)
      throw new Error(`Explanations for unknown test "${testId}"`);
    return Object.entries(byLocale).map(([locale, json]) => {
      const parsed = parseExplanations(
        test,
        checking.key,
        checking.transcript,
        json,
        locale,
      );
      if (!parsed.ok)
        throw new Error(
          `Explanations "${testId}" (${locale}) are invalid:\n${parsed.errors.join("\n")}`,
        );
      return [`${testId}:${locale}`, parsed.value] as const;
    });
  }),
);

export function listeningExplanations(
  testId: string,
  locale: string,
): Explanations | undefined {
  return EXPLANATIONS.get(`${testId}:${locale}`);
}
