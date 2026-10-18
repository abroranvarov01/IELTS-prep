import {
  type Mode,
  type ReadingEvent,
  type ReadingSession,
  type ReadingTest,
  apply,
  startSession,
} from "@/entities/reading";

/** The current and the latest finished session of one test. */
export type Sessions = { current?: ReadingSession; finished?: ReadingSession };

/**
 * The screen's state. `local` is empty until the user acts; until then the
 * sessions come from the device's storage snapshot, which every action
 * carries (ADR-0006: storage is read without setting state in an effect).
 * `visit` names the visit `local` belongs to: a screen kept alive between
 * visits ignores a `local` of an earlier visit and reads the device again.
 */
export type ScreenState = { local?: Sessions; visit?: string };

type Visit = { visit?: string };

export type ScreenAction =
  | (Visit & {
      type: "start";
      test: ReadingTest;
      mode: Mode;
      now: number;
      /** A new random id (ADR-0009 §3); made outside the reducer, which stays pure. */
      sessionId: string;
      /** A retry's units (ADR-0009 §8). */
      retry?: { of: string; questions: number[] };
      stored: Sessions;
    })
  | (Visit & {
      type: "event";
      test: ReadingTest;
      event: ReadingEvent | { type: "tick" };
      now: number;
      stored: Sessions;
    });

/**
 * An event that changes nothing (a refused one, or the Exam clock's tick
 * before 0:00) returns the same state, so nothing below the screen renders
 * again.
 */
export function screenReducer(
  state: ScreenState,
  action: ScreenAction,
): ScreenState {
  const sessions =
    (state.visit === action.visit ? state.local : undefined) ?? action.stored;
  switch (action.type) {
    case "start":
      return {
        visit: action.visit,
        local: {
          ...sessions,
          current: startSession(
            action.test,
            action.mode,
            action.now,
            action.sessionId,
            action.retry,
          ),
        },
      };
    case "event": {
      const current = sessions.current;
      if (!current) return state;
      const next = apply(current, action.test, action.event, action.now);
      if (next === current) return state;
      return {
        visit: action.visit,
        local:
          next.status === "finished"
            ? { finished: next }
            : { ...sessions, current: next },
      };
    }
  }
}
