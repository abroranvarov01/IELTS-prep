import {
  type AnswerKeyEntry,
  type Passage,
  type QuestionUnit,
  type ReadingAttempt,
  type ReadingTest,
  type ResultRecord,
  type UnitOutcome,
  unitOutcomes,
} from "@/entities/reading";

// The evidence-first review (READING_EXPERIENCE.md, Evidence-first review
// (M5)): which cards it walks through, and what a card shows of the key and
// the learner's pins. Pure; the review screen renders it.

/** One answer unit; `marks` says "1 of 2 correct" for a partly correct item. */
export type ReviewCard = {
  unit: QuestionUnit;
  outcome: UnitOutcome;
  marks: number;
};

/** Every card of an attempt, in question order. */
export function reviewCards(
  test: ReadingTest,
  attempt: ReadingAttempt,
  record: ResultRecord,
): ReviewCard[] {
  return unitOutcomes(test, attempt, record).map(({ unit, outcome }) => ({
    unit,
    outcome,
    marks: unit.numbers.filter((n) => record.outcomes[n] === "correct").length,
  }));
}

/** `mistakes`: every card not fully correct or unanswered; `all`: every card (D8). */
export type ReviewSet = "mistakes" | "all";

/** Where the review is: the sequence it walks and the card shown. */
export type ReviewPosition = {
  /** Every card, for the navigator. */
  all: ReviewCard[];
  set: ReviewSet;
  /** The sequence Previous and Next walk. */
  cards: ReviewCard[];
  index: number;
};

/**
 * The review's position from its address (`set`, `q`). The red button's
 * sequence holds every card that is not fully correct or has no answer, in
 * question order; with none, every card. A question number opens its unit's
 * card, in every card's order when the sequence does not hold it (as the
 * navigator does); an unknown number opens the sequence's first card.
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

/**
 * The key's sentences for a unit: evidence, or for a NOT GIVEN answer the
 * sentences where the passage talks about the topic, never proof (D10).
 * NOT GIVEN may cite none.
 */
export function keySentences(entry: AnswerKeyEntry | undefined): {
  kind: "evidence" | "related";
  sentenceIds: string[];
} {
  return {
    kind: entry?.accept[0] === NOT_GIVEN ? "related" : "evidence",
    sentenceIds: entry?.evidence ?? [],
  };
}

/**
 * "Your evidence" in review: the sentences pinned to any of the unit's numbers
 * and one statement about agreement with the key's cited sentences only.
 * Undefined without pins (Exam attempts have none).
 */
export function pinComparison(
  unit: QuestionUnit,
  attempt: ReadingAttempt,
  entry: AnswerKeyEntry | undefined,
):
  | { sentenceIds: string[]; agreement?: "match" | "miss" | "notGiven" }
  | undefined {
  const sentenceIds = [
    ...new Set(unit.numbers.flatMap((n) => attempt.pins[String(n)] ?? [])),
  ];
  if (sentenceIds.length === 0) return undefined;
  if (entry?.accept[0] === NOT_GIVEN)
    return { sentenceIds, agreement: "notGiven" };
  if (!entry || entry.evidence.length === 0) return { sentenceIds };
  return {
    sentenceIds,
    agreement: sentenceIds.some((id) => entry.evidence.includes(id))
      ? "match"
      : "miss",
  };
}

/**
 * Sentences quoted from a passage, in passage order, each with its paragraph:
 * its letter, or its position when the passage has no letters.
 */
export function quotesOf(
  passage: Passage,
  sentenceIds: readonly string[],
): { id: string; text: string; paragraph: string }[] {
  return passage.paragraphs.flatMap((paragraph, index) =>
    paragraph.sentences
      .filter((sentence) => sentenceIds.includes(sentence.id))
      .map((sentence) => ({
        ...sentence,
        paragraph: paragraph.letter ?? String(index + 1),
      })),
  );
}

const NOT_GIVEN = "NOT GIVEN";
