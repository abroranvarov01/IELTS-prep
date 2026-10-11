import type { ReadingTest } from "./content";
import { type QuestionUnit, questionUnits, unitOf } from "./units";

export type Mode = "practice" | "exam";
export type SheetState = "collapsed" | "partial" | "expanded";

/** An option id ("single", "select"), the typed text ("text"), or option ids ("multi"). */
export type Answer = string | string[];

export type SessionView = {
  sheet: SheetState;
  /** The passage on screen (1–3). */
  passage: number;
  /** The last scroll position of each passage, by passage id. */
  scroll: Record<string, number>;
};

/** A Reading session (ADR-0006). Change it only through `apply`. */
export type ReadingSession = {
  /**
   * Unique per session (ADR-0009 §3): random for a new session; for a session
   * M4 stored without one, derived from its slot and start time.
   */
  sessionId: string;
  testId: string;
  testVersion: number;
  mode: Mode;
  status: "inProgress" | "finished";
  finishReason?: "user" | "timeUp";
  startedAt: number;
  finishedAt?: number;
  currentQuestion: number;
  /** By unit key (the unit's first question number). */
  answers: Record<string, Answer>;
  flagged: number[];
  highlights: string[];
  /** Pinned evidence sentence ids, by question number. Practice only. */
  pins: Record<string, string[]>;
  view: SessionView;
  /** A retry of whole answer units of a committed test attempt (ADR-0009 §8). */
  retry?: { of: string; questions: number[] };
};

export type ReadingEvent =
  | { type: "answer"; number: number; answer: Answer }
  | { type: "clearAnswer"; number: number }
  | { type: "goTo"; number: number }
  | { type: "toggleFlag"; number: number }
  | { type: "toggleHighlight"; sentenceId: string }
  | { type: "pin"; number: number; sentenceId: string }
  | { type: "unpin"; number: number; sentenceId: string }
  | { type: "setView"; view: Partial<SessionView> }
  | { type: "finish" };

/** At most this many evidence sentences per question (owner, M4-09). */
export const MAX_PINS = 3;

export function startSession(
  test: ReadingTest,
  mode: Mode,
  now: number,
  sessionId: string,
): ReadingSession {
  return {
    sessionId,
    testId: test.id,
    testVersion: test.version,
    mode,
    status: "inProgress",
    startedAt: now,
    currentQuestion: 1,
    answers: {},
    flagged: [],
    highlights: [],
    pins: {},
    view: { sheet: "partial", passage: 1, scroll: {} },
  };
}

/** Exam Mode: time left in milliseconds, never below 0. Practice has no clock. */
export function remainingMs(
  session: ReadingSession,
  test: ReadingTest,
  now: number,
): number | undefined {
  if (session.mode !== "exam") return undefined;
  return Math.max(0, session.startedAt + test.durationMinutes * 60_000 - now);
}

/** Exam Mode warns when this many minutes are left (READING_EXPERIENCE.md, M4). */
const WARNING_MINUTES = [10, 5];

/**
 * The warning due with this much time left, in minutes: during the minute
 * after the time left passes 10 or 5 minutes, and none otherwise, so a user
 * who comes back later is not told an outdated time.
 */
export function dueWarning(remaining: number): number | undefined {
  return WARNING_MINUTES.find(
    (minutes) =>
      remaining <= minutes * 60_000 && remaining > (minutes - 1) * 60_000,
  );
}

/**
 * The only way a session changes. It first applies an Exam time-out (time is
 * derived from the stored start, so it holds across reloads), then the event.
 * An event that breaks a rule returns the session unchanged.
 */
export function apply(
  session: ReadingSession,
  test: ReadingTest,
  event: ReadingEvent | { type: "tick" },
  now: number,
): ReadingSession {
  const timed = applyTimeOut(session, test, now);
  if (timed.status === "finished" || event.type === "tick") return timed;

  const units = questionUnits(test);
  switch (event.type) {
    case "answer": {
      const unit = unitOf(units, event.number);
      if (!unit || !isValidAnswer(unit, event.answer)) return timed;
      const answers = { ...timed.answers };
      if (isEmptyAnswer(event.answer)) delete answers[unit.key];
      else answers[unit.key] = event.answer;
      return { ...timed, answers };
    }
    case "clearAnswer": {
      const unit = unitOf(units, event.number);
      if (!unit || !(unit.key in timed.answers)) return timed;
      const answers = { ...timed.answers };
      delete answers[unit.key];
      return { ...timed, answers };
    }
    case "goTo": {
      const unit = unitOf(units, event.number);
      if (!unit) return timed;
      return {
        ...timed,
        currentQuestion: event.number,
        view: { ...timed.view, passage: unit.passageNumber },
      };
    }
    case "toggleFlag": {
      if (!unitOf(units, event.number)) return timed;
      const flagged = timed.flagged.includes(event.number)
        ? timed.flagged.filter((n) => n !== event.number)
        : [...timed.flagged, event.number].sort((a, b) => a - b);
      return { ...timed, flagged };
    }
    case "toggleHighlight": {
      if (!sentenceIds(test).has(event.sentenceId)) return timed;
      const highlights = timed.highlights.includes(event.sentenceId)
        ? timed.highlights.filter((id) => id !== event.sentenceId)
        : [...timed.highlights, event.sentenceId];
      return { ...timed, highlights };
    }
    case "pin": {
      const unit = unitOf(units, event.number);
      const pinned = timed.pins[event.number] ?? [];
      if (
        timed.mode !== "practice" ||
        !unit ||
        !sentenceIds(test, unit.passageNumber).has(event.sentenceId) ||
        pinned.includes(event.sentenceId) ||
        pinned.length >= MAX_PINS
      )
        return timed;
      return {
        ...timed,
        pins: { ...timed.pins, [event.number]: [...pinned, event.sentenceId] },
      };
    }
    case "unpin": {
      const pinned = timed.pins[event.number];
      if (!pinned?.includes(event.sentenceId)) return timed;
      const pins = { ...timed.pins };
      const rest = pinned.filter((id) => id !== event.sentenceId);
      if (rest.length > 0) pins[event.number] = rest;
      else delete pins[event.number];
      return { ...timed, pins };
    }
    case "setView":
      return { ...timed, view: { ...timed.view, ...event.view } };
    case "finish":
      return {
        ...timed,
        status: "finished",
        finishReason: "user",
        finishedAt: now,
      };
  }
}

function applyTimeOut(
  session: ReadingSession,
  test: ReadingTest,
  now: number,
): ReadingSession {
  if (session.status === "finished" || remainingMs(session, test, now) !== 0)
    return session;
  return {
    ...session,
    status: "finished",
    finishReason: "timeUp",
    finishedAt: session.startedAt + test.durationMinutes * 60_000,
  };
}

/** The question numbers that count as answered (a "choose several" item answers one number per choice). */
export function answeredNumbers(
  session: Pick<ReadingSession, "answers">,
  test: ReadingTest,
): Set<number> {
  const answered = new Set<number>();
  for (const unit of questionUnits(test)) {
    const answer = session.answers[unit.key];
    if (answer === undefined || isEmptyAnswer(answer)) continue;
    const count = Array.isArray(answer) ? answer.length : unit.numbers.length;
    unit.numbers.slice(0, count).forEach((n) => answered.add(n));
  }
  return answered;
}

export function isValidAnswer(unit: QuestionUnit, answer: Answer): boolean {
  switch (unit.kind) {
    case "single":
    case "select":
      return (
        typeof answer === "string" &&
        (answer === "" || unit.optionIds.includes(answer))
      );
    case "multi":
      return (
        Array.isArray(answer) &&
        answer.length <= unit.choose &&
        new Set(answer).size === answer.length &&
        answer.every((id) => unit.optionIds.includes(id))
      );
    case "text":
      return typeof answer === "string";
  }
}

function isEmptyAnswer(answer: Answer): boolean {
  return Array.isArray(answer) ? answer.length === 0 : answer.trim() === "";
}

/** Sentence ids of the test, or of one passage. */
export function sentenceIds(
  test: ReadingTest,
  passageNumber?: number,
): Set<string> {
  return new Set(
    test.passages
      .filter((p) => passageNumber === undefined || p.number === passageNumber)
      .flatMap((p) =>
        p.paragraphs.flatMap((paragraph) =>
          paragraph.sentences.map((s) => s.id),
        ),
      ),
  );
}
