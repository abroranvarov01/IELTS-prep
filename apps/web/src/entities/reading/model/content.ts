/**
 * The Reading content contract (ADR-0005): what a test is, as the engine
 * renders it. Content is untrusted data; parse it with `parseReadingTest`.
 */

import {
  type FlowChartShape,
  type TableShape,
  flowChartNumbers,
  tableNumbers,
} from "@/shared/content/shapes";
import {
  type GapSegment,
  type Option,
  type Origin,
  type WordLimit,
  gapNumbers,
} from "@/shared/content/types";

export {
  type GapSegment,
  type Option,
  type Origin,
  type WordLimit,
  gapNumbers,
} from "@/shared/content/types";

export type ExamType = "academic" | "general";

export type Sentence = { id: string; text: string };

/** `letter` (A, B, …) is set on every paragraph of a passage or on none. */
export type Paragraph = { id: string; letter?: string; sentences: Sentence[] };

type GroupBase = { id: string; instruction: string };

export type StatementQuestion = { number: number; statement: string };

export type QuestionGroup =
  | (GroupBase & {
      type: "trueFalseNotGiven" | "yesNoNotGiven";
      questions: StatementQuestion[];
    })
  | (GroupBase & {
      type: "multipleChoice";
      questions: { number: number; stem: string; options: Option[] }[];
    })
  | (GroupBase & {
      type: "multipleChoiceMulti";
      /** One item covers several numbers; choose as many options as numbers. */
      items: { numbers: number[]; stem: string; options: Option[] }[];
    })
  | (GroupBase & {
      type: "matchingHeadings";
      options: Option[];
      questions: { number: number; paragraphId: string }[];
    })
  | (GroupBase & {
      /** The options are the passage's paragraph letters. */
      type: "matchingInformation";
      allowRepeat: boolean;
      questions: StatementQuestion[];
    })
  | (GroupBase & {
      type: "matchingFeatures";
      options: Option[];
      allowRepeat: boolean;
      questions: StatementQuestion[];
    })
  | (GroupBase & {
      type: "matchingSentenceEndings";
      options: Option[];
      questions: { number: number; start: string }[];
    })
  | (GroupBase & {
      type: "summaryWordBox";
      options: Option[];
      title?: string;
      text: GapSegment[];
    })
  | (GroupBase & {
      /** Each sentence has exactly one gap; its number is the question's. */
      type: "sentenceCompletion";
      wordLimit: WordLimit;
      sentences: GapSegment[][];
    })
  | (GroupBase & {
      type: "summaryCompletion";
      wordLimit: WordLimit;
      title?: string;
      text: GapSegment[];
    })
  | (GroupBase & {
      type: "noteCompletion";
      wordLimit: WordLimit;
      title?: string;
      lines: GapSegment[][];
    })
  | (GroupBase & {
      type: "shortAnswer";
      wordLimit: WordLimit;
      questions: { number: number; question: string }[];
    })
  | (GroupBase &
      TableShape & {
        /** The shared table layout (ADR-0012 §2), typed gaps in its cells. */
        type: "tableCompletion";
        wordLimit: WordLimit;
      })
  | (GroupBase &
      FlowChartShape & {
        /** The shared flow-chart layout (ADR-0012 §2), typed gaps in its steps. */
        type: "flowChartCompletion";
        wordLimit: WordLimit;
      });

export type QuestionType = QuestionGroup["type"];

export type Passage = {
  id: string;
  number: number;
  title: string;
  paragraphs: Paragraph[];
  questionGroups: QuestionGroup[];
};

export type ReadingTest = {
  id: string;
  version: number;
  title: string;
  examType: ExamType;
  durationMinutes: number;
  origin: Origin;
  passages: Passage[];
};

/** A Reading test always has 3 passages and 40 questions (IELTS test format). */
export const PASSAGE_COUNT = 3;
export const QUESTION_COUNT = 40;

/** The answer words of the statement types, exactly as in the test. */
export const STATEMENT_ANSWERS = {
  trueFalseNotGiven: ["TRUE", "FALSE", "NOT GIVEN"],
  yesNoNotGiven: ["YES", "NO", "NOT GIVEN"],
} as const;

/** The scoring positions of a test or form: 40 for a test, 14 for the level-check form. */
export function positionCount(test: ReadingTest): number {
  return test.passages.reduce(
    (count, passage) =>
      count +
      passage.questionGroups.reduce(
        (n, group) => n + groupNumbers(group).length,
        0,
      ),
    0,
  );
}

/** The question numbers of a group, in order. */
export function groupNumbers(group: QuestionGroup): number[] {
  switch (group.type) {
    case "multipleChoiceMulti":
      return group.items.flatMap((item) => item.numbers);
    case "summaryWordBox":
    case "summaryCompletion":
      return gapNumbers(group.text);
    case "sentenceCompletion":
      return group.sentences.flatMap(gapNumbers);
    case "noteCompletion":
      return group.lines.flatMap(gapNumbers);
    case "tableCompletion":
      return tableNumbers(group);
    case "flowChartCompletion":
      return flowChartNumbers(group);
    default:
      return group.questions.map((question) => question.number);
  }
}
