import { describe, expect, it } from "vitest";
import { demoTest as test } from "./demo-test.fixture";
import { SESSION_SCHEMA, parseStoredSession } from "./parse-session";
import {
  type ReadingEvent,
  type ReadingSession,
  apply,
  remainingMs,
  startSession,
} from "./session";

const T0 = Date.UTC(2026, 9, 10, 9, 0);

function richSession(): ReadingSession {
  let s = startSession(test, "practice", T0);
  const events: ReadingEvent[] = [
    { type: "answer", number: 1, answer: "TRUE" },
    { type: "answer", number: 22, answer: ["A", "C"] },
    { type: "answer", number: 13, answer: "winter weather" },
    { type: "toggleFlag", number: 7 },
    { type: "toggleHighlight", sentenceId: "p1-2-s2" },
    { type: "pin", number: 7, sentenceId: "p1-2-s2" },
    { type: "goTo", number: 14 },
    { type: "setView", view: { sheet: "collapsed", scroll: { p1: 420 } } },
  ];
  for (const event of events) s = apply(s, test, event, T0 + 1000);
  return s;
}

/** Stores and reads back through JSON, as localStorage does. */
function stored(session: unknown, schema: unknown = SESSION_SCHEMA): unknown {
  return JSON.parse(JSON.stringify({ schema, session }));
}

function tamper(change: (s: Record<string, unknown>) => void) {
  const s = JSON.parse(JSON.stringify(richSession())) as Record<
    string,
    unknown
  >;
  change(s);
  return parseStoredSession(test, stored(s));
}

describe("parseStoredSession", () => {
  it("still reads sessions stored in the M4 format, in progress and finished", () => {
    // Exactly what M4 wrote to localStorage (ADR-0006); M5 must keep reading
    // it while the demo test stays at content version 1 (ADR-0009, D23).
    const m4InProgress = {
      schema: 1,
      session: {
        testId: "demo-academic-1",
        testVersion: 1,
        mode: "practice",
        status: "inProgress",
        startedAt: T0,
        currentQuestion: 22,
        answers: { "1": "TRUE", "13": "winter weather", "22": ["C", "A"] },
        flagged: [7],
        highlights: ["p1-2-s2", "p2-c-s3"],
        pins: { "7": ["p1-2-s2"] },
        view: { sheet: "partial", passage: 2, scroll: { p1: 420 } },
      },
    };
    const m4Finished = {
      schema: 1,
      session: {
        ...m4InProgress.session,
        mode: "exam",
        pins: {},
        status: "finished",
        finishReason: "timeUp",
        finishedAt: T0 + 3_600_000,
      },
    };

    expect(parseStoredSession(test, m4InProgress)).toEqual(
      m4InProgress.session,
    );
    expect(parseStoredSession(test, m4Finished)).toEqual(m4Finished.session);
  });

  it("reads back what was stored, in Practice and after finishing", () => {
    const s = richSession();
    expect(parseStoredSession(test, stored(s))).toEqual(s);

    const finished = apply(s, test, { type: "finish" }, T0 + 2000);
    expect(parseStoredSession(test, stored(finished))).toEqual(finished);
  });

  it("keeps an Exam session's clock across a reload", () => {
    const s = apply(
      startSession(test, "exam", T0),
      test,
      { type: "answer", number: 1, answer: "TRUE" },
      T0 + 1000,
    );
    const reloaded = parseStoredSession(test, stored(s));
    expect(reloaded).toEqual(s);
    expect(reloaded && remainingMs(reloaded, test, T0 + 20 * 60_000)).toBe(
      40 * 60_000,
    );
  });

  it("ignores fields it does not know", () => {
    const parsed = tamper((s) => (s.isAdmin = true));
    expect(parsed).toBeDefined();
    expect(parsed).not.toHaveProperty("isAdmin");
  });

  it.each<[string, (s: Record<string, unknown>) => void]>([
    ["another test", (s) => (s.testId = "other-test")],
    ["another content version", (s) => (s.testVersion = 2)],
    ["an unknown mode", (s) => (s.mode = "relaxed")],
    ["a finished session without a reason", (s) => (s.status = "finished")],
    ["a question number outside the test", (s) => (s.currentQuestion = 41)],
    [
      "an answer under a key that is not a unit",
      (s) => ((s.answers as Record<string, unknown>)["23"] = ["A"]),
    ],
    [
      "an answer that is not an option",
      (s) => ((s.answers as Record<string, unknown>)["1"] = "MAYBE"),
    ],
    [
      "too many choices",
      (s) => ((s.answers as Record<string, unknown>)["22"] = ["A", "B", "C"]),
    ],
    ["duplicate flags", (s) => (s.flagged = [7, 7])],
    ["an unknown highlighted sentence", (s) => (s.highlights = ["p9-z-s9"])],
    [
      "more than three pins",
      (s) =>
        ((s.pins as Record<string, unknown>)["7"] = [
          "p1-1-s1",
          "p1-1-s2",
          "p1-1-s3",
          "p1-2-s1",
        ]),
    ],
    [
      "a pin from another passage",
      (s) => ((s.pins as Record<string, unknown>)["7"] = ["p2-a-s1"]),
    ],
    ["pins in Exam Mode", (s) => (s.mode = "exam")],
    [
      "a sheet state that does not exist",
      (s) => ((s.view as Record<string, unknown>).sheet = "huge"),
    ],
    [
      "a negative scroll position",
      (s) => ((s.view as Record<string, unknown>).scroll = { p1: -5 }),
    ],
  ])("reads %s as no session", (_, change) => {
    expect(tamper(change)).toBeUndefined();
  });

  it("reads another schema, or something that is not a session, as no session", () => {
    expect(parseStoredSession(test, stored(richSession(), 2))).toBeUndefined();
    expect(parseStoredSession(test, "hello")).toBeUndefined();
    expect(
      parseStoredSession(test, { schema: SESSION_SCHEMA, session: null }),
    ).toBeUndefined();
  });
});
