import { describe, expect, it } from "vitest";
import { type ReadingAttempt, attemptFromSession } from "./attempts";
import { demoKey, demoTest as test, testSessionId } from "./demo-test.fixture";
import type { AnswerKey } from "./parse-content";
import {
  currentResult,
  latestRecord,
  positionCounts,
  reviewOffer,
  unitOutcomes,
} from "./results";
import { checkAttempt } from "./scoring";
import { type Answer, apply, startSession } from "./session";

const T0 = Date.UTC(2026, 9, 11, 9, 0);

function attemptWith(answers: Record<string, Answer>): ReadingAttempt {
  let s = startSession(test, "practice", T0, testSessionId());
  for (const [number, answer] of Object.entries(answers))
    s = apply(s, test, { type: "answer", number: Number(number), answer }, T0);
  const a = attemptFromSession(
    apply(s, test, { type: "finish" }, T0 + 1),
    T0 + 2,
  );
  if (!a) throw new Error("not finished");
  return a;
}

function recordOf(attempt: ReadingAttempt, key: AnswerKey, checkedAt: number) {
  return {
    attemptId: attempt.id,
    keyRevision: key.revision,
    rulesVersion: 1,
    checkedAt,
    ...checkAttempt(test, key, attempt),
  };
}

/** A corrected key (revision 2) that also accepts "pavement" for question 11. */
const correctedKey: AnswerKey = {
  ...demoKey,
  revision: 2,
  answers: {
    ...demoKey.answers,
    11: { ...demoKey.answers[11]!, accept: ["pavements", "pavement"] },
  },
};

describe("the result shown for the current key revision and rules version", () => {
  const attempt = attemptWith({ "1": "TRUE", "11": "pavement" });
  const first = recordOf(attempt, demoKey, T0 + 10);

  it("is the record of the current pair, with no notice when it is the only one", () => {
    expect(currentResult([first], { keyRevision: 1, rulesVersion: 1 })).toEqual(
      { record: first },
    );
    expect(
      currentResult([first], { keyRevision: 2, rulesVersion: 1 }),
    ).toBeUndefined();
  });

  it("notices a correction that changed the score, and quotes the earlier score", () => {
    const rechecked = recordOf(attempt, correctedKey, T0 + 20);
    expect(rechecked.score.marks).toBe(2);
    expect(
      currentResult([first, rechecked], { keyRevision: 2, rulesVersion: 1 }),
    ).toEqual({ record: rechecked, correction: { earlierScore: 1 } });
  });

  it("notices a correction that changed answers or notes but not the score, without quoting a score", () => {
    const pavmentAttempt = attemptWith({ "11": "pavments" });
    const before = recordOf(pavmentAttempt, demoKey, T0 + 10);
    // With "sidewalks" accepted instead, "pavments" is still not correct but
    // no longer one letter away: a note changes, the score does not.
    const noteChange: AnswerKey = {
      ...demoKey,
      revision: 2,
      answers: {
        ...demoKey.answers,
        11: { ...demoKey.answers[11]!, accept: ["sidewalks"] },
      },
    };
    const after = recordOf(pavmentAttempt, noteChange, T0 + 20);
    expect(after.score.marks).toBe(before.score.marks);
    expect(
      currentResult([before, after], { keyRevision: 2, rulesVersion: 1 }),
    ).toEqual({ record: after, correction: {} });
  });

  it("gives no notice when a recheck changed nothing the learner sees", () => {
    const same = { ...recordOf(attempt, demoKey, T0 + 20), keyRevision: 2 };
    expect(
      currentResult([first, same], { keyRevision: 2, rulesVersion: 1 }),
    ).toEqual({ record: same });
  });

  it("falls back to the most recent record for an attempt of an earlier content version", () => {
    const later = { ...first, keyRevision: 2, checkedAt: T0 + 30 };
    expect(latestRecord([first, later])).toBe(later);
    expect(latestRecord([])).toBeUndefined();
  });
});

describe("counts and the review offer", () => {
  it("counts positions not correct and not answered, adding up to 40 with the score", () => {
    const record = recordOf(
      attemptWith({ "1": "TRUE", "2": "TRUE", "22": ["A"] }),
      demoKey,
      T0,
    );
    expect(positionCounts(record)).toEqual({ incorrect: 1, unanswered: 37 });
    expect(record.score.marks).toBe(2);
  });

  it("names mistakes and unanswered questions, counting a partly correct item as a mistake", () => {
    const offerFor = (answers: Record<string, Answer>) => {
      const attempt = attemptWith(answers);
      return reviewOffer(
        unitOutcomes(test, attempt, recordOf(attempt, demoKey, T0)),
      );
    };
    expect(offerFor({ "1": "FALSE" })).toBe("mistakesAndUnanswered");
    expect(offerFor({ "1": "TRUE" })).toBe("unanswered");
    expect(reviewOffer([{ outcome: "partlyCorrect" }])).toBe("mistakes");
    expect(reviewOffer([{ outcome: "correct" }])).toBe("answers");
  });

  it("gives a 'choose two' item one outcome, as one unit", () => {
    const attempt = attemptWith({ "22": ["A", "B"] });
    const item = unitOutcomes(
      test,
      attempt,
      recordOf(attempt, demoKey, T0),
    ).filter((u) => u.unit.numbers.includes(22));
    expect(item.map((u) => [u.unit.numbers, u.outcome])).toEqual([
      [[22, 23], "partlyCorrect"],
    ]);
  });
});
