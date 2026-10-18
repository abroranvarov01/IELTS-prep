import {
  type Parsed,
  isRecord,
  readId,
  readInteger,
  readList,
  readOptionalTitle,
  readOptions,
  readOrigin,
  readReview,
  readSegments,
  readText,
  readWordLimit,
} from "@/shared/content/parse";
import {
  answerOptionIds,
  checkFlowChart,
  checkHashedName,
  checkLabelling,
  checkTable,
  readFlowChart,
  readGapAnswer,
  readLabelling,
  readProvenance,
  readSha256,
  readTable,
} from "@/shared/content/shapes";
import { normalizeTypedAnswer } from "@/shared/content/normalize";
import { type WordLimit, gapNumbers } from "@/shared/content/types";
import {
  type AudioAsset,
  CONTENT_TAGS,
  type ContentTag,
  type Distractor,
  type Evidence,
  type KeyEntry,
  type ListeningKey,
  type ListeningTest,
  type NoteLine,
  PART_COUNT,
  type Part,
  QUESTIONS_PER_PART,
  type QuestionGroup,
  type Segment,
  type Transcript,
  groupNumbers,
  typedWordLimit,
} from "./content";
import { fitsListeningWordLimit } from "./word-limit";

/** How many parts and questions per part a file must have: a test, or a level-check form (ADR-0012 §1). */
export type ContentShape = { parts: number; questionsPerPart: number };

export const TEST_SHAPE: ContentShape = {
  parts: PART_COUNT,
  questionsPerPart: QUESTIONS_PER_PART,
};

/** The audio ceiling: 64 kbps plus 10% for the container (ADR-0012 §3). */
const MAX_BITS_PER_SECOND = 64_000 * 1.1;

/**
 * Turns unknown JSON into a ListeningTest, or lists every problem with its
 * path (ADR-0012). Content is untrusted: nothing malformed gets past this.
 */
export function parseListeningTest(
  input: unknown,
  shape: ContentShape = TEST_SHAPE,
): Parsed<ListeningTest> {
  const errors: string[] = [];
  const test = readTest(errors, input);
  if (test) checkTest(errors, test, shape);
  return test && errors.length === 0
    ? { ok: true, value: test }
    : { ok: false, errors };
}

/** Checks a transcript against its test: one list of timed segments per part (ADR-0012 §4). */
export function parseTranscript(
  test: ListeningTest,
  input: unknown,
): Parsed<Transcript> {
  const errors: string[] = [];
  if (!isRecord(input))
    return { ok: false, errors: ["transcript: expected an object"] };
  checkOwner(errors, "transcript", test, input);
  const revision = readInteger(
    errors,
    "transcript.revision",
    input.revision,
    1,
  );
  const review = readReview(errors, "transcript.review", input.review);
  const parts = readList(
    errors,
    "transcript.parts",
    input.parts,
    test.parts.length,
  )?.map((value, i) => {
    const path = `transcript.parts[${i}]`;
    const part = test.parts[i];
    if (!isRecord(value) || !part) {
      errors.push(`${path}: expected an object for a part of the test`);
      return undefined;
    }
    if (value.partId !== part.id)
      errors.push(`${path}.partId: expected "${part.id}"`);
    const segments = readList(errors, `${path}.segments`, value.segments)?.map(
      (s, j) => readSegment(errors, `${path}.segments[${j}]`, s),
    );
    if (!segments || segments.some((s) => !s)) return undefined;
    checkSegments(errors, path, segments as Segment[], part.audio.durationMs);
    return { partId: part.id, segments: segments as Segment[] };
  });
  if (parts && parts.length !== test.parts.length)
    errors.push(`transcript.parts: expected ${test.parts.length} parts`);
  const ids = (parts ?? []).flatMap((p) => p?.segments.map((s) => s.id) ?? []);
  if (new Set(ids).size !== ids.length)
    errors.push("transcript: segment ids must be unique in the test");
  return errors.length === 0 &&
    revision !== undefined &&
    review &&
    parts?.every((p) => p)
    ? {
        ok: true,
        value: {
          testId: test.id,
          version: test.version,
          revision,
          review,
          parts: parts as Transcript["parts"],
        },
      }
    : { ok: false, errors };
}

/**
 * Checks a key against its test and transcript: every question has accepted
 * answers and evidence, a quote found in a segment of its own part
 * (ADR-0012 §5), and the M9 additions of ADR-0014 §7: the transcript revision
 * it was checked against, typed variants within the word limit, optional
 * `fromRecording`, tags, distractors and `ordered`.
 */
export function parseListeningKey(
  test: ListeningTest,
  transcript: Transcript,
  input: unknown,
): Parsed<ListeningKey> {
  const errors: string[] = [];
  if (!isRecord(input))
    return { ok: false, errors: ["key: expected an object"] };
  checkOwner(errors, "key", test, input);
  const revision = readInteger(errors, "key.revision", input.revision, 1);
  const transcriptRevision = readInteger(
    errors,
    "key.transcriptRevision",
    input.transcriptRevision,
    1,
  );
  // A transcript correction cannot ship without a key revision (ADR-0014 §7).
  if (
    transcriptRevision !== undefined &&
    transcriptRevision !== transcript.revision
  )
    errors.push(
      `key.transcriptRevision: expected ${transcript.revision}, the transcript's revision`,
    );
  const review = readReview(errors, "key.review", input.review);
  const entries = isRecord(input.answers) ? input.answers : undefined;
  if (!entries) errors.push("key.answers: expected an object");
  const answers: ListeningKey["answers"] = {};
  const numbers = new Set<string>();

  test.parts.forEach((part, p) => {
    const segments = new Map(
      transcript.parts[p]?.segments.map((s) => [s.id, s.text]),
    );
    for (const group of part.questionGroups) {
      for (const number of groupNumbers(group)) {
        const path = `key.answers.${number}`;
        numbers.add(String(number));
        const entry = entries?.[String(number)];
        if (!entries) continue;
        if (!isRecord(entry)) {
          errors.push(
            `${path}: ${entry === undefined ? "missing" : "expected an object"}`,
          );
          continue;
        }
        const accept = allDefined(
          readList(errors, `${path}.accept`, entry.accept)?.map((v, i) =>
            readText(errors, `${path}.accept[${i}]`, v),
          ),
        );
        const allowed = allowedAnswers(group, number);
        if (accept && allowed)
          for (const value of accept)
            if (!allowed.includes(value))
              errors.push(
                `${path}.accept: "${value}" is not an option of question ${number}`,
              );
        const limit = typedWordLimit(group);
        if (accept && !allowed && limit)
          checkVariants(errors, `${path}.accept`, accept, limit);
        const evidence = allDefined(
          readList(errors, `${path}.evidence`, entry.evidence)?.map((v, i) =>
            readEvidence(errors, `${path}.evidence[${i}]`, v, segments, part),
          ),
        );
        const extras = readExtras(errors, path, entry, {
          typed: !allowed,
          options: allowed,
          accept: accept ?? [],
          segments,
          part,
        });
        if (accept && evidence)
          answers[number] = { accept, evidence, ...extras };
      }
      if (group.type === "multipleChoiceMulti")
        for (const item of group.items) {
          checkItem(errors, answers, item.numbers);
          checkSameTag(errors, answers, item.numbers);
        }
      for (const question of group.type === "shortAnswer"
        ? group.questions
        : [])
        checkList(errors, answers, question.numbers);
      for (const number of groupNumbers(group))
        if (answers[number]?.ordered && !isListStart(group, number))
          errors.push(
            `key.answers.${number}.ordered: only the first number of a question with several answers can be ordered`,
          );
    }
  });
  for (const key of Object.keys(entries ?? {}))
    if (!numbers.has(key)) errors.push(`key.answers.${key}: no such question`);
  return errors.length === 0 &&
    revision !== undefined &&
    transcriptRevision !== undefined &&
    review
    ? {
        ok: true,
        value: {
          testId: test.id,
          version: test.version,
          revision,
          transcriptRevision,
          review,
          answers,
        },
      }
    : { ok: false, errors };
}

// --- Key ---------------------------------------------------------------------

type ExtrasContext = {
  typed: boolean;
  /** The option ids the question accepts, for a chosen answer. */
  options: string[] | undefined;
  accept: string[];
  segments: Map<string, string>;
  part: Part;
};

/** The optional M9 fields of an entry (ADR-0014 §7). */
function readExtras(
  errors: string[],
  path: string,
  entry: Record<string, unknown>,
  context: ExtrasContext,
): Omit<KeyEntry, "accept" | "evidence"> {
  const extras: Omit<KeyEntry, "accept" | "evidence"> = {};
  if (entry.fromRecording !== undefined) {
    if (entry.fromRecording !== true)
      errors.push(`${path}.fromRecording: expected true or nothing`);
    else if (!context.typed)
      errors.push(`${path}.fromRecording: only typed answers can have it`);
    else extras.fromRecording = true;
  }
  if (entry.tag !== undefined) {
    if (CONTENT_TAGS.includes(entry.tag as ContentTag))
      extras.tag = entry.tag as ContentTag;
    else errors.push(`${path}.tag: expected one of ${CONTENT_TAGS.join(", ")}`);
  }
  if (entry.ordered !== undefined) {
    if (entry.ordered === true) extras.ordered = true;
    else errors.push(`${path}.ordered: expected true or nothing`);
  }
  if (entry.distractors !== undefined) {
    const distractors = allDefined(
      readList(errors, `${path}.distractors`, entry.distractors)?.map((v, i) =>
        readDistractor(errors, `${path}.distractors[${i}]`, v, context),
      ),
    );
    if (distractors) extras.distractors = distractors;
  }
  return extras;
}

const DISTRACTOR_REVIEWS = ["aiDraft", "verified"] as const;

/** Exactly one of an option or a typed text, where it is said, and who checked it. */
function readDistractor(
  errors: string[],
  path: string,
  value: unknown,
  context: ExtrasContext,
): Distractor | undefined {
  if (!isRecord(value)) {
    errors.push(
      `${path}: expected { "option" or "text", "segment", "quote", "review" }`,
    );
    return undefined;
  }
  const evidence = readEvidence(
    errors,
    path,
    { segment: value.segment, quote: value.quote },
    context.segments,
    context.part,
  );
  const review = DISTRACTOR_REVIEWS.find((r) => r === value.review);
  if (!review)
    errors.push(
      `${path}.review: expected one of ${DISTRACTOR_REVIEWS.join(", ")}`,
    );
  let said: { option: string } | { text: string } | undefined;
  if (context.typed) {
    if (value.option !== undefined)
      errors.push(`${path}.option: a typed answer's distractor is a text`);
    const text = readText(errors, `${path}.text`, value.text);
    if (
      text &&
      context.accept.some(
        (v) => normalizeTypedAnswer(v) === normalizeTypedAnswer(text),
      )
    )
      errors.push(`${path}.text: "${text}" is an accepted answer`);
    else if (text) said = { text };
  } else {
    if (value.text !== undefined)
      errors.push(`${path}.text: a chosen answer's distractor is an option`);
    const option = readText(errors, `${path}.option`, value.option);
    if (option && !context.options?.includes(option))
      errors.push(
        `${path}.option: "${option}" is not an option of the question`,
      );
    else if (option && context.accept.includes(option))
      errors.push(`${path}.option: "${option}" is an accepted answer`);
    else if (option) said = { option };
  }
  return evidence && review && said
    ? { ...said, segment: evidence.segment, quote: evidence.quote, review }
    : undefined;
}

/** The numbers of an item or a "List TWO" question carry the same tag or none. */
function checkSameTag(
  errors: string[],
  answers: ListeningKey["answers"],
  numbers: number[],
) {
  if (new Set(numbers.map((n) => answers[n]?.tag)).size > 1)
    errors.push(
      `key.answers.${numbers.join("-")}: every number needs the same tag`,
    );
}

/**
 * The numbers of a "List TWO" question name different things, so no variant
 * is listed under two of them (ADR-0014 §7).
 */
function checkList(
  errors: string[],
  answers: ListeningKey["answers"],
  numbers: number[],
) {
  if (numbers.length < 2) return;
  checkSameTag(errors, answers, numbers);
  const seen = new Set<string>();
  for (const n of numbers) {
    const variants = new Set(
      (answers[n]?.accept ?? []).map(normalizeTypedAnswer),
    );
    for (const v of variants)
      if (seen.has(v))
        errors.push(
          `key.answers.${numbers.join("-")}: "${v}" is listed under two numbers`,
        );
    for (const v of variants) seen.add(v);
  }
}

function isListStart(group: QuestionGroup, number: number): boolean {
  return (
    group.type === "shortAnswer" &&
    group.questions.some((q) => q.numbers.length > 1 && q.numbers[0] === number)
  );
}

function checkOwner(
  errors: string[],
  name: string,
  test: ListeningTest,
  input: Record<string, unknown>,
) {
  if (input.testId !== test.id)
    errors.push(`${name}.testId: expected "${test.id}"`);
  if (input.version !== test.version)
    errors.push(`${name}.version: expected ${test.version}`);
}

function readEvidence(
  errors: string[],
  path: string,
  value: unknown,
  segments: Map<string, string>,
  part: Part,
): Evidence | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: expected { "segment", "quote" }`);
    return undefined;
  }
  const segment = readId(errors, `${path}.segment`, value.segment);
  const quote = readText(errors, `${path}.quote`, value.quote);
  if (!segment || !quote) return undefined;
  const text = segments.get(segment);
  if (text === undefined)
    errors.push(
      `${path}.segment: "${segment}" is not a segment of part ${part.number}`,
    );
  else if (!text.includes(quote))
    errors.push(`${path}.quote: not found in segment "${segment}"`);
  return { segment, quote };
}

/**
 * Typed answers are listed in full, each different from the others after
 * normalization and within the word limit, so an answer over the limit can
 * never be correct (ADR-0008 §3, ADR-0014 §7).
 */
function checkVariants(
  errors: string[],
  path: string,
  accept: string[],
  limit: WordLimit,
) {
  const seen = new Set<string>();
  for (const value of accept) {
    const normalized = normalizeTypedAnswer(value);
    if (seen.has(normalized))
      errors.push(`${path}: "${value}" repeats another accepted answer`);
    else if (!fitsListeningWordLimit(normalized, limit))
      errors.push(`${path}: "${value}" is over the word limit`);
    seen.add(normalized);
  }
}

/** The numbers of a "choose several" item need the same set, one option per number. */
function checkItem(
  errors: string[],
  answers: ListeningKey["answers"],
  numbers: number[],
) {
  const entries = numbers.map((n) => answers[n]);
  const [first, ...rest] = entries;
  if (!first || rest.some((e) => !e)) return;
  const path = `key.answers.${numbers.join("-")}`;
  const set = [...first.accept].sort().join();
  if (rest.some((e) => [...(e?.accept ?? [])].sort().join() !== set))
    errors.push(`${path}: every number of the item needs the same answers`);
  if (
    new Set(first.accept).size !== first.accept.length ||
    first.accept.length !== numbers.length
  )
    errors.push(
      `${path}: expected ${numbers.length} different options, one per number`,
    );
}

/** The option ids a question accepts, or undefined for typed answers. */
function allowedAnswers(
  group: QuestionGroup,
  number: number,
): string[] | undefined {
  switch (group.type) {
    case "multipleChoice":
      return group.questions
        .find((q) => q.number === number)
        ?.options.map((o) => o.id);
    case "multipleChoiceMulti":
      return group.items
        .find((item) => item.numbers.includes(number))
        ?.options.map((o) => o.id);
    case "matchingFeatures":
      return group.options.map((o) => o.id);
    case "shortAnswer":
      return undefined;
    case "labelling":
      return answerOptionIds(group.answer, group.markers);
    default:
      return answerOptionIds(group.answer);
  }
}

// --- Transcript --------------------------------------------------------------

function readSegment(
  errors: string[],
  path: string,
  value: unknown,
): Segment | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  const id = readId(errors, `${path}.id`, value.id);
  const startMs = readInteger(errors, `${path}.startMs`, value.startMs, 0);
  const endMs = readInteger(errors, `${path}.endMs`, value.endMs, 1);
  const speaker = readText(errors, `${path}.speaker`, value.speaker);
  const text = readText(errors, `${path}.text`, value.text);
  return id && startMs !== undefined && endMs !== undefined && speaker && text
    ? { id, startMs, endMs, speaker, text }
    : undefined;
}

/** In order, without overlaps, within the part's file. */
function checkSegments(
  errors: string[],
  path: string,
  segments: Segment[],
  durationMs: number,
) {
  segments.forEach((segment, i) => {
    const at = `${path}.segments[${i}]`;
    if (segment.endMs <= segment.startMs)
      errors.push(`${at}: ends before it starts`);
    if (segment.endMs > durationMs)
      errors.push(`${at}: ends after the part's audio (${durationMs} ms)`);
    const previous = segments[i - 1];
    if (previous && segment.startMs < previous.endMs)
      errors.push(`${at}: starts before the previous segment ends`);
  });
}

// --- Test structure ----------------------------------------------------------

function readTest(errors: string[], input: unknown): ListeningTest | undefined {
  if (!isRecord(input)) {
    errors.push("test: expected an object");
    return undefined;
  }
  const id = readId(errors, "id", input.id);
  const version = readInteger(errors, "version", input.version, 1);
  const title = readText(errors, "title", input.title);
  const origin = readOrigin(errors, input.origin);
  if (input.temporary !== undefined && input.temporary !== true)
    errors.push("temporary: expected true or no value");
  const parts = readList(errors, "parts", input.parts)?.map((p, i) =>
    readPart(errors, `parts[${i}]`, p),
  );
  if (
    id === undefined ||
    version === undefined ||
    title === undefined ||
    origin === undefined ||
    !parts ||
    parts.some((p) => !p)
  )
    return undefined;
  if (input.temporary === true && origin.kind !== "licensed")
    errors.push(
      "temporary: temporary content must have a licensed origin with its source and licence",
    );
  return {
    id,
    version,
    title,
    origin,
    ...(input.temporary === true && { temporary: true as const }),
    parts: parts as Part[],
  };
}

function readPart(
  errors: string[],
  path: string,
  value: unknown,
): Part | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  const id = readId(errors, `${path}.id`, value.id);
  const number = readInteger(errors, `${path}.number`, value.number, 1);
  const audio = readAudio(errors, `${path}.audio`, value.audio);
  const questionGroups = readList(
    errors,
    `${path}.questionGroups`,
    value.questionGroups,
  )?.map((g, i) => readGroup(errors, `${path}.questionGroups[${i}]`, g));
  if (
    id === undefined ||
    number === undefined ||
    !audio ||
    !questionGroups ||
    questionGroups.some((g) => !g)
  )
    return undefined;
  return {
    id,
    number,
    audio,
    questionGroups: questionGroups as QuestionGroup[],
  };
}

function readAudio(
  errors: string[],
  path: string,
  value: unknown,
): AudioAsset | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  const src = readText(errors, `${path}.src`, value.src);
  if (value.mimeType !== "audio/mp4")
    errors.push(`${path}.mimeType: expected "audio/mp4" (AAC-LC, ADR-0012 §3)`);
  const durationMs = readInteger(
    errors,
    `${path}.durationMs`,
    value.durationMs,
    1,
  );
  const bytes = readInteger(errors, `${path}.bytes`, value.bytes, 1);
  const sha256 = readSha256(errors, `${path}.sha256`, value.sha256);
  const provenance = readProvenance(
    errors,
    `${path}.provenance`,
    value.provenance,
    { voices: true },
  );
  if (
    !src ||
    value.mimeType !== "audio/mp4" ||
    durationMs === undefined ||
    bytes === undefined ||
    !sha256 ||
    !provenance
  )
    return undefined;
  checkHashedName(errors, `${path}.src`, src, sha256, "m4a");
  if ((bytes * 8 * 1000) / durationMs > MAX_BITS_PER_SECOND)
    errors.push(`${path}.bytes: over the 64 kbps ceiling for its duration`);
  return { src, mimeType: "audio/mp4", durationMs, bytes, sha256, provenance };
}

function readGroup(
  errors: string[],
  path: string,
  value: unknown,
): QuestionGroup | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  const id = readId(errors, `${path}.id`, value.id);
  const instruction = readText(
    errors,
    `${path}.instruction`,
    value.instruction,
  );
  if (id === undefined || instruction === undefined) return undefined;
  const base = { id, instruction };
  const list = <T>(
    field: string,
    read: (item: Record<string, unknown>, itemPath: string) => T | undefined,
  ) =>
    allDefined(
      readList(errors, `${path}.${field}`, value[field])?.map((item, i) => {
        const itemPath = `${path}.${field}[${i}]`;
        if (isRecord(item)) return read(item, itemPath);
        errors.push(`${itemPath}: expected an object`);
        return undefined;
      }),
    );
  const answer = () => readGapAnswer(errors, `${path}.answer`, value.answer);
  const title = readOptionalTitle(errors, path, value.title);
  if (title === null) return undefined;
  const titled = title ? { title } : {};

  switch (value.type) {
    case "multipleChoice": {
      const questions = list("questions", (q, p) => {
        const number = readInteger(errors, `${p}.number`, q.number, 1);
        const stem = readText(errors, `${p}.stem`, q.stem);
        const options = readOptions(errors, `${p}.options`, q.options);
        return number !== undefined && stem && options
          ? { number, stem, options }
          : undefined;
      });
      return questions && { ...base, type: "multipleChoice", questions };
    }
    case "multipleChoiceMulti": {
      const items = list("items", (item, p) => {
        const numbers = allDefined(
          readList(errors, `${p}.numbers`, item.numbers, 2)?.map((n, j) =>
            readInteger(errors, `${p}.numbers[${j}]`, n, 1),
          ),
        );
        const stem = readText(errors, `${p}.stem`, item.stem);
        const options = readOptions(errors, `${p}.options`, item.options);
        return numbers && stem && options
          ? { numbers, stem, options }
          : undefined;
      });
      return items && { ...base, type: "multipleChoiceMulti", items };
    }
    case "matchingFeatures": {
      const options = readOptions(errors, `${path}.options`, value.options);
      const allowRepeat =
        typeof value.allowRepeat === "boolean" ? value.allowRepeat : undefined;
      if (allowRepeat === undefined)
        errors.push(`${path}.allowRepeat: expected true or false`);
      const questions = list("questions", (q, p) => {
        const number = readInteger(errors, `${p}.number`, q.number, 1);
        const statement = readText(errors, `${p}.statement`, q.statement);
        return number !== undefined && statement
          ? { number, statement }
          : undefined;
      });
      return options && allowRepeat !== undefined && questions
        ? { ...base, type: "matchingFeatures", options, allowRepeat, questions }
        : undefined;
    }
    case "sentenceCompletion": {
      const sentences = allDefined(
        readList(errors, `${path}.sentences`, value.sentences)?.map((s, i) =>
          readSegments(errors, `${path}.sentences[${i}]`, s),
        ),
      );
      const a = answer();
      return sentences && a
        ? { ...base, type: "sentenceCompletion", sentences, answer: a }
        : undefined;
    }
    case "noteCompletion": {
      const lines = allDefined(
        readList(errors, `${path}.lines`, value.lines)?.map(
          (line, i): NoteLine | undefined => {
            if (isRecord(line)) {
              const heading = readText(
                errors,
                `${path}.lines[${i}].heading`,
                line.heading,
              );
              return heading ? { heading } : undefined;
            }
            return readSegments(errors, `${path}.lines[${i}]`, line);
          },
        ),
      );
      const a = answer();
      return lines && a
        ? { ...base, ...titled, type: "noteCompletion", lines, answer: a }
        : undefined;
    }
    case "formCompletion": {
      const lines = list("lines", (line, p) => {
        const label = readText(errors, `${p}.label`, line.label);
        const lineValue = readSegments(errors, `${p}.value`, line.value);
        return label && lineValue ? { label, value: lineValue } : undefined;
      });
      const a = answer();
      return lines && a
        ? { ...base, ...titled, type: "formCompletion", lines, answer: a }
        : undefined;
    }
    case "shortAnswer": {
      const wordLimit = readWordLimit(
        errors,
        `${path}.wordLimit`,
        value.wordLimit,
      );
      const questions = list("questions", (q, p) => {
        const question = readText(errors, `${p}.question`, q.question);
        const numbers =
          q.numbers === undefined
            ? allDefined([readInteger(errors, `${p}.number`, q.number, 1)])
            : allDefined(
                readList(errors, `${p}.numbers`, q.numbers, 2)?.map((n, j) =>
                  readInteger(errors, `${p}.numbers[${j}]`, n, 1),
                ),
              );
        if (numbers && numbers.length > 3)
          errors.push(`${p}.numbers: at most 3 answers to one question`);
        return question && numbers ? { numbers, question } : undefined;
      });
      return wordLimit && questions
        ? { ...base, type: "shortAnswer", wordLimit, questions }
        : undefined;
    }
    case "tableCompletion": {
      const table = readTable(errors, path, value);
      const a = answer();
      return table && a
        ? { ...base, ...table, type: "tableCompletion", answer: a }
        : undefined;
    }
    case "flowChartCompletion": {
      const chart = readFlowChart(errors, path, value);
      const a = answer();
      return chart && a
        ? { ...base, ...chart, type: "flowChartCompletion", answer: a }
        : undefined;
    }
    case "labelling": {
      const shape = readLabelling(errors, path, value);
      return shape && { ...base, ...shape, type: "labelling" };
    }
    default:
      errors.push(
        `${path}.type: unknown question type ${JSON.stringify(value.type)}`,
      );
      return undefined;
  }
}

// --- Cross-references --------------------------------------------------------

function checkTest(errors: string[], test: ListeningTest, shape: ContentShape) {
  if (test.parts.length !== shape.parts)
    errors.push(`parts: expected ${shape.parts} parts`);
  const ids = new Set<string>();
  const unique = (id: string, path: string) => {
    if (ids.has(id)) errors.push(`${path}: the id "${id}" is used twice`);
    ids.add(id);
  };
  const numbers: number[] = [];
  test.parts.forEach((part, i) => {
    const path = `parts[${i}]`;
    unique(part.id, `${path}.id`);
    if (part.number !== i + 1) errors.push(`${path}.number: expected ${i + 1}`);
    const partNumbers = part.questionGroups.flatMap((group, j) => {
      const groupPath = `${path}.questionGroups[${j}]`;
      unique(group.id, `${groupPath}.id`);
      checkGroup(errors, groupPath, group);
      return groupNumbers(group);
    });
    if (partNumbers.length !== shape.questionsPerPart)
      errors.push(
        `${path}: expected ${shape.questionsPerPart} questions, found ${partNumbers.length}`,
      );
    numbers.push(...partNumbers);
  });
  const total = shape.parts * shape.questionsPerPart;
  const expected = Array.from({ length: total }, (_, i) => i + 1);
  if (numbers.join() !== expected.join())
    errors.push(
      `questions: numbers must run 1 to ${total} once each, in order (found ${numbers.join(", ")})`,
    );
}

function checkGroup(errors: string[], path: string, group: QuestionGroup) {
  switch (group.type) {
    case "multipleChoiceMulti":
      group.items.forEach((item, i) => {
        if (
          item.numbers.some(
            (n, j) => j > 0 && n !== (item.numbers[j - 1] ?? 0) + 1,
          )
        )
          errors.push(`${path}.items[${i}].numbers: must be consecutive`);
        if (item.options.length <= item.numbers.length)
          errors.push(
            `${path}.items[${i}].options: needs more options than answers to choose`,
          );
      });
      return;
    case "sentenceCompletion":
      group.sentences.forEach((s, i) => {
        if (gapNumbers(s).length !== 1)
          errors.push(`${path}.sentences[${i}]: needs exactly one gap`);
      });
      return;
    case "noteCompletion":
    case "formCompletion":
      if (groupNumbers(group).length === 0)
        errors.push(`${path}.lines: have no gap`);
      return;
    case "tableCompletion":
      checkTable(errors, path, group);
      return;
    case "flowChartCompletion":
      checkFlowChart(errors, path, group);
      return;
    case "labelling":
      checkLabelling(errors, path, group);
      return;
    default:
      return;
  }
}

function allDefined<T>(list: (T | undefined)[] | undefined): T[] | undefined {
  return list && list.every((x) => x !== undefined) ? (list as T[]) : undefined;
}
