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

/** What a question tests, never a judgment of the learner (LISTENING_EXPERIENCE.md, Error Intelligence (M9)). */
export const CONTENT_TAGS = ["paraphrase", "spelledOut", "correction"] as const;
export type ContentTag = (typeof CONTENT_TAGS)[number];

/**
 * Something the recording mentions that is not the answer, where it is said
 * (ADR-0014 §7). Shown to learners only once a person has verified the claim
 * and its timestamp against the recording (owner decision LD13).
 */
export type Distractor = ({ option: string } | { text: string }) & {
  segment: string;
  quote: string;
  review: "aiDraft" | "verified";
};

export type KeyEntry = {
  accept: string[];
  evidence: Evidence[];
  /** The instruction requires the recording's own words (`notInTranscript`). */
  fromRecording?: true;
  tag?: ContentTag;
  distractors?: Distractor[];
  /** On a "List TWO" question's first number: its answers count in order (LD6). */
  ordered?: true;
};

export type ListeningKey = {
  testId: string;
  version: number;
  revision: number;
  /** The transcript revision the key was checked against (ADR-0014 §7). */
  transcriptRevision: number;
  review: { status: ReviewStatus };
  answers: Record<number, KeyEntry>;
};

/** A Listening test has 4 parts of 10 questions (IELTS test format). */
export const PART_COUNT = 4;
export const QUESTIONS_PER_PART = 10;

/** The word limit of a group's typed answers, or undefined when its answers are chosen. */
export function typedWordLimit(group: QuestionGroup): WordLimit | undefined {
  if (group.type === "shortAnswer") return group.wordLimit;
  if ("answer" in group && group.answer.kind === "typed")
    return group.answer.wordLimit;
  return undefined;
}

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
