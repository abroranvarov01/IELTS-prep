import { type Parsed, isRecord, readReview } from "@/shared/content/parse";
import type { ReviewStatus } from "@/shared/content/parse";
import type { ListeningKey, ListeningTest, Transcript } from "./content";
import { checkUnits } from "./scoring";

// Pre-written explanations of a Listening test in one interface language
// (ADR-0014 §7, in ADR-0008 §5's format): one item per answer unit, with a
// simpler version. English words and quotes are marked as English, and a
// time is a reference to a transcript segment, shown as its start time.

/**
 * Plain text in the file's language, English test words shown with
 * lang="en", or the start time of one of the unit's evidence segments.
 */
export type ExplanationSegment =
  { text: string } | { en: string } | { at: string };

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

/** Authoring limits, as Reading's (LISTENING_EXPERIENCE.md, Evidence-first review (M9)). */
const EXPLANATION_MAX_CHARACTERS = 450;
const SIMPLER_MAX_CHARACTERS = 250;
const ENGLISH_QUOTE_MAX_WORDS = 8;
/** A time is shown as "m:ss". */
const TIME_CHARACTERS = 4;

/**
 * Turns an explanation file into typed explanations of `test` in `locale`,
 * or lists every problem with its path. A time may point only at an
 * evidence segment of its own unit, so an explanation never states when a
 * mentioned option is said (owner decision LD13).
 */
export function parseExplanations(
  test: ListeningTest,
  key: ListeningKey,
  transcript: Transcript,
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
  const review = readReview(errors, "explanations.review", input.review);

  const segmentIds = new Set(
    transcript.parts.flatMap((p) => p.segments.map((s) => s.id)),
  );
  const items: Record<string, ExplanationItem> = {};
  const raw = isRecord(input.items) ? input.items : undefined;
  if (!raw) errors.push("explanations.items: expected an object");
  const units = checkUnits(test);
  for (const unit of units) {
    const path = `explanations.items.${unit.key}`;
    const item = raw?.[unit.key];
    if (!raw) continue;
    if (!isRecord(item)) {
      errors.push(
        `${path}: ${item === undefined ? "missing" : "expected an object"}`,
      );
      continue;
    }
    const evidence = new Set(
      unit.numbers.flatMap(
        (n) => key.answers[n]?.evidence.map((e) => e.segment) ?? [],
      ),
    );
    const readAll = (field: "explanation" | "simpler", max: number) =>
      readSegments(errors, `${path}.${field}`, item[field], max, (id) =>
        !segmentIds.has(id)
          ? `"${id}" is not a segment of the transcript`
          : !evidence.has(id)
            ? `"${id}" is not evidence of this question`
            : undefined,
      );
    const explanation = readAll("explanation", EXPLANATION_MAX_CHARACTERS);
    const simpler = readAll("simpler", SIMPLER_MAX_CHARACTERS);
    if (
      explanation &&
      simpler &&
      characters(simpler) >= characters(explanation)
    )
      errors.push(`${path}.simpler: expected shorter than the explanation`);
    if (explanation && simpler) items[unit.key] = { explanation, simpler };
  }
  const keys = units.map((u) => u.key);
  for (const unitKey of Object.keys(raw ?? {}))
    if (!keys.includes(unitKey))
      errors.push(`explanations.items.${unitKey}: no such answer unit`);

  return errors.length === 0 && review
    ? {
        ok: true,
        value: {
          testId: test.id,
          version: test.version,
          locale,
          review,
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
  checkTime: (id: string) => string | undefined,
): ExplanationSegment[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${path}: expected a list of segments`);
    return undefined;
  }
  const segments: ExplanationSegment[] = [];
  value.forEach((segment, i) => {
    const fields = isRecord(segment) ? Object.keys(segment) : [];
    const only = fields.length === 1 ? fields[0] : undefined;
    const content = only && isRecord(segment) ? segment[only] : undefined;
    if (typeof content !== "string" || content.trim() === "") {
      errors.push(
        `${path}[${i}]: expected { text }, { en } or { at }, not empty`,
      );
      return;
    }
    if (only === "text") segments.push({ text: content });
    else if (only === "en") {
      if (content.trim().split(/\s+/).length > ENGLISH_QUOTE_MAX_WORDS)
        errors.push(
          `${path}[${i}]: English quotes have at most ${ENGLISH_QUOTE_MAX_WORDS} words`,
        );
      segments.push({ en: content });
    } else if (only === "at") {
      const problem = checkTime(content);
      if (problem) errors.push(`${path}[${i}].at: ${problem}`);
      segments.push({ at: content });
    } else
      errors.push(
        `${path}[${i}]: expected { text }, { en } or { at }, not empty`,
      );
  });
  if (segments.length !== value.length) return undefined;
  const length = characters(segments);
  if (length > maxCharacters) {
    errors.push(`${path}: ${length} characters, at most ${maxCharacters}`);
    return undefined;
  }
  return segments;
}

/** Characters as a reader counts them (code points), a time as "m:ss". */
function characters(segments: ExplanationSegment[]): number {
  return segments.reduce(
    (n, s) =>
      n +
      ("at" in s
        ? TIME_CHARACTERS
        : Array.from("text" in s ? s.text : s.en).length),
    0,
  );
}
