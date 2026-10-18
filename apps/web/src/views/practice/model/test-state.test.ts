import { describe, expect, it } from "vitest";
import {
  type ReadingAttempt,
  type ResultRecord,
  apply,
  startSession,
} from "@/entities/reading";
import { demoTest as test, testSessionId } from "@/entities/reading/testing";
import { testState } from "./test-state";

const inProgress = startSession(test, "exam", 1, testSessionId(1));
const finished = apply(inProgress, test, { type: "finish" }, 2);

function attempt(kind: ReadingAttempt["kind"]): ReadingAttempt {
  return {
    id: testSessionId(2),
    testId: test.id,
    testVersion: test.version,
    kind,
    ...(kind === "retry" && { retryOf: testSessionId(3), questions: [1] }),
    mode: "practice",
    startedAt: 1,
    finishedAt: 2,
    finishReason: "user",
    answers: {},
    pins: {},
    committedAt: 3,
  };
}

const record = {
  attemptId: testSessionId(2),
  keyRevision: 1,
  rulesVersion: 1,
  checkedAt: 4,
  outcomes: {},
  signals: {},
  score: { kind: "practiceRawScore", marks: 27, positions: 40 },
} satisfies ResultRecord;

describe("testState", () => {
  it("is not started with nothing on the device", () => {
    expect(testState(undefined, [], undefined)).toEqual({ kind: "notStarted" });
  });

  it("is in progress, with its mode, even when earlier attempts are finished", () => {
    expect(testState(inProgress, [attempt("test")], record)).toEqual({
      kind: "inProgress",
      mode: "exam",
    });
  });

  it("is finished with the latest stored practice score", () => {
    expect(testState(undefined, [attempt("test")], record)).toEqual({
      kind: "finished",
      score: record.score,
    });
  });

  it("is finished without a score when no result was shown yet, or the finished session is not committed", () => {
    expect(testState(undefined, [attempt("test")], undefined)).toEqual({
      kind: "finished",
    });
    expect(testState(finished, [], undefined)).toEqual({ kind: "finished" });
  });

  it("does not count a retry as taking the test", () => {
    expect(testState(undefined, [attempt("retry")], undefined)).toEqual({
      kind: "notStarted",
    });
  });
});
