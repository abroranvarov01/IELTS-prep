import type { ReadingTest } from "./content";
import {
  type Parsed,
  REVIEW_STATUSES,
  type ReviewStatus,
} from "./parse-content";
import { questionUnits } from "./units";

// Pre-written explanations of a test in one interface language (ADR-0008 §5):
// one item per answer unit, with a simpler version. They are content, not
// interface strings; English words and quotes are marked as English.

/** Plain text in the file's language, or English test words shown with lang="en". */
export type ExplanationSegment = { text: string } | { en: string };

export type ExplanationItem = {
  explanation: ExplanationSegment[];
  simpler: ExplanationSegment[];
};

export type Explanations = {
  testId: string;
  version: number;
  locale: string;
  review: { status: ReviewStatus };
  /** By unit key (the unit's first question number). */
  items: Record<string, ExplanationItem>;
};

/** Authoring limits (READING_EXPERIENCE.md, Explanations and the AI decision (M5)). */
const EXPLANATION_MAX_CHARACTERS = 450;
const SIMPLER_MAX_CHARACTERS = 250;
const ENGLISH_QUOTE_MAX_WORDS = 8;

/** The text a reader sees, for counting characters. */
function segmentsText(segments: ExplanationSegment[]): string {
  return segments.map((s) => ("text" in s ? s.text : s.en)).join("");
}

/**
 * Turns an explanation file into typed explanations of `test` in `locale`,
 * or lists every problem with its path. Like test content, it is untrusted.
 */
export function parseExplanations(
  test: ReadingTest,
  input: unknown,
  locale: string,
): Parsed<Explanations> {
  const errors: string[] = [];
  if (!isRecord(input))
    return { ok: false, errors: ["explanations: expected an object"] };
  if (input.testId !== test.id)
    errors.push(`explanations.testId: expected "${test.id}"`);
  if (input.version !== test.version)
    errors.push(`explanations.version: expected ${test.version}`);
  if (input.locale !== locale)
    errors.push(`explanations.locale: expected "${locale}"`);
  const status = isRecord(input.review) ? input.review.status : undefined;
  if (!REVIEW_STATUSES.includes(status as ReviewStatus))
    errors.push(
      `explanations.review.status: expected one of ${REVIEW_STATUSES.join(", ")}`,
    );

  const items: Record<string, ExplanationItem> = {};
  const raw = isRecord(input.items) ? input.items : undefined;
  if (!raw) errors.push("explanations.items: expected an object");
  const keys = questionUnits(test).map((unit) => unit.key);
  for (const key of keys) {
    const path = `explanations.items.${key}`;
    const item = raw?.[key];
    if (!raw) continue;
    if (!isRecord(item)) {
      errors.push(
        `${path}: ${item === undefined ? "missing" : "expected an object"}`,
      );
      continue;
    }
    const explanation = readSegments(
      errors,
      `${path}.explanation`,
      item.explanation,
      EXPLANATION_MAX_CHARACTERS,
    );
    const simpler = readSegments(
      errors,
      `${path}.simpler`,
      item.simpler,
      SIMPLER_MAX_CHARACTERS,
    );
    if (
      explanation &&
      simpler &&
      characters(simpler) >= characters(explanation)
    )
      errors.push(`${path}.simpler: expected shorter than the explanation`);
    if (explanation && simpler) items[key] = { explanation, simpler };
  }
  for (const key of Object.keys(raw ?? {}))
    if (!keys.includes(key))
      errors.push(`explanations.items.${key}: no such answer unit`);

  return errors.length === 0
    ? {
        ok: true,
        value: {
          testId: test.id,
          version: test.version,
          locale,
          review: { status: status as ReviewStatus },
          items,
        },
      }
    : { ok: false, errors };
}

function readSegments(
  errors: string[],
  path: string,
  value: unknown,
  maxCharacters: number,
): ExplanationSegment[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${path}: expected a list of segments`);
    return undefined;
  }
  const segments: ExplanationSegment[] = [];
  value.forEach((segment, i) => {
    const text = isRecord(segment) ? segment.text : undefined;
    const en = isRecord(segment) ? segment.en : undefined;
    if (typeof text === "string" && en === undefined && text.trim() !== "")
      segments.push({ text });
    else if (typeof en === "string" && text === undefined && en.trim() !== "") {
      if (en.trim().split(/\s+/).length > ENGLISH_QUOTE_MAX_WORDS)
        errors.push(
          `${path}[${i}]: English quotes have at most ${ENGLISH_QUOTE_MAX_WORDS} words`,
        );
      segments.push({ en });
    } else errors.push(`${path}[${i}]: expected { text } or { en }, not empty`);
  });
  if (segments.length !== value.length) return undefined;
  const length = characters(segments);
  if (length > maxCharacters) {
    errors.push(`${path}: ${length} characters, at most ${maxCharacters}`);
    return undefined;
  }
  return segments;
}

/** Characters as a reader counts them (code points, not UTF-16 units). */
function characters(segments: ExplanationSegment[]): number {
  return Array.from(segmentsText(segments)).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
