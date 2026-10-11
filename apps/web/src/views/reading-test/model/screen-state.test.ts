import { describe, expect, it } from "vitest";
import { startSession } from "@/entities/reading";
import { demoTest as test, testSessionId } from "@/entities/reading/testing";
import { screenReducer } from "./screen-state";

const T0 = Date.UTC(2026, 9, 10, 9, 0);

describe("the Reading screen state", () => {
  it("starts a session on top of what the device already had", () => {
    const finished = {
      ...startSession(test, "exam", T0 - 1000, testSessionId()),
      status: "finished" as const,
      finishReason: "user" as const,
      finishedAt: T0 - 500,
    };
    const state = screenReducer(
      { now: 0 },
      {
        type: "start",
        test,
        mode: "practice",
        now: T0,
        sessionId: testSessionId(2),
        stored: { finished },
      },
    );
    expect(state.local?.current?.mode).toBe("practice");
    expect(state.local?.current?.sessionId).toBe(testSessionId(2));
    expect(state.local?.finished).toBe(finished);
  });

  it("applies events to the stored session until the user has acted, then to its own", () => {
    const stored = {
      current: startSession(test, "practice", T0, testSessionId()),
    };
    const first = screenReducer(
      { now: 0 },
      {
        type: "event",
        test,
        event: { type: "goTo", number: 3 },
        now: T0 + 1,
        stored,
      },
    );
    expect(first.local?.current?.currentQuestion).toBe(3);

    const second = screenReducer(first, {
      type: "event",
      test,
      event: { type: "goTo", number: 4 },
      now: T0 + 2,
      stored,
    });
    expect(second.local?.current?.currentQuestion).toBe(4);
  });

  it("keeps a refused event from changing anything but the time", () => {
    const stored = {
      current: startSession(test, "practice", T0, testSessionId()),
    };
    const state = screenReducer(
      { now: 0 },
      {
        type: "event",
        test,
        event: { type: "goTo", number: 99 },
        now: T0 + 5,
        stored,
      },
    );
    expect(state).toEqual({ now: T0 + 5 });
  });

  it("moves a session that finishes out of the current slot", () => {
    const stored = {
      current: startSession(test, "practice", T0, testSessionId()),
    };
    const state = screenReducer(
      { now: 0 },
      { type: "event", test, event: { type: "finish" }, now: T0 + 9, stored },
    );
    expect(state.local?.current).toBeUndefined();
    expect(state.local?.finished?.status).toBe("finished");
  });
});
