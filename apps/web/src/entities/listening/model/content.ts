/**
 * The Listening content contract (ADR-0012): a test, its transcript and its
 * answer key, as the engine renders and checks them. Content is untrusted
 * data; parse it with `parseListeningTest`.
 */
import type { ReviewStatus } from "@/shared/content/parse";
import {
  type FlowChartShape,
  type GapAnswer,
  type LabellingShape,
  type Provenance,
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

/** One AAC-LC file per part (ADR-0012 §3). */
export type AudioAsset = {
  src: string;
  mimeType: "audio/mp4";
  durationMs: number;
  bytes: number;
  sha256: string;
  provenance: Provenance;
};

type GroupBase = { id: string; instruction: string };

/** A note line is text with gaps, or a heading without a gap. */
export type NoteLine = GapSegment[] | { heading: string };

export type QuestionGroup =
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
      type: "matchingFeatures";
      options: Option[];
      allowRepeat: boolean;
      questions: { number: number; statement: string }[];
    })
  | (GroupBase & {
      /** Each sentence has exactly one gap; its number is the question's. */
      type: "sentenceCompletion";
      sentences: GapSegment[][];
      answer: GapAnswer;
    })
  | (GroupBase & {
      type: "noteCompletion";
      title?: string;
      lines: NoteLine[];
      answer: GapAnswer;
    })
  | (GroupBase & {
      type: "formCompletion";
      title?: string;
      lines: { label: string; value: GapSegment[] }[];
      answer: GapAnswer;
    })
  | (GroupBase & {
      /** "List TWO …": one question text may have up to three numbers. */
      type: "shortAnswer";
      wordLimit: WordLimit;
      questions: { numbers: number[]; question: string }[];
    })
  | (GroupBase & TableShape & { type: "tableCompletion"; answer: GapAnswer })
  | (GroupBase &
      FlowChartShape & { type: "flowChartCompletion"; answer: GapAnswer })
  | (GroupBase & LabellingShape & { type: "labelling" });

export type QuestionType = QuestionGroup["type"];

export type Part = {
  id: string;
  number: number;
  audio: AudioAsset;
  questionGroups: QuestionGroup[];
};

export type ListeningTest = {
  id: string;
  version: number;
  title: string;
  origin: Origin;
  /** Temporary practice content, labelled as such (owner, M8-06). */
  temporary?: true;
  parts: Part[];
};

/** Times are in milliseconds from the start of the part's file. */
export type Segment = {
  id: string;
  startMs: number;
  endMs: number;
  speaker: string;
  text: string;
};

export type Transcript = {
  testId: string;
  version: number;
  revision: number;
  review: { status: ReviewStatus };
  parts: { partId: string; segments: Segment[] }[];
};

/** The phrase in a transcript segment that gives the answer (ADR-0012 §5). */
export type Evidence = { segment: string; quote: string };

export type ListeningKey = {
  testId: string;
  version: number;
  revision: number;
  review: { status: ReviewStatus };
  answers: Record<number, { accept: string[]; evidence: Evidence[] }>;
};

/** A Listening test has 4 parts of 10 questions (IELTS test format). */
export const PART_COUNT = 4;
export const QUESTIONS_PER_PART = 10;

/** The question numbers of a group, in order. */
export function groupNumbers(group: QuestionGroup): number[] {
  switch (group.type) {
    case "multipleChoiceMulti":
      return group.items.flatMap((item) => item.numbers);
    case "shortAnswer":
      return group.questions.flatMap((question) => question.numbers);
    case "sentenceCompletion":
      return group.sentences.flatMap(gapNumbers);
    case "noteCompletion":
      return group.lines.flatMap((line) =>
        Array.isArray(line) ? gapNumbers(line) : [],
      );
    case "formCompletion":
      return group.lines.flatMap((line) => gapNumbers(line.value));
    case "tableCompletion":
      return tableNumbers(group);
    case "flowChartCompletion":
      return flowChartNumbers(group);
    default:
      return group.questions.map((question) => question.number);
  }
}
