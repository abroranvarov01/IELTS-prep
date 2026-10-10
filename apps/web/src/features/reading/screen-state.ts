import type { ReadingTest } from "@/domain/reading/content";
import {
  type Mode,
  type ReadingEvent,
  type ReadingSession,
  apply,
  startSession,
} from "@/domain/reading/session";

/** The current and the latest finished session of one test. */
export type Sessions = { current?: ReadingSession; finished?: ReadingSession };

/**
 * The screen's state. `local` is empty until the user acts; until then the
 * sessions come from the device's storage snapshot, which every action
 * carries (ADR-0006: storage is read without setting state in an effect).
 * `now` is the time of the latest action, for anything that shows time.
 */
export type ScreenState = { local?: Sessions; now: number };

export type ScreenAction =
  | {
      type: "start";
      test: ReadingTest;
      mode: Mode;
      now: number;
      stored: Sessions;
    }
  | {
      type: "event";
      test: ReadingTest;
      event: ReadingEvent | { type: "tick" };
      now: number;
      stored: Sessions;
    };

export function screenReducer(
  state: ScreenState,
  action: ScreenAction,
): ScreenState {
  const sessions = state.local ?? action.stored;
  switch (action.type) {
    case "start":
      return {
        now: action.now,
        local: {
          ...sessions,
          current: startSession(action.test, action.mode, action.now),
        },
      };
    case "event": {
      const current = sessions.current;
      if (!current) return { ...state, now: action.now };
      const next = apply(current, action.test, action.event, action.now);
      if (next === current) return { ...state, now: action.now };
      return {
        now: action.now,
        local:
          next.status === "finished"
            ? { finished: next }
            : { ...sessions, current: next },
      };
    }
  }
}
