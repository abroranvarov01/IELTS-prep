import { describe, expect, it } from "vitest";
import { fixtureTest } from "./listening-test.fixture";
import { parseListeningTest } from "./parse-content";
import { SESSION_SCHEMA, parseStoredSession } from "./parse-session";
import { apply, startSession } from "./session";

const parsed = parseListeningTest(fixtureTest());
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
const test = parsed.value;
const T0 = 1_000_000;
const ID = "s-12345678-1234-4123-8123-123456789abc";

const stored = (session: unknown) =>
  JSON.parse(JSON.stringify({ schema: SESSION_SCHEMA, session })) as {
    schema: number;
    session: Record<string, unknown>;
  };

const practice = apply(
  apply(
    startSession(test, "practice", T0, ID),
    test,
    { type: "answer", number: 21, answer: ["A"] },
    T0,
  ),
  test,
  { type: "setPosition", partId: "p3", positionMs: 1200 },
  T0,
);
const exam = apply(
  apply(
    startSession(test, "exam", T0, ID),
    test,
    { type: "startRecording" },
    T0,
  ),
  test,
  { type: "audioFailed" },
  T0 + 500,
);

describe("a stored Listening session", () => {
  it("reads back exactly what was saved, in both modes", () => {
    expect(parseStoredSession(test, stored(practice))).toEqual(practice);
    expect(parseStoredSession(test, stored(exam))).toEqual(exam);
  });

  it("reads as no session with another schema, test or content version", () => {
    expect(
      parseStoredSession(test, { ...stored(practice), schema: 2 }),
    ).toBeUndefined();
    const other = stored(practice);
    other.session.testVersion = 2;
    expect(parseStoredSession(test, other)).toBeUndefined();
  });

  it("reads as no session when a field is invalid", () => {
    const cases: [string, unknown][] = [
      ["sessionId", "abc"],
      ["mode", "drill"],
      ["currentQuestion", 41],
      ["flagged", [3, 3]],
      ["answers", { "8": "Z" }],
      ["answers", { "22": ["A"] }],
      ["finishReason", "user"],
      ["view", { part: 5, scroll: {} }],
      ["practice", { positions: { p3: 99_999 }, speed: 1 }],
      ["practice", { positions: {}, speed: 2 }],
      ["exam", { pausedMs: 0, interruptions: 0, lastActiveAt: T0 }],
    ];
    for (const [field, value] of cases) {
      const broken = stored(practice);
      broken.session[field] = value;
      expect(parseStoredSession(test, broken), field).toBeUndefined();
    }
  });

  it("reads an Exam pause only once the recording has started", () => {
    const broken = stored(exam);
    delete (broken.session.exam as Record<string, unknown>).recordingStartedAt;
    expect(parseStoredSession(test, broken)).toBeUndefined();
  });
});
