import { describe, expect, it } from "vitest";
import { fixtureTest } from "./listening-test.fixture";
import { parseListeningTest } from "./parse-content";
import {
  CHECK_MS,
  type ListeningSession,
  answeredNumbers,
  apply,
  examClock,
  settleLoaded,
  startSession,
} from "./session";

const parsed = parseListeningTest(fixtureTest());
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
const test = parsed.value;
// Each fixture part is 3 seconds of audio: the recording lasts 12 s.
const PART = 3000;
const T0 = 1_000_000;
const ID = "s-12345678-1234-4123-8123-123456789abc";

const practice = () => startSession(test, "practice", T0, ID);
const exam = () => startSession(test, "exam", T0, ID);
const run = (
  session: ListeningSession,
  ...steps: [Parameters<typeof apply>[2], number][]
) => steps.reduce((s, [event, now]) => apply(s, test, event, now), session);

describe("answering", () => {
  it("keeps valid answers under the unit's first number", () => {
    const s = run(
      practice(),
      [{ type: "answer", number: 1, answer: "here" }, T0],
      [{ type: "answer", number: 8, answer: "B" }, T0],
      [{ type: "answer", number: 22, answer: ["A", "C"] }, T0],
      [{ type: "answer", number: 18, answer: "D" }, T0],
    );
    expect(s.answers).toEqual({
      "1": "here",
      "8": "B",
      "21": ["A", "C"],
      "18": "D",
    });
    expect([...answeredNumbers(s, test)].sort((a, b) => a - b)).toEqual([
      1, 8, 18, 21, 22,
    ]);
  });

  it("refuses an option a question does not offer, and too many choices", () => {
    const s = run(
      practice(),
      [{ type: "answer", number: 8, answer: "Z" }, T0],
      [{ type: "answer", number: 21, answer: ["A", "B", "C"] }, T0],
      [{ type: "answer", number: 41, answer: "x" }, T0],
    );
    expect(s.answers).toEqual({});
  });

  it("clears an answer with an empty one or clearAnswer", () => {
    const s = run(
      practice(),
      [{ type: "answer", number: 2, answer: "word" }, T0],
      [{ type: "answer", number: 2, answer: "  " }, T0],
      [{ type: "answer", number: 3, answer: "word" }, T0],
      [{ type: "clearAnswer", number: 3 }, T0],
    );
    expect(s.answers).toEqual({});
  });

  it("moving to a question shows its part", () => {
    const s = apply(practice(), test, { type: "goTo", number: 34 }, T0);
    expect(s.currentQuestion).toBe(34);
    expect(s.view.part).toBe(4);
  });

  it("marks and unmarks a question for review", () => {
    const s = run(
      practice(),
      [{ type: "toggleFlag", number: 5 }, T0],
      [{ type: "toggleFlag", number: 2 }, T0],
      [{ type: "toggleFlag", number: 5 }, T0],
    );
    expect(s.flagged).toEqual([2]);
  });
});

describe("Practice", () => {
  it("keeps each part's audio position and the speed", () => {
    const s = run(
      practice(),
      [{ type: "setPosition", partId: "p2", positionMs: 1500 }, T0],
      [{ type: "setSpeed", speed: 0.75 }, T0],
    );
    expect(s.practice).toEqual({ positions: { p2: 1500 }, speed: 0.75 });
  });

  it("refuses positions outside the part's audio and unknown speeds", () => {
    const s = run(
      practice(),
      [{ type: "setPosition", partId: "p2", positionMs: PART + 1 }, T0],
      [{ type: "setPosition", partId: "p9", positionMs: 10 }, T0],
      [{ type: "setSpeed", speed: 2 as never }, T0],
    );
    expect(s.practice).toEqual({ positions: {}, speed: 1 });
  });

  it("has no clock and no Exam events", () => {
    const s = run(
      practice(),
      [{ type: "startRecording" }, T0],
      [{ type: "stall" }, T0],
    );
    expect(s.exam).toBeUndefined();
    expect(examClock(s, test, T0 + 10 * 60_000)).toEqual({
      phase: "notStarted",
    });
    expect(apply(s, test, { type: "tick" }, T0 + 99 * 60_000).status).toBe(
      "inProgress",
    );
  });
});

describe("Exam", () => {
  const started = () => apply(exam(), test, { type: "startRecording" }, T0);

  it("plays once, from part 1 to part 4, without controls", () => {
    const s = run(
      started(),
      [{ type: "setPosition", partId: "p1", positionMs: 0 }, T0 + 10],
      [{ type: "setSpeed", speed: 1.25 }, T0 + 10],
      [{ type: "startRecording" }, T0 + 2000],
    );
    expect(s.practice).toBeUndefined();
    expect(s.exam?.recordingStartedAt).toBe(T0);
    expect(examClock(s, test, T0 + 500)).toEqual({
      phase: "recording",
      part: 1,
      offsetMs: 500,
    });
    expect(examClock(s, test, T0 + PART)).toEqual({
      phase: "recording",
      part: 2,
      offsetMs: 0,
    });
    expect(examClock(s, test, T0 + 3 * PART + 2999)).toEqual({
      phase: "recording",
      part: 4,
      offsetMs: 2999,
    });
  });

  it("has not started before the recording does", () => {
    expect(examClock(exam(), test, T0 + 60_000)).toEqual({
      phase: "notStarted",
    });
  });

  it("gives 2 minutes to check after the recording, then finishes by itself", () => {
    const s = started();
    expect(examClock(s, test, T0 + 4 * PART + 30_000)).toEqual({
      phase: "checking",
      remainingMs: CHECK_MS - 30_000,
    });
    const over = apply(s, test, { type: "tick" }, T0 + 4 * PART + CHECK_MS);
    expect(over).toMatchObject({
      status: "finished",
      finishReason: "timeUp",
      finishedAt: T0 + 4 * PART + CHECK_MS,
    });
  });

  it("keeps the clock running while the learner is away", () => {
    const s = started();
    // Saved and closed at T0 + 1 s; opened again 5 s later.
    const loaded = settleLoaded(
      apply(s, test, { type: "heartbeat" }, T0 + 1000),
    );
    expect(examClock(loaded, test, T0 + 6000)).toEqual({
      phase: "recording",
      part: 3,
      offsetMs: 0,
    });
  });

  it("does not count buffering while the page is open", () => {
    const s = run(
      started(),
      [{ type: "stall" }, T0 + 1000],
      [{ type: "resume" }, T0 + 5000],
    );
    expect(s.exam?.pausedMs).toBe(4000);
    expect(examClock(s, test, T0 + 6000)).toEqual({
      phase: "recording",
      part: 1,
      offsetMs: 2000,
    });
  });

  it("closes a buffering pause at the last heartbeat when the page comes back", () => {
    const s = run(
      started(),
      [{ type: "stall" }, T0 + 1000],
      [{ type: "heartbeat" }, T0 + 2000],
    );
    const loaded = settleLoaded(s);
    expect(loaded.exam?.pause).toBeUndefined();
    expect(loaded.exam?.pausedMs).toBe(1000);
  });

  it("pauses for an audio failure until the learner continues, and counts it", () => {
    const failed = apply(started(), test, { type: "audioFailed" }, T0 + 1000);
    expect(examClock(failed, test, T0 + 60_000)).toEqual({
      phase: "recording",
      part: 1,
      offsetMs: 1000,
    });
    expect(settleLoaded(failed).exam?.pause?.kind).toBe("audioFailed");
    const resumed = apply(failed, test, { type: "resume" }, T0 + 61_000);
    expect(resumed.exam).toMatchObject({ pausedMs: 60_000, interruptions: 1 });
    expect(examClock(resumed, test, T0 + 61_500)).toEqual({
      phase: "recording",
      part: 1,
      offsetMs: 1500,
    });
  });

  it("records finishing without the rest after an audio failure", () => {
    const s = run(
      started(),
      [{ type: "audioFailed" }, T0 + 1000],
      [{ type: "finish" }, T0 + 2000],
    );
    expect(s).toMatchObject({
      status: "finished",
      finishReason: "audioFailed",
      finishedAt: T0 + 2000,
    });
  });

  it("pauses for buffering only while the recording plays", () => {
    const checking = apply(
      started(),
      test,
      { type: "stall" },
      T0 + 4 * PART + 10,
    );
    expect(checking.exam?.pause).toBeUndefined();
  });
});

describe("a finished session", () => {
  it("changes no more", () => {
    const done = apply(practice(), test, { type: "finish" }, T0 + 5);
    expect(done).toMatchObject({
      status: "finished",
      finishReason: "user",
      finishedAt: T0 + 5,
    });
    expect(
      apply(done, test, { type: "answer", number: 1, answer: "late" }, T0 + 6),
    ).toBe(done);
  });
});
