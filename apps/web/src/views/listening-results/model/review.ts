import {
  type KeyEntry,
  type ListeningKey,
  type ListeningTest,
  type QuestionGroup,
  type QuestionUnit,
  type ResultRecord,
  type Segment,
  type Transcript,
  type UnitOutcome,
  unitOutcomes,
} from "@/entities/listening";
import type { GapSegment } from "@/shared/content/types";

// The evidence-first Listening review (LISTENING_EXPERIENCE.md,
// Evidence-first review (M9)): which cards it walks through, where each
// card's answer is heard, and what of the question a card shows. Pure; the
// review screen renders it.

/** One answer unit; `marks` says "1 of 2 correct" for a partly correct unit. */
export type ReviewCard = {
  unit: QuestionUnit;
  outcome: UnitOutcome;
  marks: number;
};

/** Every card of an attempt, in question order (a "List TWO" question once). */
export function reviewCards(
  test: ListeningTest,
  record: ResultRecord,
): ReviewCard[] {
  return unitOutcomes(test, record).map(({ unit, outcome }) => ({
    unit,
    outcome,
    marks: unit.numbers.filter((n) => record.outcomes[n] === "correct").length,
  }));
}

/** `mistakes`: every card not fully correct or unanswered; `all`: every card. */
export type ReviewSet = "mistakes" | "all";

export type ReviewPosition = {
  /** Every card, for the navigator. */
  all: ReviewCard[];
  set: ReviewSet;
  /** The sequence Previous and Next walk. */
  cards: ReviewCard[];
  index: number;
};

/**
 * The review's position from its address (`set`, `q`), as Reading's D8: the
 * red button's sequence holds every card not fully correct or unanswered, in
 * question order (with none, every card); a question number opens its card,
 * in every card's order when the sequence does not hold it; an unknown
 * number opens the sequence's first card.
 */
export function reviewPosition(
  all: ReviewCard[],
  setParam: string | null,
  questionParam: string | null,
): ReviewPosition {
  const mistakes = all.filter((card) => card.outcome !== "correct");
  const wanted: ReviewSet = setParam === "all" ? "all" : "mistakes";
  const set = mistakes.length === 0 ? "all" : wanted;
  const cards = set === "all" ? all : mistakes;
  const number = Number(questionParam);
  const index = cards.findIndex((card) => card.unit.numbers.includes(number));
  if (index >= 0) return { all, set, cards, index };
  const inAll = all.findIndex((card) => card.unit.numbers.includes(number));
  return inAll >= 0
    ? { all, set: "all", cards: all, index: inAll }
    : { all, set, cards, index: 0 };
}

/** Where a unit's answer is heard: each evidence segment once, in recording order, with its quotes. */
export type HeardEvidence = { segment: Segment; quotes: string[] };

export function evidenceOf(
  unit: QuestionUnit,
  key: ListeningKey,
  transcript: Transcript,
): HeardEvidence[] {
  const segments = transcript.parts[unit.partNumber - 1]?.segments ?? [];
  const byId = new Map<string, HeardEvidence>();
  for (const n of unit.numbers)
    for (const e of key.answers[n]?.evidence ?? []) {
      const segment = segments.find((s) => s.id === e.segment);
      if (!segment) continue;
      const found = byId.get(segment.id) ?? { segment, quotes: [] };
      if (!found.quotes.includes(e.quote)) found.quotes.push(e.quote);
      byId.set(segment.id, found);
    }
  return [...byId.values()].sort(
    (a, b) => a.segment.startMs - b.segment.startMs,
  );
}

/** The 3-second lead-in of review playback, never before the recording starts (owner, LD8). */
export const LEAD_IN_MS = 3000;

export function evidenceStretch(segment: Segment): {
  fromMs: number;
  toMs: number;
} {
  return {
    fromMs: Math.max(0, segment.startMs - LEAD_IN_MS),
    toMs: segment.endMs,
  };
}

/** A segment's text split around its quotes, so the evidence phrase can be marked. */
export function markQuotes(
  text: string,
  quotes: string[],
): { text: string; mark: boolean }[] {
  const parts: { text: string; mark: boolean }[] = [];
  let rest = text;
  for (;;) {
    const hits = quotes
      .map((q) => ({ q, at: rest.indexOf(q) }))
      .filter((h) => h.at >= 0)
      .sort((a, b) => a.at - b.at);
    const hit = hits[0];
    if (!hit) break;
    if (hit.at > 0) parts.push({ text: rest.slice(0, hit.at), mark: false });
    parts.push({ text: hit.q, mark: true });
    rest = rest.slice(hit.at + hit.q.length);
  }
  if (rest) parts.push({ text: rest, mark: false });
  return parts;
}

/**
 * The part of a group that holds a gap, as a review card shows it: the
 * sentence, note line or flow-chart step; a form line with its label; a
 * table row with its column headings. Undefined for types without a text.
 */
export type GapContext =
  | { kind: "line"; segments: GapSegment[]; label?: string }
  | { kind: "lines"; lines: GapSegment[][] }
  | {
      kind: "row";
      heading?: GapSegment[];
      cells: { column: string; segments: GapSegment[] }[];
    };

const holds = (segments: GapSegment[], number: number) =>
  segments.some((s) => "gap" in s && s.gap === number);

export function gapContext(
  group: QuestionGroup,
  number: number,
): GapContext | undefined {
  switch (group.type) {
    case "sentenceCompletion": {
      const sentence = group.sentences.find((s) => holds(s, number));
      return sentence && { kind: "line", segments: sentence };
    }
    case "noteCompletion": {
      const line = group.lines.find(
        (l): l is GapSegment[] => Array.isArray(l) && holds(l, number),
      );
      return line && { kind: "line", segments: line };
    }
    case "formCompletion": {
      const line = group.lines.find((l) => holds(l.value, number));
      return line && { kind: "line", segments: line.value, label: line.label };
    }
    case "flowChartCompletion": {
      const step = group.steps.find((lines) =>
        lines.some((l) => holds(l, number)),
      );
      return step && { kind: "lines", lines: step };
    }
    case "tableCompletion": {
      const row = group.rows.find((r) => r.cells.some((c) => holds(c, number)));
      if (!row) return undefined;
      const [first, ...rest] = row.cells;
      const headed = group.rowHeaders && first;
      return {
        kind: "row",
        ...(headed && { heading: first }),
        cells: (headed ? rest : row.cells).map((segments, i) => ({
          column: group.columns[headed ? i + 1 : i] ?? "",
          segments,
        })),
      };
    }
    default:
      return undefined;
  }
}

/**
 * The review's audio for a part (owner, M9-04 clarification): a valid cached
 * copy first, otherwise the network; with neither, none, and the review says
 * the recording is not available. Offline playback is never promised.
 */
export function reviewAudioSource({
  cached,
  online,
  networkUrl,
}: {
  cached: string | undefined;
  online: boolean;
  networkUrl: string;
}): string | undefined {
  return cached ?? (online ? networkUrl : undefined);
}

/** The verified mention that matches the learner's answer, for the `mentionedOption` note (LD13). */
export function mentionedBy(
  entries: KeyEntry[],
  answers: string[],
  normalize: (text: string) => string,
) {
  return entries
    .flatMap((e) => e.distractors ?? [])
    .filter((d) => d.review === "verified")
    .find((d) =>
      "option" in d
        ? answers.includes(d.option)
        : answers.map(normalize).includes(normalize(d.text)),
    );
}
