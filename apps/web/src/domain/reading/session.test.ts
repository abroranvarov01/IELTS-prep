import { describe, expect, it } from "vitest";
import { demoTest as test, testSessionId } from "./demo-test.fixture";
import {
  type ReadingEvent,
  type ReadingSession,
  answeredNumbers,
  apply,
  dueWarning,
  remainingMs,
  startSession,
} from "./session";

const T0 = Date.UTC(2026, 9, 10, 9, 0);
const MINUTE = 60_000;

function run(session: ReadingSession, ...events: ReadingEvent[]) {
  return events.reduce(
    (s, event) => apply(s, test, event, T0 + MINUTE),
    session,
  );
}
const practice = () => startSession(test, "practice", T0, testSessionId());
const exam = () => startSession(test, "exam", T0, testSessionId());

describe("a Reading session", () => {
  it("starts at question 1 of passage 1, in the partial sheet, with nothing answered", () => {
    expect(practice()).toMatchObject({
      status: "inProgress",
      currentQuestion: 1,
      answers: {},
      flagged: [],
      view: { sheet: "partial", passage: 1 },
    });
  });

  it("records a choice, replaces it, and refuses anything that is not an option", () => {
    const s = run(
      practice(),
      { type: "answer", number: 1, answer: "TRUE" },
      { type: "answer", number: 1, answer: "NOT GIVEN" },
    );
    expect(s.answers["1"]).toBe("NOT GIVEN");
    expect(run(s, { type: "answer", number: 1, answer: "MAYBE" })).toBe(s);
    expect(run(s, { type: "answer", number: 5, answer: "Z" })).toBe(s);
    expect(run(s, { type: "answer", number: 99, answer: "TRUE" })).toBe(s);
  });

  it("clears an answer", () => {
    const s = run(
      practice(),
      { type: "answer", number: 5, answer: "B" },
      { type: "clearAnswer", number: 5 },
    );
    expect(s.answers).toEqual({});
  });

  it("keeps 'choose two' within two different options, and counts one number per choice", () => {
    const one = run(practice(), { type: "answer", number: 23, answer: ["C"] });
    expect(one.answers).toEqual({ "22": ["C"] });
    expect([...answeredNumbers(one, test)]).toEqual([22]);

    const two = run(one, { type: "answer", number: 22, answer: ["C", "A"] });
    expect([...answeredNumbers(two, test)]).toEqual([22, 23]);
    expect(
      run(two, { type: "answer", number: 22, answer: ["A", "B", "C"] }),
    ).toBe(two);
    expect(run(two, { type: "answer", number: 22, answer: ["A", "A"] })).toBe(
      two,
    );
    expect(run(two, { type: "answer", number: 22, answer: ["F"] })).toBe(two);
  });

  it("matches only with the group's options or the passage's paragraph letters", () => {
    const s = run(
      practice(),
      { type: "answer", number: 14, answer: "ii" },
      { type: "answer", number: 19, answer: "D" },
    );
    expect(s.answers).toEqual({ "14": "ii", "19": "D" });
    expect(run(s, { type: "answer", number: 14, answer: "ix" })).toBe(s);
    expect(run(s, { type: "answer", number: 19, answer: "F" })).toBe(s);
  });

  it("keeps typed answers as typed, and a blank answer does not count", () => {
    const s = run(practice(), {
      type: "answer",
      number: 13,
      answer: "winter weather ",
    });
    expect(s.answers["13"]).toBe("winter weather ");
    expect(answeredNumbers(s, test).has(13)).toBe(true);
    expect(
      run(s, { type: "answer", number: 13, answer: "   " }).answers,
    ).toEqual({});
  });

  it("moves between questions and shows the question's passage", () => {
    const s = run(practice(), { type: "goTo", number: 14 });
    expect(s.currentQuestion).toBe(14);
    expect(s.view.passage).toBe(2);
    expect(run(s, { type: "goTo", number: 41 })).toBe(s);
  });

  it("marks and unmarks questions for review", () => {
    const s = run(
      practice(),
      { type: "toggleFlag", number: 9 },
      { type: "toggleFlag", number: 3 },
    );
    expect(s.flagged).toEqual([3, 9]);
    expect(run(s, { type: "toggleFlag", number: 9 }).flagged).toEqual([3]);
  });

  it("highlights and unhighlights sentences of the test only", () => {
    const s = run(practice(), {
      type: "toggleHighlight",
      sentenceId: "p2-c-s2",
    });
    expect(s.highlights).toEqual(["p2-c-s2"]);
    expect(
      run(s, { type: "toggleHighlight", sentenceId: "p2-c-s2" }).highlights,
    ).toEqual([]);
    expect(run(s, { type: "toggleHighlight", sentenceId: "nope" })).toBe(s);
  });

  it("pins up to three sentences of the question's own passage, in Practice only", () => {
    const pin = (sentenceId: string): ReadingEvent => ({
      type: "pin",
      number: 15,
      sentenceId,
    });
    const s = run(practice(), pin("p2-b-s2"), pin("p2-b-s3"), pin("p2-b-s4"));
    expect(s.pins).toEqual({ "15": ["p2-b-s2", "p2-b-s3", "p2-b-s4"] });
    expect(run(s, pin("p2-b-s1"))).toBe(s);
    expect(run(practice(), pin("p1-1-s1")).pins).toEqual({});
    expect(run(s, pin("p2-b-s2"))).toBe(s);

    const unpinned = run(s, {
      type: "unpin",
      number: 15,
      sentenceId: "p2-b-s3",
    });
    expect(unpinned.pins).toEqual({ "15": ["p2-b-s2", "p2-b-s4"] });

    expect(run(exam(), pin("p2-b-s2")).pins).toEqual({});
  });

  it("lets Exam Mode highlight and mark for review, as computer-delivered IELTS does", () => {
    const s = run(
      exam(),
      { type: "toggleHighlight", sentenceId: "p1-1-s1" },
      { type: "toggleFlag", number: 3 },
    );
    expect(s.highlights).toEqual(["p1-1-s1"]);
    expect(s.flagged).toEqual([3]);
  });

  it("is final once finished", () => {
    const s = run(
      practice(),
      { type: "answer", number: 1, answer: "TRUE" },
      { type: "finish" },
    );
    expect(s).toMatchObject({
      status: "finished",
      finishReason: "user",
      finishedAt: T0 + MINUTE,
    });
    expect(run(s, { type: "answer", number: 1, answer: "FALSE" })).toBe(s);
  });
});

describe("the Exam clock", () => {
  it("counts down from 60 minutes, derived from the stored start", () => {
    const s = exam();
    expect(remainingMs(s, test, T0)).toBe(60 * MINUTE);
    // A reload 59 minutes later sees the same clock.
    expect(remainingMs(s, test, T0 + 59 * MINUTE)).toBe(MINUTE);
  });

  it("finishes the test at 0:00, even without an event from the user", () => {
    const end = T0 + 60 * MINUTE;
    const s = apply(exam(), test, { type: "tick" }, end);
    expect(s).toMatchObject({
      status: "finished",
      finishReason: "timeUp",
      finishedAt: end,
    });
  });

  it("does not take answers after the time is up, even when the page was closed", () => {
    const late = apply(
      exam(),
      test,
      { type: "answer", number: 1, answer: "TRUE" },
      T0 + 75 * MINUTE,
    );
    expect(late.answers).toEqual({});
    expect(late.finishedAt).toBe(T0 + 60 * MINUTE);
  });

  it("keeps running while the user is away, and they continue where they were before the end", () => {
    const left = apply(
      exam(),
      test,
      { type: "answer", number: 1, answer: "TRUE" },
      T0 + MINUTE,
    );
    const back = apply(
      left,
      test,
      { type: "answer", number: 2, answer: "FALSE" },
      T0 + 50 * MINUTE,
    );
    expect(back.status).toBe("inProgress");
    expect(back.answers).toEqual({ "1": "TRUE", "2": "FALSE" });
    expect(remainingMs(back, test, T0 + 50 * MINUTE)).toBe(10 * MINUTE);
  });

  it("is still running one millisecond before the end", () => {
    const s = apply(exam(), test, { type: "tick" }, T0 + 60 * MINUTE - 1);
    expect(s.status).toBe("inProgress");
    expect(remainingMs(s, test, T0 + 60 * MINUTE - 1)).toBe(1);
  });

  it("keeps a finish by the user, which the clock does not change later", () => {
    const s = apply(exam(), test, { type: "finish" }, T0 + 30 * MINUTE);
    expect(s).toMatchObject({
      finishReason: "user",
      finishedAt: T0 + 30 * MINUTE,
    });
    expect(apply(s, test, { type: "tick" }, T0 + 90 * MINUTE)).toBe(s);
  });

  it("warns during the minute after 10 and after 5 minutes are left", () => {
    expect(dueWarning(11 * MINUTE)).toBeUndefined();
    expect(dueWarning(10 * MINUTE + 1)).toBeUndefined();
    expect(dueWarning(10 * MINUTE)).toBe(10);
    expect(dueWarning(9 * MINUTE + 1)).toBe(10);
    expect(dueWarning(9 * MINUTE)).toBeUndefined();
    expect(dueWarning(5 * MINUTE)).toBe(5);
    expect(dueWarning(4 * MINUTE + 1)).toBe(5);
    expect(dueWarning(4 * MINUTE)).toBeUndefined();
    expect(dueWarning(0)).toBeUndefined();
  });

  it("does not exist in Practice", () => {
    const s = practice();
    expect(remainingMs(s, test, T0 + 600 * MINUTE)).toBeUndefined();
    expect(apply(s, test, { type: "tick" }, T0 + 600 * MINUTE).status).toBe(
      "inProgress",
    );
  });
});
