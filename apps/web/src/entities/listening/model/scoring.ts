import { normalizeTypedAnswer } from "@/shared/content/normalize";
import {
  type KeyEntry,
  type ListeningKey,
  type ListeningTest,
  type Transcript,
  typedWordLimit,
} from "./content";
import type { Answer, ListeningSession } from "./session";
import { type QuestionUnit, questionUnits } from "./units";
import { fitsListeningWordLimit } from "./word-limit";

/**
 * Listening answer checking (ADR-0014 §6; LISTENING_EXPERIENCE.md, Answer
 * checking and Error Intelligence (M9)). Rules marked as owner decisions are
 * product policy, not official IELTS rules. Nothing here converts a raw score
 * to a band (owner decision LD1).
 */

/**
 * Increases whenever a change here could change a mark, an outcome or a
 * signal for the same answers, key, transcript and content, bug fixes
 * included. Every stored Listening result records it (ADR-0014 §3). Separate
 * from Reading's, so neither skill's changes recheck the other's attempts.
 */
export const LISTENING_SCORING_RULES_VERSION = 1;

/** The outcome of one scoring position (one question number, one mark). */
export type Outcome = "correct" | "incorrect" | "unanswered";

/** A practice score on practice content: marks out of scoring positions, never a band. */
export type PracticeRawScore = {
  kind: "practiceRawScore";
  marks: number;
  positions: number;
};

/**
 * An observable fact about an answer, never a cause. Only codes are stored;
 * what a note shows (the word, the numbers, the times) is read from the
 * answer, key and transcript that the result's versions pin (ADR-0014 §2).
 */
export type Signal = {
  code:
    | "oneLetterAway"
    | "wordLimit"
    | "notInTranscript"
    | "teenTyNumber"
    | "sameDigitsDifferentForm"
    | "mentionedOption"
    | "timeUp"
    | "notReached";
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
  ListeningSession,
  "answers" | "mode" | "finishReason"
> & {
  /**
   * Exam only: per part number, the furthest position actually played, in ms
   * (ADR-0014 §2). A part without a value has unknown coverage.
   */
  playedToMs?: Record<number, number>;
  /** A retry checks only these question numbers (whole units). */
  questions?: number[];
};

/**
 * The answer units checking, review and retries work in: the units of the
 * session, except that the numbers of one "List TWO" question form one unit
 * (owner decision LD6), as a "choose several" item does.
 */
export function checkUnits(test: ListeningTest): QuestionUnit[] {
  const units: QuestionUnit[] = [];
  for (const unit of questionUnits(test)) {
    const { group } = unit;
    const list =
      group.type === "shortAnswer"
        ? group.questions.find((q) => q.numbers.includes(unit.numbers[0] ?? 0))
        : undefined;
    if (list && list.numbers.length > 1) {
      if (list.numbers[0] === unit.numbers[0])
        units.push({ ...unit, numbers: [...list.numbers] });
      continue;
    }
    units.push(unit);
  }
  return units;
}

/**
 * Checks an attempt against the key, one mark per question number ("Each
 * correct answer receives 1 mark": ielts.org Listening format). Unanswered
 * questions earn nothing and stay in the total.
 */
export function checkAttempt(
  test: ListeningTest,
  key: ListeningKey,
  transcript: Transcript,
  attempt: CheckedAnswers,
): CheckResult {
  const outcomes: Record<number, Outcome> = {};
  const signals: Record<string, Signal[]> = {};
  let marks = 0;
  let positions = 0;
  for (const unit of checkUnits(test)) {
    if (
      attempt.questions &&
      !unit.numbers.every((n) => attempt.questions?.includes(n))
    )
      continue;
    const entries = unit.numbers.map((n) => key.answers[n]);
    if (!entries.every((e): e is KeyEntry => e !== undefined)) continue;
    const given = givenAnswers(unit, attempt.answers);
    const match = matchUnit(unit, given, entries);
    unit.numbers.forEach((number, i) => {
      outcomes[number] =
        i < match.marks
          ? "correct"
          : i < match.chosen
            ? "incorrect"
            : "unanswered";
    });
    marks += match.marks;
    positions += unit.numbers.length;
    const found = signalsFor(
      { test, transcript, attempt },
      unit,
      entries,
      given,
      match,
    );
    if (found.length > 0) signals[unit.key] = found;
  }
  return {
    outcomes,
    signals,
    score: { kind: "practiceRawScore", marks, positions },
  };
}

/** The answers of a unit: its chosen options, or one typed text per number. */
type Given =
  { kind: "options"; ids: string[] } | { kind: "typed"; texts: string[] };

function givenAnswers(
  unit: QuestionUnit,
  answers: Record<string, Answer>,
): Given {
  if (unit.kind === "text")
    return {
      kind: "typed",
      texts: unit.numbers.map((n) => {
        const answer = answers[String(n)];
        return typeof answer === "string" ? answer : "";
      }),
    };
  const answer = answers[unit.key];
  const ids = Array.isArray(answer) ? answer : answer ? [answer] : [];
  return {
    kind: "options",
    // Each option once; anything that is not an option of the unit is ignored.
    ids: [...new Set(ids)].filter((id) => unit.optionIds.includes(id)),
  };
}

type Match = {
  marks: number;
  /** How many of the unit's positions have an answer. */
  chosen: number;
  /** Typed answers that matched no accepted thing, normalized. */
  unmatched: string[];
};

function matchUnit(
  unit: QuestionUnit,
  given: Given,
  entries: KeyEntry[],
): Match {
  if (given.kind === "options") {
    // "Choose TWO": each correct letter is one mark, in either order (official
    // answer keys: "IN EITHER ORDER"); never more marks than numbers.
    const accept = entries[0]?.accept ?? [];
    const correct = given.ids.filter((id) => accept.includes(id)).length;
    return {
      marks: Math.min(correct, unit.numbers.length),
      chosen: Math.min(given.ids.length, unit.numbers.length),
      unmatched: [],
    };
  }
  const texts = given.texts
    .map(normalizeTypedAnswer)
    .filter((text) => text !== "");
  const things = entries.map((e) => e.accept.map(normalizeTypedAnswer));
  const matched =
    entries[0]?.ordered === true
      ? given.texts.map((text, i) =>
          things[i]?.includes(normalizeTypedAnswer(text)) ? i : -1,
        )
      : bestMatch(texts, things);
  const used = new Set(matched.filter((i) => i >= 0));
  const answered = entries[0]?.ordered
    ? given.texts.map(normalizeTypedAnswer)
    : texts;
  return {
    marks: used.size,
    chosen: texts.length,
    unmatched: answered.filter((text, i) => text !== "" && matched[i] === -1),
  };
}

/**
 * Pairs answers with accepted things, each thing at most once, so that as
 * many answers as possible are correct: a "List TWO" question in either
 * order (owner decision LD6, product policy). Typing one answer twice earns
 * one mark. With at most three answers every pairing is tried.
 * Returns, per answer, the index of its thing or -1.
 */
function bestMatch(texts: string[], things: string[][]): number[] {
  let best = texts.map(() => -1);
  let bestCount = 0;
  const visit = (i: number, taken: number[], current: number[]) => {
    if (i === texts.length) {
      const count = current.filter((t) => t >= 0).length;
      if (count > bestCount) [best, bestCount] = [[...current], count];
      return;
    }
    visit(i + 1, taken, [...current, -1]);
    things.forEach((variants, t) => {
      if (!taken.includes(t) && variants.includes(texts[i] ?? ""))
        visit(i + 1, [...taken, t], [...current, t]);
    });
  };
  visit(0, [], []);
  return best;
}

type Context = {
  test: ListeningTest;
  transcript: Transcript;
  attempt: CheckedAnswers;
};

function signalsFor(
  context: Context,
  unit: QuestionUnit,
  entries: KeyEntry[],
  given: Given,
  match: Match,
): Signal[] {
  if (match.chosen === 0) return unansweredSignals(context, unit, entries);
  // A correct answer never gets a note (owner, M9-04 clarification).
  if (match.marks === unit.numbers.length) return [];

  const found: Signal[] = [];
  const add = (code: Signal["code"]) => {
    if (!found.some((s) => s.code === code)) found.push({ code });
  };
  const variants = entries.flatMap((e) => e.accept.map(normalizeTypedAnswer));
  const limit = typedWordLimit(unit.group);
  for (const text of match.unmatched) {
    if (variants.some((v) => isOneLetterAway(text, v))) add("oneLetterAway");
    if (limit && !fitsListeningWordLimit(text, limit)) add("wordLimit");
    if (
      entries.some((e) => e.fromRecording) &&
      hasWordNotHeard(context.transcript, unit, text, variants)
    )
      add("notInTranscript");
    if (variants.some((v) => isTeenTyPair(text, v))) add("teenTyNumber");
    else if (variants.some((v) => hasSameDigits(text, v)))
      add("sameDigitsDifferentForm");
  }
  if (isMentioned(entries, given, match)) add("mentionedOption");
  return found;
}

/**
 * Notes on a unit with no answer. `notReached` comes only from recorded
 * playback coverage, never from elapsed time; with coverage unknown nothing
 * is said about whether the learner heard the question. An unanswered
 * question is never treated as evidence of time pressure: `timeUp` only
 * states that the check time ended (owner, M9-04 clarification).
 */
function unansweredSignals(
  { transcript, attempt }: Context,
  unit: QuestionUnit,
  entries: KeyEntry[],
): Signal[] {
  if (attempt.mode !== "exam") return [];
  const played = attempt.playedToMs?.[unit.partNumber];
  const start = firstEvidenceStart(transcript, unit, entries);
  if (played !== undefined && start !== undefined && played < start)
    return [{ code: "notReached" }];
  return attempt.finishReason === "timeUp" ? [{ code: "timeUp" }] : [];
}

/** Where the unit's answer is first said: the start of its earliest evidence segment. */
function firstEvidenceStart(
  transcript: Transcript,
  unit: QuestionUnit,
  entries: KeyEntry[],
): number | undefined {
  const segments = partSegments(transcript, unit);
  const ids = new Set(entries.flatMap((e) => e.evidence.map((x) => x.segment)));
  const starts = segments.filter((s) => ids.has(s.id)).map((s) => s.startMs);
  return starts.length > 0 ? Math.min(...starts) : undefined;
}

function partSegments(transcript: Transcript, unit: QuestionUnit) {
  return transcript.parts[unit.partNumber - 1]?.segments ?? [];
}

/**
 * Exactly one letter added, missing or changed, against an accepted variant
 * of at least 4 letters. An observed difference in the text, not proof of a
 * spelling mistake; it never changes a mark.
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

/**
 * Whether a word of the answer (letters only, case ignored) is in neither
 * the transcript of the question's part nor any accepted variant. Applies
 * only where the instruction requires the recording's words (`fromRecording`).
 */
function hasWordNotHeard(
  transcript: Transcript,
  unit: QuestionUnit,
  given: string,
  variants: string[],
): boolean {
  const words = (text: string) => text.toLowerCase().match(/\p{L}+/gu) ?? [];
  const known = new Set([
    ...partSegments(transcript, unit).flatMap((s) => words(s.text)),
    ...variants.flatMap(words),
  ]);
  return words(given).some((w) => !known.has(w));
}

const TEENS = [
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = [
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/** 13–19 or 30–90 as 0–6 with its kind, written in figures or words. */
function teenOrTy(
  text: string,
): { kind: "teen" | "ty"; i: number } | undefined {
  const n = /^\d+$/.test(text) ? Number(text) : undefined;
  if (n !== undefined && n >= 13 && n <= 19) return { kind: "teen", i: n - 13 };
  if (n !== undefined && n >= 30 && n <= 90 && n % 10 === 0)
    return { kind: "ty", i: n / 10 - 3 };
  if (TEENS.includes(text)) return { kind: "teen", i: TEENS.indexOf(text) };
  if (TENS.includes(text)) return { kind: "ty", i: TENS.indexOf(text) };
  return undefined;
}

/** The two numbers differ only as a "-teen" and a "-ty" number (13 and 30 … 19 and 90). */
function isTeenTyPair(given: string, variant: string): boolean {
  const a = teenOrTy(given);
  const b = teenOrTy(variant);
  return a !== undefined && b !== undefined && a.kind !== b.kind && a.i === b.i;
}

/** The same digits in the same order, written differently ("6-45" and "6:45"). */
function hasSameDigits(given: string, variant: string): boolean {
  const digits = (text: string) => text.replace(/\D/g, "");
  return digits(given) !== "" && digits(given) === digits(variant);
}

/**
 * The answer is something the recording mentions that is not the answer,
 * by a distractor entry a person has verified against the recording;
 * unverified (AI-drafted) entries are ignored (owner decision LD13).
 */
function isMentioned(entries: KeyEntry[], given: Given, match: Match) {
  const verified = entries
    .flatMap((e) => e.distractors ?? [])
    .filter((d) => d.review === "verified");
  return verified.some((d) =>
    "option" in d
      ? given.kind === "options" && given.ids.includes(d.option)
      : match.unmatched.includes(normalizeTypedAnswer(d.text)),
  );
}
