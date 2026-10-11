import demoAcademic1En from "../../content/reading/demo-academic-1.explanations.en.json";
import demoAcademic1Ru from "../../content/reading/demo-academic-1.explanations.ru.json";
import demoAcademic1Uz from "../../content/reading/demo-academic-1.explanations.uz.json";
import {
  type Explanations,
  parseExplanations,
} from "@/domain/reading/explanations";
import { readingTest } from "./reading-content";

// The explanations shipped with each Reading test, one file per interface
// language (ADR-0008 §5), validated when this module loads, so an invalid
// file fails the build. Only the results and review pages use them, and they
// pass one language's file to the browser.
const FILES: Record<string, Record<string, unknown>> = {
  "demo-academic-1": {
    en: demoAcademic1En,
    ru: demoAcademic1Ru,
    uz: demoAcademic1Uz,
  },
};

const EXPLANATIONS = new Map(
  Object.entries(FILES).flatMap(([testId, byLocale]) => {
    const test = readingTest(testId);
    if (!test) throw new Error(`Explanations for unknown test "${testId}"`);
    return Object.entries(byLocale).map(([locale, json]) => {
      const parsed = parseExplanations(test, json, locale);
      if (!parsed.ok)
        throw new Error(
          `Explanations "${testId}" (${locale}) are invalid:\n${parsed.errors.join("\n")}`,
        );
      return [`${testId}:${locale}`, parsed.value] as const;
    });
  }),
);

/** A test's explanations in one interface language. */
export function readingExplanations(
  testId: string,
  locale: string,
): Explanations | undefined {
  return EXPLANATIONS.get(`${testId}:${locale}`);
}
