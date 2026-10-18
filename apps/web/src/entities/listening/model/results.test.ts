import { describe, expect, it } from "vitest";
import type { ResultRecord } from "./attempts";
import { fixtureTest } from "./listening-test.fixture";
import { parseListeningTest } from "./parse-content";
import {
  currentResult,
  positionCounts,
  reviewOffer,
  unitOutcome,
  unitOutcomes,
  wasInterrupted,
} from "./results";

const parsed = parseListeningTest(fixtureTest());
if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
const test = parsed.value;

function record(
  correct: number[],
  incorrect: number[],
  extra: Partial<ResultRecord> = {},
): ResultRecord {
  const outcomes: ResultRecord["outcomes"] = {};
  for (let n = 1; n <= 40; n++)
    outcomes[n] = correct.includes(n)
      ? "correct"
      : incorrect.includes(n)
        ? "incorrect"
        : "unanswered";
  return {
    attemptId: "s-00000000-0000-4000-8000-000000000001",
    keyRevision: 1,
    rulesVersion: 1,
    checkedAt: 1,
    outcomes,
    signals: {},
    score: { kind: "practiceRawScore", marks: correct.length, positions: 40 },
    ...extra,
  };
}

describe("Listening results", () => {
  it("count positions not correct and not answered, adding up to 40 with the score", () => {
    expect(positionCounts(record([1, 2], [3]))).toEqual({
      incorrect: 1,
      unanswered: 37,
    });
  });

  it("make one unit of a List TWO question and of a choose-two item, partly correct when half is", () => {
    const units = unitOutcomes(test, record([21, 37], [22]));
    expect(units.find((u) => u.unit.key === "21")?.outcome).toBe(
      "partlyCorrect",
    );
    expect(units.find((u) => u.unit.key === "37")?.outcome).toBe(
      "partlyCorrect",
    );
    expect(units.some((u) => u.unit.key === "38")).toBe(false);
    expect(unitOutcome(["unanswered", "unanswered"])).toBe("unanswered");
  });

  it("name the review the button opens, a partly correct unit counting as a mistake", () => {
    const all = Array.from({ length: 40 }, (_, i) => i + 1);
    expect(reviewOffer(unitOutcomes(test, record(all, [])))).toBe("answers");
    expect(
      reviewOffer(
        unitOutcomes(
          test,
          record(
            [21],
            all.filter((n) => n !== 21),
          ),
        ),
      ),
    ).toBe("mistakes");
    expect(reviewOffer(unitOutcomes(test, record(all.slice(1), [])))).toBe(
      "unanswered",
    );
    expect(reviewOffer(unitOutcomes(test, record([], [1])))).toBe(
      "mistakesAndUnanswered",
    );
  });

  it("show a correction only when the score, an outcome or a note changed", () => {
    const pair = { keyRevision: 2, rulesVersion: 1 };
    const before = record([1], [2]);
    const same = record([1], [2], { keyRevision: 2, checkedAt: 2 });
    const rescored = record([1, 2], [], { keyRevision: 2, checkedAt: 2 });
    const renoted = record([1], [2], {
      keyRevision: 2,
      checkedAt: 2,
      signals: { "2": [{ code: "oneLetterAway" }] },
    });
    expect(currentResult([before, same], pair)).toEqual({ record: same });
    expect(currentResult([before, rescored], pair)?.correction).toEqual({
      earlierScore: 1,
    });
    expect(currentResult([before, renoted], pair)?.correction).toEqual({});
    expect(currentResult([before], pair)).toBeUndefined();
  });

  it("call a sitting interrupted after an audio failure, finished early or continued", () => {
    const base = {
      id: "s-00000000-0000-4000-8000-000000000001",
      testId: test.id,
      testVersion: 1,
      kind: "test" as const,
      mode: "exam" as const,
      startedAt: 1,
      finishedAt: 2,
      answers: {},
      committedAt: 3,
    };
    const exam = (interruptions: number) => ({ pausedMs: 0, interruptions });
    expect(
      wasInterrupted({ ...base, finishReason: "audioFailed", exam: exam(1) }),
    ).toBe(true);
    expect(
      wasInterrupted({ ...base, finishReason: "user", exam: exam(1) }),
    ).toBe(true);
    expect(
      wasInterrupted({ ...base, finishReason: "timeUp", exam: exam(0) }),
    ).toBe(false);
  });
});
