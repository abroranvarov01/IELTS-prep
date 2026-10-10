import { describe, expect, it } from "vitest";
import { type QuestionType, QUESTION_COUNT } from "./content";
import { parseAnswerKey, parseReadingTest } from "./parse-content";

// Minimal original fixtures, written for these tests (INVARIANTS I-5).
const statements = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({
    number: from + i,
    statement: `Statement ${from + i}.`,
  }));
const options = (ids: string[]) =>
  ids.map((id) => ({ id, text: `Option ${id}` }));
const paragraph = (id: string, letter?: string) => ({
  id,
  ...(letter && { letter }),
  sentences: [
    { id: `${id}-s1`, text: "One sentence." },
    { id: `${id}-s2`, text: "Another sentence." },
  ],
});
const limit = { words: 2, numbers: true };

/** A valid test with three passages, 40 questions and every question type. */
function validTest() {
  return {
    id: "fixture-test",
    version: 1,
    title: "Fixture test",
    examType: "academic",
    durationMinutes: 60,
    origin: { kind: "original", author: "Tests" },
    passages: [
      {
        id: "p1",
        number: 1,
        title: "Passage one",
        paragraphs: [
          paragraph("p1-a", "A"),
          paragraph("p1-b", "B"),
          paragraph("p1-c", "C"),
        ],
        questionGroups: [
          {
            id: "g1",
            type: "trueFalseNotGiven",
            instruction: "TFNG.",
            questions: statements(1, 2),
          },
          {
            id: "g2",
            type: "multipleChoice",
            instruction: "Choose A–C.",
            questions: [
              { number: 3, stem: "Which?", options: options(["A", "B", "C"]) },
            ],
          },
          {
            id: "g3",
            type: "multipleChoiceMulti",
            instruction: "Choose TWO letters.",
            items: [
              {
                numbers: [4, 5],
                stem: "Which two?",
                options: options(["A", "B", "C", "D", "E"]),
              },
            ],
          },
          {
            id: "g4",
            type: "matchingHeadings",
            instruction: "Choose headings.",
            options: options(["i", "ii", "iii"]),
            questions: [
              { number: 6, paragraphId: "p1-a" },
              { number: 7, paragraphId: "p1-b" },
            ],
          },
          {
            id: "g5",
            type: "matchingInformation",
            instruction: "Which paragraph?",
            allowRepeat: true,
            questions: statements(8, 9),
          },
          {
            id: "g6",
            type: "matchingFeatures",
            instruction: "Match features.",
            options: options(["A", "B", "C"]),
            allowRepeat: false,
            questions: statements(10, 11),
          },
          {
            id: "g7",
            type: "matchingSentenceEndings",
            instruction: "Complete each sentence.",
            options: options(["A", "B", "C"]),
            questions: [
              { number: 12, start: "Bees" },
              { number: 13, start: "Ants" },
            ],
          },
        ],
      },
      {
        id: "p2",
        number: 2,
        title: "Passage two",
        paragraphs: [paragraph("p2-a"), paragraph("p2-b")],
        questionGroups: [
          {
            id: "g8",
            type: "summaryWordBox",
            instruction: "Choose words.",
            options: options(["A", "B", "C", "D"]),
            text: [
              { text: "First " },
              { gap: 14 },
              { text: " then " },
              { gap: 15 },
              { text: "." },
            ],
          },
          {
            id: "g9",
            type: "sentenceCompletion",
            instruction: "Complete the sentences.",
            wordLimit: limit,
            sentences: [
              [{ text: "Water is " }, { gap: 16 }],
              [{ gap: 17 }, { text: " grows fast." }],
            ],
          },
          {
            id: "g10",
            type: "summaryCompletion",
            instruction: "Complete the summary.",
            wordLimit: limit,
            title: "A summary",
            text: [{ gap: 18 }, { text: " and " }, { gap: 19 }],
          },
          {
            id: "g11",
            type: "noteCompletion",
            instruction: "Complete the notes.",
            wordLimit: limit,
            lines: [
              [{ text: "Cause: " }, { gap: 20 }],
              [{ text: "Effect: " }, { gap: 21 }],
            ],
          },
          {
            id: "g12",
            type: "shortAnswer",
            instruction: "Answer the questions.",
            wordLimit: limit,
            questions: [
              { number: 22, question: "What?" },
              { number: 23, question: "Where?" },
            ],
          },
          {
            id: "g13",
            type: "yesNoNotGiven",
            instruction: "YNNG.",
            questions: statements(24, 27),
          },
        ],
      },
      {
        id: "p3",
        number: 3,
        title: "Passage three",
        paragraphs: [paragraph("p3-a")],
        questionGroups: [
          {
            id: "g14",
            type: "trueFalseNotGiven",
            instruction: "TFNG.",
            questions: statements(28, 40),
          },
        ],
      },
    ],
  };
}

function errorsOf(input: unknown) {
  const result = parseReadingTest(input);
  return result.ok ? [] : result.errors;
}

describe("parseReadingTest", () => {
  it("accepts a test that uses every question type", () => {
    const result = parseReadingTest(validTest());

    expect(result.ok).toBe(true);
    const types = new Set<QuestionType>(
      result.ok
        ? result.value.passages.flatMap((p) =>
            p.questionGroups.map((g) => g.type),
          )
        : [],
    );
    expect(types.size).toBe(13);
  });

  it("rejects something that is not a test", () => {
    expect(errorsOf("hello")).toEqual(["test: expected an object"]);
    expect(errorsOf(null)).toEqual(["test: expected an object"]);
  });

  it("requires the content's origin (original or licensed only)", () => {
    const test: Record<string, unknown> = validTest();
    delete test.origin;
    expect(errorsOf(test)).toEqual([
      "origin: required (original or licensed content only, INVARIANTS I-5)",
    ]);
  });

  it("names the path of a malformed value", () => {
    const test = validTest();
    test.passages[1]!.paragraphs[0]!.sentences[1]!.text = "";
    expect(errorsOf(test)).toEqual([
      "passages[1].paragraphs[0].sentences[1].text: expected a non-empty string",
    ]);
  });

  it("rejects an unknown question type", () => {
    const test = validTest();
    (test.passages[2]!.questionGroups[0] as { type: string }).type =
      "tableCompletion";
    expect(errorsOf(test)).toEqual([
      'passages[2].questionGroups[0].type: unknown question type "tableCompletion"',
    ]);
  });

  it(`requires ${QUESTION_COUNT} questions numbered 1 to ${QUESTION_COUNT} in order`, () => {
    const missing = validTest();
    (
      missing.passages[2]!.questionGroups[0] as { questions: unknown[] }
    ).questions.pop();
    expect(errorsOf(missing)[0]).toMatch(
      /^questions: numbers must run 1 to 40/,
    );

    const swapped = validTest();
    const first = swapped.passages[0]!.questionGroups[0] as {
      questions: { number: number }[];
    };
    first.questions[0]!.number = 2;
    first.questions[1]!.number = 1;
    expect(errorsOf(swapped)[0]).toMatch(
      /^questions: numbers must run 1 to 40/,
    );
  });

  it("requires three passages numbered in order", () => {
    const test = validTest();
    test.passages[1]!.number = 3;
    expect(errorsOf(test)).toContain("passages[1].number: expected 2");

    const short = validTest();
    short.passages.pop();
    expect(errorsOf(short)).toContain(
      "passages: a Reading test has 3 passages",
    );
  });

  it("rejects an id used twice, because highlights and pins refer to ids", () => {
    const test = validTest();
    test.passages[2]!.paragraphs[0]!.sentences[1]!.id = "p3-a-s1";
    expect(errorsOf(test)).toEqual([
      'passages[2].paragraphs[0].sentences[1].id: the id "p3-a-s1" is used twice',
    ]);
  });

  it("rejects ids that cannot be used in addresses and storage keys", () => {
    const test = validTest();
    test.id = "fixture test";
    expect(errorsOf(test)).toEqual([
      "id: expected an id of letters, digits and hyphens",
    ]);
  });

  it("requires paragraph letters on every paragraph or none, in order", () => {
    const mixed = validTest();
    delete (mixed.passages[0]!.paragraphs[2] as { letter?: string }).letter;
    expect(errorsOf(mixed)).toContain(
      "passages[0].paragraphs: give every paragraph a letter, or none",
    );

    const unordered = validTest();
    unordered.passages[0]!.paragraphs[1]!.letter = "C";
    unordered.passages[0]!.paragraphs[2]!.letter = "B";
    expect(errorsOf(unordered)).toContain(
      "passages[0].paragraphs: letters must run A, B, C… in order",
    );
  });

  it("checks the references of matching questions", () => {
    const heading = validTest();
    (
      heading.passages[0]!.questionGroups[3] as {
        questions: { paragraphId: string }[];
      }
    ).questions[0]!.paragraphId = "p2-a";
    expect(errorsOf(heading)).toEqual([
      "passages[0].questionGroups[3].questions[0].paragraphId: not a lettered paragraph of this passage",
    ]);

    const information = validTest();
    information.passages[0]!.paragraphs.forEach(
      (p) => delete (p as { letter?: string }).letter,
    );
    expect(errorsOf(information)).toContain(
      "passages[0].questionGroups[4]: matching information needs lettered paragraphs",
    );
  });

  it("requires exactly one gap per sentence in sentence completion", () => {
    const test = validTest();
    (
      test.passages[1]!.questionGroups[1] as { sentences: unknown[][] }
    ).sentences[0] = [{ text: "No gap here." }];
    const errors = errorsOf(test);
    expect(errors).toContain(
      "passages[1].questionGroups[1].sentences[0]: needs exactly one gap",
    );
  });

  it("checks 'choose several' items", () => {
    const test = validTest();
    const item = (
      test.passages[0]!.questionGroups[2] as {
        items: { numbers: number[]; options: unknown[] }[];
      }
    ).items[0]!;
    item.options = options(["A", "B"]);
    expect(errorsOf(test)).toEqual([
      "passages[0].questionGroups[2].items[0].options: needs more options than answers to choose",
    ]);
  });

  it("requires a word limit for typed answers and unique option ids", () => {
    const test = validTest();
    delete (test.passages[1]!.questionGroups[4] as { wordLimit?: unknown })
      .wordLimit;
    (
      test.passages[0]!.questionGroups[5] as { options: { id: string }[] }
    ).options[1]!.id = "A";
    // Errors come in document order.
    expect(errorsOf(test)).toEqual([
      "passages[0].questionGroups[5].options: option ids must be unique",
      "passages[1].questionGroups[4].wordLimit: required for typed answers",
    ]);
  });
});

describe("parseAnswerKey", () => {
  const test = (() => {
    const result = parseReadingTest(validTest());
    if (!result.ok) throw new Error(result.errors.join("\n"));
    return result.value;
  })();

  function validKey() {
    const answers: Record<string, { accept: string[]; evidence: string[] }> =
      {};
    for (let n = 1; n <= QUESTION_COUNT; n++) {
      const passage = n <= 13 ? "p1-a" : n <= 27 ? "p2-a" : "p3-a";
      answers[n] = { accept: ["x"], evidence: [`${passage}-s1`] };
    }
    const set = (n: number, accept: string[]) => (answers[n]!.accept = accept);
    [1, 2, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].forEach((n) =>
      set(n, ["TRUE"]),
    );
    set(3, ["B"]);
    set(4, ["A", "C"]);
    set(5, ["A", "C"]);
    set(6, ["ii"]);
    set(7, ["i"]);
    set(8, ["C"]);
    set(9, ["A"]);
    set(10, ["B"]);
    set(11, ["A"]);
    set(12, ["C"]);
    set(13, ["A"]);
    set(14, ["D"]);
    set(15, ["B"]);
    [24, 25, 26, 27].forEach((n) => set(n, ["NOT GIVEN"]));
    return { testId: "fixture-test", version: 1, answers };
  }

  it("accepts a key with valid answers and evidence for every question", () => {
    expect(parseAnswerKey(test, validKey()).ok).toBe(true);
  });

  it("rejects answers that are not options of their question", () => {
    const key = validKey();
    key.answers[1]!.accept = ["NOT GIVEN", "MAYBE"];
    key.answers[24]!.accept = ["FALSE"];
    const result = parseAnswerKey(test, key);
    expect(result.ok ? [] : result.errors).toEqual([
      'key.answers.1.accept: "MAYBE" is not an option of question 1',
      'key.answers.24.accept: "FALSE" is not an option of question 24',
    ]);
  });

  it("rejects evidence that is not a sentence of the question's passage", () => {
    const key = validKey();
    key.answers[2]!.evidence = ["p2-a-s1"];
    const result = parseAnswerKey(test, key);
    expect(result.ok ? [] : result.errors).toEqual([
      'key.answers.2.evidence: "p2-a-s1" is not a sentence of passage 1',
    ]);
  });

  it("requires every question once, and only questions of the test", () => {
    const key = validKey();
    delete key.answers[40];
    key.answers[41] = { accept: ["TRUE"], evidence: ["p3-a-s1"] };
    const result = parseAnswerKey(test, key);
    expect(result.ok ? [] : result.errors).toEqual([
      "key.answers.40: missing",
      "key.answers.41: no such question",
    ]);
  });

  it("belongs to one test version", () => {
    const key = { ...validKey(), version: 2 };
    const result = parseAnswerKey(test, key);
    expect(result.ok ? [] : result.errors).toEqual(["key.version: expected 1"]);
  });
});
