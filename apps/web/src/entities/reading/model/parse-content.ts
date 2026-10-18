import {
  type Parsed,
  type ReviewStatus,
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
  type ExamType,
  PASSAGE_COUNT,
  type Paragraph,
  type Passage,
  QUESTION_COUNT,
  type QuestionGroup,
  type ReadingTest,
  STATEMENT_ANSWERS,
  type Sentence,
  type WordLimit,
  gapNumbers,
  groupNumbers,
} from "./content";
import { normalizeTypedAnswer } from "./scoring";
import { fitsWordLimit } from "./word-limit";

export {
  type Parsed,
  REVIEW_STATUSES,
  type ReviewStatus,
} from "@/shared/content/parse";

/** How many passages and questions a file must have: a test, or a level-check form (ADR-0011 §1). */
export type ContentShape = { passages: number; questions: number };

export const TEST_SHAPE: ContentShape = {
  passages: PASSAGE_COUNT,
  questions: QUESTION_COUNT,
};

/**
 * Turns unknown JSON into a ReadingTest, or lists every problem with its path
 * (ADR-0005). Content is untrusted: nothing malformed gets past this.
 */
export function parseReadingTest(
  input: unknown,
  shape: ContentShape = TEST_SHAPE,
): Parsed<ReadingTest> {
  const errors: string[] = [];
  const test = readTest(errors, input);
  if (test) checkTest(errors, test, shape);
  return test && errors.length === 0
    ? { ok: true, value: test }
    : { ok: false, errors };
}

/** What a question tests, written with the key; it describes the question, not the learner. */
const TRAP_TAGS = ["paraphrase", "qualifier"] as const;
export type TrapTag = (typeof TRAP_TAGS)[number];

export type AnswerKeyEntry = {
  accept: string[];
  /** For a NOT GIVEN answer: where the passage deals with the topic, possibly none. */
  evidence: string[];
  trap?: TrapTag;
  /** Typed questions whose instruction says the words come from the passage. */
  fromPassage?: true;
};

/** Accepted answers and evidence sentences per question number (ADR-0005 §2, ADR-0008 §3). */
export type AnswerKey = {
  testId: string;
  version: number;
  /** Increases with any change to the key once it may have been used for results. */
  revision: number;
  review: { status: ReviewStatus };
  answers: Record<number, AnswerKeyEntry>;
};

/** Checks an answer key against its test: every question, valid options, existing evidence. */
export function parseAnswerKey(
  test: ReadingTest,
  input: unknown,
): Parsed<AnswerKey> {
  const errors: string[] = [];
  if (!isRecord(input))
    return { ok: false, errors: ["key: expected an object"] };
  if (input.testId !== test.id)
    errors.push(`key.testId: expected "${test.id}"`);
  if (input.version !== test.version)
    errors.push(`key.version: expected ${test.version}`);
  const revision = readInteger(errors, "key.revision", input.revision, 1);
  const review = readReview(errors, "key.review", input.review);
  const answers: Record<number, AnswerKeyEntry> = {};
  const entries = isRecord(input.answers) ? input.answers : undefined;
  if (!entries) errors.push("key.answers: expected an object");
  const questionNumbers = new Set<string>();

  test.passages.forEach((passage) => {
    const sentenceIds = new Set(
      passage.paragraphs.flatMap((p) => p.sentences.map((s) => s.id)),
    );
    for (const group of passage.questionGroups) {
      for (const number of groupNumbers(group)) {
        const path = `key.answers.${number}`;
        questionNumbers.add(String(number));
        if (!entries) continue;
        const entry = entries[String(number)];
        if (!isRecord(entry)) {
          errors.push(
            `${path}: ${entry === undefined ? "missing" : "expected an object"}`,
          );
          continue;
        }
        const accept = readList(errors, `${path}.accept`, entry.accept)?.map(
          (value, i) => readText(errors, `${path}.accept[${i}]`, value) ?? "",
        );
        const isNotGiven =
          (group.type === "trueFalseNotGiven" ||
            group.type === "yesNoNotGiven") &&
          accept?.length === 1 &&
          accept[0] === "NOT GIVEN";
        const evidence = readList(
          errors,
          `${path}.evidence`,
          entry.evidence,
          isNotGiven ? 0 : 1,
        )?.map(
          (value, i) => readText(errors, `${path}.evidence[${i}]`, value) ?? "",
        );
        const allowed = allowedAnswers(passage, group, number);
        for (const value of accept ?? []) {
          if (allowed && !allowed.includes(value))
            errors.push(
              `${path}.accept: "${value}" is not an option of question ${number}`,
            );
        }
        if (!allowed && accept && "wordLimit" in group)
          checkVariants(errors, `${path}.accept`, accept, group.wordLimit);
        for (const id of evidence ?? []) {
          if (!sentenceIds.has(id))
            errors.push(
              `${path}.evidence: "${id}" is not a sentence of passage ${passage.number}`,
            );
        }
        const trap = readTrap(errors, `${path}.trap`, entry.trap);
        if (entry.fromPassage !== undefined) {
          if (entry.fromPassage !== true)
            errors.push(`${path}.fromPassage: expected true or no value`);
          else if (allowed)
            errors.push(`${path}.fromPassage: only for typed answers`);
        }
        answers[number] = {
          accept: accept ?? [],
          evidence: evidence ?? [],
          ...(trap && { trap }),
          ...(entry.fromPassage === true && !allowed && { fromPassage: true }),
        };
      }
      if (group.type === "multipleChoiceMulti" && entries)
        for (const item of group.items)
          checkItem(errors, answers, item.numbers);
    }
  });
  for (const key of Object.keys(entries ?? {})) {
    if (!questionNumbers.has(key))
      errors.push(`key.answers.${key}: no such question`);
  }
  return errors.length === 0 && revision !== undefined && review
    ? {
        ok: true,
        value: {
          testId: test.id,
          version: test.version,
          revision,
          review,
          answers,
        },
      }
    : { ok: false, errors };
}

/**
 * Typed answers are listed in full: each variant non-empty, different from
 * the others once normalized as checking normalizes it, and within the
 * instruction's word limit (an over-limit answer is never correct in IELTS).
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
    if (normalized === "") errors.push(`${path}: "${value}" is empty`);
    else if (seen.has(normalized))
      errors.push(`${path}: "${value}" repeats another accepted answer`);
    else if (!fitsWordLimit(normalized, limit))
      errors.push(`${path}: "${value}" is over the word limit`);
    seen.add(normalized);
  }
}

/**
 * The numbers of a "choose several" item share one answer (ADR-0006), so
 * their key entries must agree: the same set, as many different options as
 * the item has numbers, and the same tag or none (ADR-0008 §3).
 */
function checkItem(
  errors: string[],
  answers: Record<number, AnswerKeyEntry>,
  numbers: number[],
) {
  const path = `key.answers.${numbers.join("-")}`;
  const entries = numbers.map((n) => answers[n]);
  if (entries.some((e) => e === undefined)) return;
  const [first, ...rest] = entries as AnswerKeyEntry[];
  if (!first) return;
  const set = [...first.accept].sort().join();
  if (rest.some((e) => [...e.accept].sort().join() !== set))
    errors.push(`${path}: every number of the item needs the same answers`);
  if (
    new Set(first.accept).size !== first.accept.length ||
    first.accept.length !== numbers.length
  )
    errors.push(
      `${path}: expected ${numbers.length} different options, one per number`,
    );
  if (rest.some((e) => e.trap !== first.trap))
    errors.push(`${path}: every number of the item needs the same tag`);
}

function readTrap(
  errors: string[],
  path: string,
  value: unknown,
): TrapTag | undefined {
  if (value === undefined) return undefined;
  if (TRAP_TAGS.includes(value as TrapTag)) return value as TrapTag;
  errors.push(`${path}: expected one of ${TRAP_TAGS.join(", ")}`);
  return undefined;
}

/** The option ids a question accepts, or undefined for typed answers. */
function allowedAnswers(
  passage: Passage,
  group: QuestionGroup,
  number: number,
): readonly string[] | undefined {
  switch (group.type) {
    case "trueFalseNotGiven":
    case "yesNoNotGiven":
      return STATEMENT_ANSWERS[group.type];
    case "multipleChoice":
      return group.questions
        .find((q) => q.number === number)
        ?.options.map((o) => o.id);
    case "multipleChoiceMulti":
      return group.items
        .find((item) => item.numbers.includes(number))
        ?.options.map((o) => o.id);
    case "matchingInformation":
      return passage.paragraphs.flatMap((p) => (p.letter ? [p.letter] : []));
    case "matchingHeadings":
    case "matchingFeatures":
    case "matchingSentenceEndings":
    case "summaryWordBox":
      return group.options.map((o) => o.id);
    default:
      return undefined;
  }
}

// --- Structure ---------------------------------------------------------------

function readTest(errors: string[], input: unknown): ReadingTest | undefined {
  if (!isRecord(input)) {
    errors.push("test: expected an object");
    return undefined;
  }
  const id = readId(errors, "id", input.id);
  const version = readInteger(errors, "version", input.version, 1);
  const title = readText(errors, "title", input.title);
  const examType = readExamType(errors, input.examType);
  const durationMinutes = readInteger(
    errors,
    "durationMinutes",
    input.durationMinutes,
    1,
  );
  const origin = readOrigin(errors, input.origin);
  const passages = readList(errors, "passages", input.passages)?.map((p, i) =>
    readPassage(errors, `passages[${i}]`, p),
  );
  if (
    id === undefined ||
    version === undefined ||
    title === undefined ||
    examType === undefined ||
    durationMinutes === undefined ||
    origin === undefined ||
    passages === undefined ||
    passages.some((p) => p === undefined)
  )
    return undefined;
  return {
    id,
    version,
    title,
    examType,
    durationMinutes,
    origin,
    passages: passages as Passage[],
  };
}

function readExamType(errors: string[], value: unknown): ExamType | undefined {
  if (value === "academic" || value === "general") return value;
  errors.push('examType: expected "academic" or "general"');
  return undefined;
}

function readPassage(
  errors: string[],
  path: string,
  value: unknown,
): Passage | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  const id = readId(errors, `${path}.id`, value.id);
  const number = readInteger(errors, `${path}.number`, value.number, 1);
  const title = readText(errors, `${path}.title`, value.title);
  const paragraphs = readList(
    errors,
    `${path}.paragraphs`,
    value.paragraphs,
  )?.map((p, i) => readParagraph(errors, `${path}.paragraphs[${i}]`, p));
  const questionGroups = readList(
    errors,
    `${path}.questionGroups`,
    value.questionGroups,
  )?.map((g, i) => readGroup(errors, `${path}.questionGroups[${i}]`, g));
  if (
    id === undefined ||
    number === undefined ||
    title === undefined ||
    !paragraphs ||
    paragraphs.some((p) => p === undefined) ||
    !questionGroups ||
    questionGroups.some((g) => g === undefined)
  )
    return undefined;
  return {
    id,
    number,
    title,
    paragraphs: paragraphs as Paragraph[],
    questionGroups: questionGroups as QuestionGroup[],
  };
}

function readParagraph(
  errors: string[],
  path: string,
  value: unknown,
): Paragraph | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  const id = readId(errors, `${path}.id`, value.id);
  let letter: string | undefined;
  if (value.letter !== undefined) {
    if (typeof value.letter === "string" && /^[A-Z]$/.test(value.letter))
      letter = value.letter;
    else errors.push(`${path}.letter: expected one capital letter`);
  }
  const sentences = readList(errors, `${path}.sentences`, value.sentences)?.map(
    (s, i): Sentence | undefined => {
      const sentencePath = `${path}.sentences[${i}]`;
      if (!isRecord(s)) {
        errors.push(`${sentencePath}: expected an object`);
        return undefined;
      }
      const sentenceId = readId(errors, `${sentencePath}.id`, s.id);
      const text = readText(errors, `${sentencePath}.text`, s.text);
      return sentenceId && text ? { id: sentenceId, text } : undefined;
    },
  );
  if (id === undefined || !sentences || sentences.some((s) => !s))
    return undefined;
  return letter
    ? { id, letter, sentences: sentences as Sentence[] }
    : { id, sentences: sentences as Sentence[] };
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
  const options = () => readOptions(errors, `${path}.options`, value.options);
  const wordLimit = () =>
    readWordLimit(errors, `${path}.wordLimit`, value.wordLimit);
  const questions = <T>(
    read: (q: Record<string, unknown>, p: string) => T | undefined,
  ) =>
    readList(errors, `${path}.questions`, value.questions)?.map((q, i) => {
      const qPath = `${path}.questions[${i}]`;
      if (!isRecord(q)) {
        errors.push(`${qPath}: expected an object`);
        return undefined;
      }
      return read(q, qPath);
    });
  const statements = () =>
    questions((q, p) => {
      const number = readInteger(errors, `${p}.number`, q.number, 1);
      const statement = readText(errors, `${p}.statement`, q.statement);
      return number !== undefined && statement
        ? { number, statement }
        : undefined;
    });
  const allDefined = <T>(list: (T | undefined)[] | undefined) =>
    list && list.every((x) => x !== undefined) ? (list as T[]) : undefined;
  const readBoolean = (field: string, v: unknown) => {
    if (typeof v === "boolean") return v;
    errors.push(`${path}.${field}: expected true or false`);
    return undefined;
  };

  switch (value.type) {
    case "trueFalseNotGiven":
    case "yesNoNotGiven": {
      const qs = allDefined(statements());
      return qs && { ...base, type: value.type, questions: qs };
    }
    case "multipleChoice": {
      const qs = allDefined(
        questions((q, p) => {
          const number = readInteger(errors, `${p}.number`, q.number, 1);
          const stem = readText(errors, `${p}.stem`, q.stem);
          const opts = readOptions(errors, `${p}.options`, q.options);
          return number !== undefined && stem && opts
            ? { number, stem, options: opts }
            : undefined;
        }),
      );
      return qs && { ...base, type: "multipleChoice", questions: qs };
    }
    case "multipleChoiceMulti": {
      const items = allDefined(
        readList(errors, `${path}.items`, value.items)?.map((item, i) => {
          const p = `${path}.items[${i}]`;
          if (!isRecord(item)) {
            errors.push(`${p}: expected an object`);
            return undefined;
          }
          const numbers = allDefined(
            readList(errors, `${p}.numbers`, item.numbers)?.map((n, j) =>
              readInteger(errors, `${p}.numbers[${j}]`, n, 1),
            ),
          );
          const stem = readText(errors, `${p}.stem`, item.stem);
          const opts = readOptions(errors, `${p}.options`, item.options);
          return numbers && stem && opts
            ? { numbers, stem, options: opts }
            : undefined;
        }),
      );
      return items && { ...base, type: "multipleChoiceMulti", items };
    }
    case "matchingHeadings": {
      const opts = options();
      const qs = allDefined(
        questions((q, p) => {
          const number = readInteger(errors, `${p}.number`, q.number, 1);
          const paragraphId = readId(errors, `${p}.paragraphId`, q.paragraphId);
          return number !== undefined && paragraphId
            ? { number, paragraphId }
            : undefined;
        }),
      );
      return (
        opts &&
        qs && {
          ...base,
          type: "matchingHeadings",
          options: opts,
          questions: qs,
        }
      );
    }
    case "matchingInformation": {
      const allowRepeat = readBoolean("allowRepeat", value.allowRepeat);
      const qs = allDefined(statements());
      return allowRepeat !== undefined && qs
        ? { ...base, type: "matchingInformation", allowRepeat, questions: qs }
        : undefined;
    }
    case "matchingFeatures": {
      const opts = options();
      const allowRepeat = readBoolean("allowRepeat", value.allowRepeat);
      const qs = allDefined(statements());
      return opts && allowRepeat !== undefined && qs
        ? {
            ...base,
            type: "matchingFeatures",
            options: opts,
            allowRepeat,
            questions: qs,
          }
        : undefined;
    }
    case "matchingSentenceEndings": {
      const opts = options();
      const qs = allDefined(
        questions((q, p) => {
          const number = readInteger(errors, `${p}.number`, q.number, 1);
          const start = readText(errors, `${p}.start`, q.start);
          return number !== undefined && start ? { number, start } : undefined;
        }),
      );
      return (
        opts &&
        qs && {
          ...base,
          type: "matchingSentenceEndings",
          options: opts,
          questions: qs,
        }
      );
    }
    case "summaryWordBox": {
      const opts = options();
      const text = readSegments(errors, `${path}.text`, value.text);
      const title = readOptionalTitle(errors, path, value.title);
      return opts && text && title !== null
        ? {
            ...base,
            type: "summaryWordBox",
            options: opts,
            text,
            ...(title && { title }),
          }
        : undefined;
    }
    case "sentenceCompletion": {
      const limit = wordLimit();
      const sentences = allDefined(
        readList(errors, `${path}.sentences`, value.sentences)?.map((s, i) =>
          readSegments(errors, `${path}.sentences[${i}]`, s),
        ),
      );
      return (
        limit &&
        sentences && {
          ...base,
          type: "sentenceCompletion",
          wordLimit: limit,
          sentences,
        }
      );
    }
    case "summaryCompletion": {
      const limit = wordLimit();
      const text = readSegments(errors, `${path}.text`, value.text);
      const title = readOptionalTitle(errors, path, value.title);
      return limit && text && title !== null
        ? {
            ...base,
            type: "summaryCompletion",
            wordLimit: limit,
            text,
            ...(title && { title }),
          }
        : undefined;
    }
    case "noteCompletion": {
      const limit = wordLimit();
      const lines = allDefined(
        readList(errors, `${path}.lines`, value.lines)?.map((l, i) =>
          readSegments(errors, `${path}.lines[${i}]`, l),
        ),
      );
      const title = readOptionalTitle(errors, path, value.title);
      return limit && lines && title !== null
        ? {
            ...base,
            type: "noteCompletion",
            wordLimit: limit,
            lines,
            ...(title && { title }),
          }
        : undefined;
    }
    case "shortAnswer": {
      const limit = wordLimit();
      const qs = allDefined(
        questions((q, p) => {
          const number = readInteger(errors, `${p}.number`, q.number, 1);
          const question = readText(errors, `${p}.question`, q.question);
          return number !== undefined && question
            ? { number, question }
            : undefined;
        }),
      );
      return (
        limit &&
        qs && { ...base, type: "shortAnswer", wordLimit: limit, questions: qs }
      );
    }
    default:
      errors.push(
        `${path}.type: unknown question type ${JSON.stringify(value.type)}`,
      );
      return undefined;
  }
}

// --- Cross-references ------------------------------------------------------

function checkTest(errors: string[], test: ReadingTest, shape: ContentShape) {
  if (test.passages.length !== shape.passages)
    errors.push(`passages: expected ${shape.passages} passages`);

  const ids = new Set<string>();
  const unique = (id: string, path: string) => {
    if (ids.has(id)) errors.push(`${path}: the id "${id}" is used twice`);
    ids.add(id);
  };

  const numbers: number[] = [];
  test.passages.forEach((passage, i) => {
    const path = `passages[${i}]`;
    unique(passage.id, `${path}.id`);
    if (passage.number !== i + 1)
      errors.push(`${path}.number: expected ${i + 1}`);

    const letters = passage.paragraphs.map((p) => p.letter);
    const lettered = letters.filter((l) => l !== undefined).length;
    if (lettered > 0 && lettered < letters.length)
      errors.push(`${path}.paragraphs: give every paragraph a letter, or none`);
    if (
      lettered === letters.length &&
      letters.some((l, j) => l !== String.fromCharCode(65 + j))
    )
      errors.push(`${path}.paragraphs: letters must run A, B, C… in order`);

    passage.paragraphs.forEach((paragraph, j) => {
      unique(paragraph.id, `${path}.paragraphs[${j}].id`);
      paragraph.sentences.forEach((sentence, k) =>
        unique(sentence.id, `${path}.paragraphs[${j}].sentences[${k}].id`),
      );
    });

    passage.questionGroups.forEach((group, j) => {
      const groupPath = `${path}.questionGroups[${j}]`;
      unique(group.id, `${groupPath}.id`);
      checkGroup(errors, groupPath, passage, group);
      numbers.push(...groupNumbers(group));
    });
  });

  const expected = Array.from({ length: shape.questions }, (_, i) => i + 1);
  if (numbers.join() !== expected.join())
    errors.push(
      `questions: numbers must run 1 to ${shape.questions} once each, in order (found ${numbers.join(", ")})`,
    );
}

function checkGroup(
  errors: string[],
  path: string,
  passage: Passage,
  group: QuestionGroup,
) {
  switch (group.type) {
    case "multipleChoiceMulti":
      group.items.forEach((item, i) => {
        if (item.numbers.length < 2)
          errors.push(
            `${path}.items[${i}].numbers: covers at least two questions`,
          );
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
    case "matchingHeadings": {
      const paragraphIds = new Set(
        passage.paragraphs.filter((p) => p.letter).map((p) => p.id),
      );
      group.questions.forEach((q, i) => {
        if (!paragraphIds.has(q.paragraphId))
          errors.push(
            `${path}.questions[${i}].paragraphId: not a lettered paragraph of this passage`,
          );
      });
      if (group.options.length < group.questions.length)
        errors.push(`${path}.options: fewer headings than paragraphs to match`);
      return;
    }
    case "matchingInformation":
      if (passage.paragraphs.some((p) => !p.letter))
        errors.push(`${path}: matching information needs lettered paragraphs`);
      return;
    case "matchingSentenceEndings":
      if (group.options.length < group.questions.length)
        errors.push(`${path}.options: fewer endings than sentences`);
      return;
    case "summaryWordBox":
      if (group.options.length < gapNumbers(group.text).length)
        errors.push(`${path}.options: fewer words than gaps`);
      if (gapNumbers(group.text).length === 0)
        errors.push(`${path}.text: has no gap`);
      return;
    case "summaryCompletion":
      if (gapNumbers(group.text).length === 0)
        errors.push(`${path}.text: has no gap`);
      return;
    case "noteCompletion":
      if (group.lines.flatMap(gapNumbers).length === 0)
        errors.push(`${path}.lines: have no gap`);
      return;
    case "sentenceCompletion":
      group.sentences.forEach((s, i) => {
        if (gapNumbers(s).length !== 1)
          errors.push(`${path}.sentences[${i}]: needs exactly one gap`);
      });
      return;
    default:
      return;
  }
}
