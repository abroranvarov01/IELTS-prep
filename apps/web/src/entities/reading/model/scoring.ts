import { type ReadingTest, STATEMENT_ANSWERS } from "./content";
import type { AnswerKey, AnswerKeyEntry } from "./parse-content";
import type { Answer, ReadingSession } from "./session";
import { type QuestionUnit, questionUnits } from "./units";
import { fitsWordLimit } from "./word-limit";

/**
 * Answer checking (ADR-0008 §1; READING_EXPERIENCE.md, Answer checking (M5)).
 * Rules marked as owner decisions are product policy, not official IELTS rules.
 * Nothing here converts a raw score to a band (owner decision D1).
 */

/**
 * The comparable form of a typed answer or an accepted variant. Mechanical
 * only: spelling, word forms and optional words are decided by the variants
 * listed in the key, never here.
 * - Letter case is ignored: "Capitalization is not important on the Reading
 *   test" (IDP, "IELTS Focus: Academic Reading", p. 44).
 * - Surrounding and repeated spaces, typographic apostrophes and the Unicode
 *   hyphens that phone keyboards insert are not differences in the answer.
 * - One trailing full stop is ignored, because phone keyboards add one after
 *   a double space (owner decision D2; no official rule exists). Commas,
 *   semicolons, colons and every other mark are kept.
 */
export function normalizeTypedAnswer(text: string): string {
  const collapsed = text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u2010\u2011]/g, "-")
    .trim()
    .replace(/\s+/g, " ");
  return collapsed.endsWith(".") ? collapsed.slice(0, -1).trimEnd() : collapsed;
}

/**
 * Increases whenever a change here could change a mark, an outcome or a
 * signal for the same answers, key and content (ADR-0008 §1), bug fixes
 * included. Every stored result records it (ADR-0009 §7).
 */
export const SCORING_RULES_VERSION = 1;

/** The outcome of one scoring position (one question number, one mark). */
export type Outcome = "correct" | "incorrect" | "unanswered";

/** What the learner sees for an answer unit (a question, or a "choose several" item). */
export type UnitOutcome =
  "correct" | "partlyCorrect" | "incorrect" | "unanswered";

/** A practice score on our own content: marks out of scoring positions, never a band. */
export type PracticeRawScore = {
  kind: "practiceRawScore";
  marks: number;
  positions: number;
};

/** An observable fact about an answer (READING_EXPERIENCE.md, Error Intelligence (M5)). */
export type Signal =
  | {
      code:
        | "ngInsteadOfFalse"
        | "falseInsteadOfNg"
        | "ngInsteadOfTrue"
        | "trueInsteadOfNg";
      /** TRUE/FALSE/NOT GIVEN is about information, YES/NO/NOT GIVEN about the writer's views. */
      wording: "facts" | "views";
    }
  | {
      code:
        | "oneLetterAway"
        | "wordLimit"
        | "notFromPassage"
        | "timeUp"
        | "pinnedElsewhere";
    };

export type CheckResult = {
  /** By question number. */
  outcomes: Record<number, Outcome>;
  /** By unit key (its first question number); only units with signals. */
  signals: Record<string, Signal[]>;
  score: PracticeRawScore;
};

/** What a finished session or attempt holds that checking reads. */
export type CheckedAnswers = Pick<
  ReadingSession,
  "answers" | "pins" | "finishReason"
> & {
  /** A retry checks only these question numbers (whole units). */
  questions?: number[];
};

/**
 * Checks an attempt against the key: every M4 question type, one mark per
 * question number ("Each correct answer receives 1 mark": ielts.org Reading
 * format pages). Unanswered questions earn nothing and stay in the total.
 */
export function checkAttempt(
  test: ReadingTest,
  key: AnswerKey,
  attempt: CheckedAnswers,
): CheckResult {
  const outcomes: Record<number, Outcome> = {};
  const signals: Record<string, Signal[]> = {};
  let marks = 0;
  let positions = 0;
  for (const unit of questionUnits(test)) {
    if (
      attempt.questions &&
      !unit.numbers.every((n) => attempt.questions?.includes(n))
    )
      continue;
    const entry = key.answers[unit.numbers[0] ?? 0];
    if (!entry) continue;
    const answer = attempt.answers[unit.key];
    const unitMarks = marksFor(unit, answer, entry.accept);
    const chosen = chosenCount(unit, answer);
    unit.numbers.forEach((number, i) => {
      outcomes[number] =
        i < unitMarks ? "correct" : i < chosen ? "incorrect" : "unanswered";
    });
    marks += unitMarks;
    positions += unit.numbers.length;
    const found = signalsFor(test, unit, answer, entry, attempt, {
      marks: unitMarks,
      chosen,
    });
    if (found.length > 0) signals[unit.key] = found;
  }
  return {
    outcomes,
    signals,
    score: { kind: "practiceRawScore", marks, positions },
  };
}

/**
 * The unit's outcome from its positions' outcomes: correct when every mark
 * was earned, no answer when nothing was given, partly correct when some
 * marks were earned. Positions only count marks; they never name a letter.
 */
export function unitOutcome(outcomes: Outcome[]): UnitOutcome {
  const correct = outcomes.filter((o) => o === "correct").length;
  if (correct === outcomes.length) return "correct";
  if (outcomes.every((o) => o === "unanswered")) return "unanswered";
  return correct === 0 ? "incorrect" : "partlyCorrect";
}

/** How review labels an option of a choice or list question. */
export type OptionMark =
  "yourAnswerCorrect" | "yourAnswerIncorrect" | "correctAnswer";

/** Option-level correctness for review; options without a mark are left out. */
export function optionMarks(
  unit: QuestionUnit,
  answer: Answer | undefined,
  accept: string[],
): Record<string, OptionMark> {
  const chosen = chosenOptions(unit, answer);
  const marks: Record<string, OptionMark> = {};
  for (const id of unit.optionIds) {
    const isChosen = chosen.includes(id);
    const isAccepted = accept.includes(id);
    if (isChosen)
      marks[id] = isAccepted ? "yourAnswerCorrect" : "yourAnswerIncorrect";
    else if (isAccepted) marks[id] = "correctAnswer";
  }
  return marks;
}

function marksFor(
  unit: QuestionUnit,
  answer: Answer | undefined,
  accept: string[],
): number {
  if (unit.kind === "text") {
    if (typeof answer !== "string") return 0;
    const given = normalizeTypedAnswer(answer);
    return given !== "" &&
      accept.some((variant) => normalizeTypedAnswer(variant) === given)
      ? 1
      : 0;
  }
  // "Choose TWO": each correct letter is one mark, in either order (official
  // answer keys: "IN EITHER ORDER"); never more marks than numbers.
  const correct = new Set(
    chosenOptions(unit, answer).filter((id) => accept.includes(id)),
  ).size;
  return Math.min(correct, unit.numbers.length);
}

/** How many of the unit's positions have an answer. */
function chosenCount(unit: QuestionUnit, answer: Answer | undefined): number {
  if (unit.kind === "text")
    return typeof answer === "string" && answer.trim() !== "" ? 1 : 0;
  return Math.min(chosenOptions(unit, answer).length, unit.numbers.length);
}

/** The unit's options in the answer, each once; anything else is ignored. */
function chosenOptions(
  unit: QuestionUnit,
  answer: Answer | undefined,
): string[] {
  const ids = Array.isArray(answer) ? answer : answer ? [answer] : [];
  return [...new Set(ids)].filter((id) => unit.optionIds.includes(id));
}

const NOT_GIVEN = "NOT GIVEN";

function signalsFor(
  test: ReadingTest,
  unit: QuestionUnit,
  answer: Answer | undefined,
  entry: AnswerKeyEntry,
  attempt: CheckedAnswers,
  { marks, chosen }: { marks: number; chosen: number },
): Signal[] {
  if (chosen === 0)
    return attempt.finishReason === "timeUp" ? [{ code: "timeUp" }] : [];
  if (marks === unit.numbers.length) return [];

  const found: Signal[] = [];
  const { group } = unit;
  if (
    (group.type === "trueFalseNotGiven" || group.type === "yesNoNotGiven") &&
    typeof answer === "string"
  ) {
    const wording = group.type === "trueFalseNotGiven" ? "facts" : "views";
    const [positive, negative] = STATEMENT_ANSWERS[group.type];
    const expected = entry.accept[0];
    if (expected === NOT_GIVEN && answer === negative)
      found.push({ code: "falseInsteadOfNg", wording });
    else if (expected === NOT_GIVEN && answer === positive)
      found.push({ code: "trueInsteadOfNg", wording });
    else if (expected === negative && answer === NOT_GIVEN)
      found.push({ code: "ngInsteadOfFalse", wording });
    else if (expected === positive && answer === NOT_GIVEN)
      found.push({ code: "ngInsteadOfTrue", wording });
  }

  if (unit.kind === "text" && typeof answer === "string") {
    const given = normalizeTypedAnswer(answer);
    if (
      entry.accept.some((variant) =>
        isOneLetterAway(given, normalizeTypedAnswer(variant)),
      )
    )
      found.push({ code: "oneLetterAway" });
    if ("wordLimit" in group && !fitsWordLimit(given, group.wordLimit))
      found.push({ code: "wordLimit" });
    if (entry.fromPassage && hasWordNotInPassage(test, unit, given))
      found.push({ code: "notFromPassage" });
  }

  const pins = unit.numbers.flatMap((n) => attempt.pins[String(n)] ?? []);
  if (
    pins.length > 0 &&
    entry.accept[0] !== NOT_GIVEN &&
    entry.evidence.length > 0 &&
    !pins.some((id) => entry.evidence.includes(id))
  )
    found.push({ code: "pinnedElsewhere" });
  return found;
}

/**
 * Exactly one letter added, missing or changed, against an accepted variant
 * of at least 4 letters. An observed difference in the text, not proof of a
 * spelling mistake ("lines" is one letter from "lanes"); it never changes a mark.
 */
function isOneLetterAway(given: string, variant: string): boolean {
  if ((variant.match(/\p{L}/gu) ?? []).length < 4) return false;
  const a = Array.from(given);
  const b = Array.from(variant);
  if (given === variant || Math.abs(a.length - b.length) > 1) return false;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0;
  while (i < shorter.length && shorter[i] === longer[i]) i++;
  const skip = shorter.length === longer.length ? 1 : 0;
  return shorter.slice(i + skip).join("") === longer.slice(i + 1).join("");
}

/** Whether a word of the answer (letters only, case ignored) is missing from the question's passage. */
function hasWordNotInPassage(
  test: ReadingTest,
  unit: QuestionUnit,
  given: string,
): boolean {
  const passage = test.passages.find((p) => p.number === unit.passageNumber);
  const passageWords = new Set(
    (passage?.paragraphs ?? []).flatMap((p) =>
      p.sentences.flatMap((s) => s.text.toLowerCase().match(/\p{L}+/gu) ?? []),
    ),
  );
  return (given.match(/\p{L}+/gu) ?? []).some((w) => !passageWords.has(w));
}
