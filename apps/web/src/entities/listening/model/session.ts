import type { ListeningTest } from "./content";
import { type QuestionUnit, questionUnits, unitOf } from "./units";

export type Mode = "practice" | "exam";

/** An option id ("single", "select"), the typed text ("text"), or option ids ("multi"). */
export type Answer = string | string[];

/** Practice speeds (LISTENING_EXPERIENCE.md P3). */
export const SPEEDS = [0.75, 1, 1.25] as const;
export type Speed = (typeof SPEEDS)[number];

/** Exam Mode's time to check after the recording (IDP, LISTENING_EXPERIENCE.md). */
export const CHECK_MS = 2 * 60_000;

export type ExamState = {
  /** When "Start the recording" was tapped; the clock starts here. */
  recordingStartedAt?: number;
  /** Time not counted: buffering while the page was open, audio failures. */
  pausedMs: number;
  /** The pause in progress, if any. */
  pause?: { since: number; kind: "buffering" | "audioFailed" };
  /** How many times the audio failed (shown on the finished page). */
  interruptions: number;
  /** Saved at least every few seconds while the page is open. */
  lastActiveAt: number;
  /**
   * By part number, the furthest position actually played, in ms, reported
   * by the player while the audio plays (ADR-0014 §2). Absent: unknown.
   */
  playedToMs?: Record<string, number>;
};

/** A Listening session (ADR-0013 §3). Change it only through `apply`. */
export type ListeningSession = {
  sessionId: string;
  testId: string;
  testVersion: number;
  mode: Mode;
  status: "inProgress" | "finished";
  finishReason?: "user" | "timeUp" | "audioFailed";
  startedAt: number;
  finishedAt?: number;
  currentQuestion: number;
  /** By unit key (the unit's first question number). */
  answers: Record<string, Answer>;
  flagged: number[];
  view: {
    /** The part on screen (1–4). */
    part: number;
    /** The last scroll position of each part, by part id. */
    scroll: Record<string, number>;
  };
  /** Practice only: where each part's audio was left, by part id, and the speed. */
  practice?: { positions: Record<string, number>; speed: Speed };
  exam?: ExamState;
};

export type ListeningEvent =
  | { type: "answer"; number: number; answer: Answer }
  | { type: "clearAnswer"; number: number }
  | { type: "goTo"; number: number }
  | { type: "toggleFlag"; number: number }
  | { type: "setScroll"; partId: string; scroll: number }
  | { type: "finish" }
  // Practice
  | { type: "setPosition"; partId: string; positionMs: number }
  | { type: "setSpeed"; speed: Speed }
  // Exam
  | { type: "startRecording" }
  | { type: "stall" }
  | { type: "audioFailed" }
  | { type: "resume" }
  | { type: "heartbeat" }
  | { type: "played"; part: number; positionMs: number };

export function startSession(
  test: ListeningTest,
  mode: Mode,
  now: number,
  sessionId: string,
): ListeningSession {
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
    view: { part: 1, scroll: {} },
    ...(mode === "practice"
      ? { practice: { positions: {}, speed: 1 } }
      : {
          exam: {
            pausedMs: 0,
            interruptions: 0,
            lastActiveAt: now,
          },
        }),
  };
}

export type ExamClock =
  | { phase: "notStarted" }
  | { phase: "recording"; part: number; offsetMs: number }
  | { phase: "checking"; remainingMs: number }
  | { phase: "over" };

/**
 * Where an Exam is: derived from the stored times, never counted (ADR-0013
 * §3). Time away keeps running; buffering and audio failures are subtracted.
 */
export function examClock(
  session: ListeningSession,
  test: ListeningTest,
  now: number,
): ExamClock {
  const exam = session.exam;
  if (!exam?.recordingStartedAt) return { phase: "notStarted" };
  const open = exam.pause ? Math.max(0, now - exam.pause.since) : 0;
  let elapsed = now - exam.recordingStartedAt - exam.pausedMs - open;
  for (const part of test.parts) {
    if (elapsed < part.audio.durationMs)
      return {
        phase: "recording",
        part: part.number,
        offsetMs: Math.max(0, elapsed),
      };
    elapsed -= part.audio.durationMs;
  }
  return elapsed < CHECK_MS
    ? { phase: "checking", remainingMs: CHECK_MS - elapsed }
    : { phase: "over" };
}

/**
 * The only way a session changes. It first applies an Exam time-out (the end
 * of the check time), then the event. An event that breaks a rule returns
 * the session unchanged.
 */
export function apply(
  session: ListeningSession,
  test: ListeningTest,
  event: ListeningEvent | { type: "tick" },
  now: number,
): ListeningSession {
  const timed = applyTimeOut(session, test, now);
  if (timed.status === "finished" || event.type === "tick") return timed;
  const units = questionUnits(test);
  const exam = timed.exam;

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
        view: { ...timed.view, part: unit.partNumber },
      };
    }
    case "toggleFlag": {
      if (!unitOf(units, event.number)) return timed;
      const flagged = timed.flagged.includes(event.number)
        ? timed.flagged.filter((n) => n !== event.number)
        : [...timed.flagged, event.number].sort((a, b) => a - b);
      return { ...timed, flagged };
    }
    case "setScroll": {
      if (!test.parts.some((p) => p.id === event.partId) || event.scroll < 0)
        return timed;
      return {
        ...timed,
        view: {
          ...timed.view,
          scroll: { ...timed.view.scroll, [event.partId]: event.scroll },
        },
      };
    }
    case "setPosition": {
      const part = test.parts.find((p) => p.id === event.partId);
      if (
        !timed.practice ||
        !part ||
        event.positionMs < 0 ||
        event.positionMs > part.audio.durationMs
      )
        return timed;
      return {
        ...timed,
        practice: {
          ...timed.practice,
          positions: {
            ...timed.practice.positions,
            [event.partId]: Math.round(event.positionMs),
          },
        },
      };
    }
    case "setSpeed":
      if (!timed.practice || !SPEEDS.includes(event.speed)) return timed;
      return { ...timed, practice: { ...timed.practice, speed: event.speed } };
    case "startRecording":
      if (!exam || exam.recordingStartedAt !== undefined) return timed;
      return {
        ...timed,
        exam: { ...exam, recordingStartedAt: now, lastActiveAt: now },
      };
    case "stall":
      // Buffering pauses the clock only while the recording plays.
      if (
        !exam ||
        exam.pause ||
        examClock(timed, test, now).phase !== "recording"
      )
        return timed;
      return {
        ...timed,
        exam: {
          ...exam,
          pause: { since: now, kind: "buffering" },
          lastActiveAt: now,
        },
      };
    case "audioFailed": {
      if (!exam || examClock(timed, test, now).phase !== "recording")
        return timed;
      // A failure during buffering keeps the earlier start of the pause.
      const since = exam.pause?.since ?? now;
      return {
        ...timed,
        exam: {
          ...exam,
          pause: { since, kind: "audioFailed" },
          interruptions: exam.interruptions + 1,
          lastActiveAt: now,
        },
      };
    }
    case "resume":
      if (!exam?.pause) return timed;
      return {
        ...timed,
        exam: closePause(exam, now),
      };
    case "heartbeat":
      if (!exam) return timed;
      return { ...timed, exam: { ...exam, lastActiveAt: now } };
    case "played": {
      // Coverage only grows: a lower report (a seek, a late event) is ignored.
      const part = test.parts.find((p) => p.number === event.part);
      const key = String(event.part);
      if (!exam || !part || event.positionMs < 0) return timed;
      // The element's duration may differ from the content's by rounding.
      const positionMs = Math.min(
        Math.round(event.positionMs),
        part.audio.durationMs,
      );
      if (positionMs <= (exam.playedToMs?.[key] ?? -1)) return timed;
      return {
        ...timed,
        exam: {
          ...exam,
          playedToMs: { ...exam.playedToMs, [key]: positionMs },
        },
      };
    }
    case "finish":
      return {
        ...timed,
        status: "finished",
        finishReason:
          exam?.pause?.kind === "audioFailed" ? "audioFailed" : "user",
        finishedAt: now,
        ...(exam?.pause && { exam: closePause(exam, now) }),
      };
  }
}

/**
 * What a reloaded session needs before it runs again (ADR-0013 §3): a
 * buffering pause was open only while the page was, so it is closed at the
 * last moment the page was seen; time away is not subtracted. An audio
 * failure stays open until the learner acts.
 */
export function settleLoaded(session: ListeningSession): ListeningSession {
  const exam = session.exam;
  if (session.status !== "inProgress" || exam?.pause?.kind !== "buffering")
    return session;
  return { ...session, exam: closePause(exam, exam.lastActiveAt) };
}

function closePause(exam: ExamState, at: number): ExamState {
  if (!exam.pause) return exam;
  const { pause, ...rest } = exam;
  return { ...rest, pausedMs: exam.pausedMs + Math.max(0, at - pause.since) };
}

function applyTimeOut(
  session: ListeningSession,
  test: ListeningTest,
  now: number,
): ListeningSession {
  const exam = session.exam;
  if (
    session.status === "finished" ||
    !exam?.recordingStartedAt ||
    examClock(session, test, now).phase !== "over"
  )
    return session;
  const total = test.parts.reduce((ms, p) => ms + p.audio.durationMs, 0);
  return {
    ...session,
    status: "finished",
    finishReason: "timeUp",
    finishedAt: exam.recordingStartedAt + exam.pausedMs + total + CHECK_MS,
  };
}

/** The question numbers that count as answered (a "choose several" item answers one number per choice). */
export function answeredNumbers(
  session: Pick<ListeningSession, "answers">,
  test: ListeningTest,
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
