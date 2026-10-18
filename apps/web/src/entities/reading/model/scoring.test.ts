import { describe, expect, it } from "vitest";
import { demoKey, demoTest, demoTestWithTable } from "./demo-test.fixture";
import type { AnswerKey } from "./parse-content";
import {
  type CheckedAnswers,
  type Outcome,
  checkAttempt,
  normalizeTypedAnswer,
  optionMarks,
  unitOutcome,
} from "./scoring";
import type { Answer } from "./session";
import { questionUnits, unitOf } from "./units";

describe("normalizing a typed answer", () => {
  it("ignores letter case (IDP: capitalization is not important in Reading)", () => {
    expect(normalizeTypedAnswer("Winter Weather")).toBe("winter weather");
    expect(normalizeTypedAnswer("BASKETS")).toBe("baskets");
  });

  it("ignores surrounding and repeated spaces", () => {
    expect(normalizeTypedAnswer("  winter \t  weather ")).toBe(
      "winter weather",
    );
  });

  it("reads typographic apostrophes and phone hyphens as plain ones", () => {
    expect(normalizeTypedAnswer("parents\u2019 group")).toBe("parents' group");
    expect(normalizeTypedAnswer("o\u02BCclock")).toBe("o'clock");
    expect(normalizeTypedAnswer("check\u2010in")).toBe("check-in");
    expect(normalizeTypedAnswer("check\u2011in")).toBe("check-in");
  });

  it("ignores one trailing full stop, as owner policy (D2), not an official rule", () => {
    expect(normalizeTypedAnswer("air.")).toBe("air");
    expect(normalizeTypedAnswer("air. ")).toBe("air");
    expect(normalizeTypedAnswer("air..")).toBe("air.");
  });

  it("keeps commas, semicolons, colons and other marks", () => {
    expect(normalizeTypedAnswer("air,")).toBe("air,");
    expect(normalizeTypedAnswer("air;")).toBe("air;");
    expect(normalizeTypedAnswer("air:")).toBe("air:");
    expect(normalizeTypedAnswer("air!")).toBe("air!");
  });

  it("never corrects spelling or word form", () => {
    expect(normalizeTypedAnswer("pavments")).toBe("pavments");
    expect(normalizeTypedAnswer("strengthen")).toBe("strengthen");
  });

  it("uses one Unicode form for the same letters", () => {
    expect(normalizeTypedAnswer("cafe\u0301")).toBe("caf\u00e9");
  });
});

const T = demoTest;

/** An attempt with these answers and pins, finished by the learner. */
function attempt(
  answers: Record<string, Answer>,
  extra: Partial<CheckedAnswers> = {},
): CheckedAnswers {
  return { answers, pins: {}, finishReason: "user", ...extra };
}

function check(
  answers: Record<string, Answer>,
  extra?: Partial<CheckedAnswers>,
) {
  return checkAttempt(T, demoKey, attempt(answers, extra));
}

/** A copy of the demo key with other accepted answers for one question. */
function keyWith(number: number, accept: string[]): AnswerKey {
  const entry = demoKey.answers[number];
  if (!entry) throw new Error(`no question ${number}`);
  return {
    ...demoKey,
    answers: { ...demoKey.answers, [number]: { ...entry, accept } },
  };
}

/** Every question answered as the key's first accepted answer. */
function allCorrect(): Record<string, Answer> {
  const answers: Record<string, Answer> = {};
  for (const unit of questionUnits(T)) {
    const accept = demoKey.answers[unit.numbers[0] ?? 0]?.accept ?? [];
    answers[unit.key] = unit.kind === "multi" ? accept : (accept[0] ?? "");
  }
  return answers;
}

describe("checking an attempt", () => {
  it("gives one mark per correct question and keeps unanswered questions in the total (ielts.org: each correct answer receives 1 mark)", () => {
    const result = check({ "1": "TRUE", "2": "TRUE" });
    expect(result.outcomes[1]).toBe("correct");
    expect(result.outcomes[2]).toBe("incorrect");
    expect(result.outcomes[3]).toBe("unanswered");
    expect(result.score).toEqual({
      kind: "practiceRawScore",
      marks: 1,
      positions: 40,
    });
  });

  it("scores the demo test out of exactly 40 positions, at most 40 marks", () => {
    const result = check(allCorrect());
    expect(result.score.marks).toBe(40);
    expect(result.score.positions).toBe(40);
    expect(Object.keys(result.outcomes)).toHaveLength(40);
    expect(check({}).score).toEqual({
      kind: "practiceRawScore",
      marks: 0,
      positions: 40,
    });
  });

  it("checks choose-one and choose-from-a-list questions by the chosen option", () => {
    const result = check({
      "5": "B",
      "6": "A",
      "14": "ii",
      "15": "iii",
      "19": "D",
      "38": "A",
    });
    expect([5, 6, 14, 15, 19, 38].map((n) => result.outcomes[n])).toEqual([
      "correct",
      "incorrect",
      "correct",
      "incorrect",
      "correct",
      "correct",
    ]);
  });

  it("checks a retry only on its own questions", () => {
    const result = check({ "5": "B", "22": ["A"] }, { questions: [5, 22, 23] });
    expect(result.outcomes).toEqual({
      5: "correct",
      22: "correct",
      23: "unanswered",
    });
    expect(result.score).toEqual({
      kind: "practiceRawScore",
      marks: 2,
      positions: 3,
    });
  });
});

describe("checking typed answers", () => {
  const typed = (n: number, answer: string, key: AnswerKey = demoKey) =>
    checkAttempt(T, key, attempt({ [n]: answer })).outcomes[n];

  it("ignores case, spaces, typographic apostrophes and one trailing full stop", () => {
    expect(typed(13, "Winter Weather")).toBe("correct");
    expect(typed(13, "  winter   weather ")).toBe("correct");
    expect(typed(13, "winter weather.")).toBe("correct");
  });

  it("keeps a trailing comma, semicolon or colon (owner decision D2)", () => {
    expect(typed(13, "winter weather,")).toBe("incorrect");
    expect(typed(13, "winter weather;")).toBe("incorrect");
    expect(typed(13, "winter weather:")).toBe("incorrect");
  });

  it("accepts every variant listed in the key and nothing else", () => {
    expect(typed(13, "the winter weather")).toBe("correct");
    expect(typed(13, "cold weather")).toBe("incorrect");
  });

  it("marks a misspelt answer incorrect (Cambridge IELTS FAQs: spelling mistakes lose the mark)", () => {
    expect(typed(11, "pavments")).toBe("incorrect");
    expect(typed(24, "strengthen")).toBe("incorrect");
  });

  it("accepts British and American spellings only when the key lists both (ielts.org Teacher's guide accepts both)", () => {
    expect(typed(11, "pavements", keyWith(11, ["centre"]))).toBe("incorrect");
    expect(typed(11, "center", keyWith(11, ["centre"]))).toBe("incorrect");
    expect(typed(11, "center", keyWith(11, ["centre", "center"]))).toBe(
      "correct",
    );
  });

  it("never accepts an answer over the word limit (ielts.org: you lose the mark for more words than the limit)", () => {
    expect(typed(9, "air")).toBe("correct");
    expect(typed(9, "cleaner air")).toBe("incorrect");
  });

  it("treats an empty or blank answer as unanswered, not incorrect", () => {
    expect(typed(7, "   ")).toBe("unanswered");
    expect(typed(7, "")).toBe("unanswered");
  });
});

describe("'choose two' (questions 22–23, accepted A and C, in either order)", () => {
  const item = (answer?: string[]) => {
    const unit = unitOf(questionUnits(T), 22);
    if (!unit) throw new Error("no unit 22");
    const result = check(answer ? { "22": answer } : {});
    const outcomes = [result.outcomes[22], result.outcomes[23]];
    return {
      marks: result.score.marks,
      outcomes,
      unit: unitOutcome(outcomes as Outcome[]),
      options: optionMarks(unit, answer, ["A", "C"]),
    };
  };

  it("gives 2 marks for both correct letters, in either order", () => {
    for (const answer of [
      ["A", "C"],
      ["C", "A"],
    ]) {
      expect(item(answer)).toEqual({
        marks: 2,
        outcomes: ["correct", "correct"],
        unit: "correct",
        options: { A: "yourAnswerCorrect", C: "yourAnswerCorrect" },
      });
    }
  });

  it("gives 1 mark for one correct and one wrong letter, whichever comes first", () => {
    for (const answer of [
      ["A", "B"],
      ["B", "A"],
    ]) {
      expect(item(answer)).toEqual({
        marks: 1,
        outcomes: ["correct", "incorrect"],
        unit: "partlyCorrect",
        options: {
          A: "yourAnswerCorrect",
          B: "yourAnswerIncorrect",
          C: "correctAnswer",
        },
      });
    }
  });

  it("gives no mark when no chosen letter is correct", () => {
    expect(item(["B", "D"])).toEqual({
      marks: 0,
      outcomes: ["incorrect", "incorrect"],
      unit: "incorrect",
      options: {
        A: "correctAnswer",
        B: "yourAnswerIncorrect",
        C: "correctAnswer",
        D: "yourAnswerIncorrect",
      },
    });
  });

  it("counts a partial answer: one letter chosen leaves one position unanswered", () => {
    expect(item(["C"])).toEqual({
      marks: 1,
      outcomes: ["correct", "unanswered"],
      unit: "partlyCorrect",
      options: { A: "correctAnswer", C: "yourAnswerCorrect" },
    });
    expect(item(["E"])).toEqual({
      marks: 0,
      outcomes: ["incorrect", "unanswered"],
      unit: "incorrect",
      options: {
        A: "correctAnswer",
        C: "correctAnswer",
        E: "yourAnswerIncorrect",
      },
    });
  });

  it("counts nothing chosen as no answer on both positions", () => {
    expect(item()).toEqual({
      marks: 0,
      outcomes: ["unanswered", "unanswered"],
      unit: "unanswered",
      options: { A: "correctAnswer", C: "correctAnswer" },
    });
  });

  it("never gives a mark twice for a repeated letter, a mark for an unknown id, or more than 2 marks", () => {
    expect(item(["A", "A"]).marks).toBe(1);
    expect(item(["A", "Z"]).outcomes).toEqual(["correct", "unanswered"]);
    expect(item(["A", "C", "E"]).marks).toBe(2);
  });
});

describe("signals on statements", () => {
  const signals = (n: number, answer: string) =>
    check({ [n]: answer }).signals[String(n)] ?? [];

  it("notes NOT GIVEN chosen where the passage contradicts the statement, in facts or views", () => {
    expect(signals(4, "NOT GIVEN")).toEqual([
      { code: "ngInsteadOfFalse", wording: "facts" },
    ]);
    expect(signals(28, "NOT GIVEN")).toEqual([
      { code: "ngInsteadOfFalse", wording: "views" },
    ]);
  });

  it("notes FALSE or NO chosen where the answer is NOT GIVEN", () => {
    expect(signals(3, "FALSE")).toEqual([
      { code: "falseInsteadOfNg", wording: "facts" },
    ]);
    expect(signals(30, "NO")).toEqual([
      { code: "falseInsteadOfNg", wording: "views" },
    ]);
  });

  it("notes NOT GIVEN chosen where the statement agrees, and TRUE or YES chosen where it is NOT GIVEN", () => {
    expect(signals(1, "NOT GIVEN")).toEqual([
      { code: "ngInsteadOfTrue", wording: "facts" },
    ]);
    expect(signals(29, "NOT GIVEN")).toEqual([
      { code: "ngInsteadOfTrue", wording: "views" },
    ]);
    expect(signals(3, "TRUE")).toEqual([
      { code: "trueInsteadOfNg", wording: "facts" },
    ]);
    expect(signals(30, "YES")).toEqual([
      { code: "trueInsteadOfNg", wording: "views" },
    ]);
  });

  it("notes nothing for a correct answer or a TRUE/FALSE swap", () => {
    expect(signals(4, "FALSE")).toEqual([]);
    expect(signals(2, "TRUE")).toEqual([]);
  });
});

describe("signals on typed answers", () => {
  const signals = (n: number, answer: string, key: AnswerKey = demoKey) =>
    (
      checkAttempt(T, key, attempt({ [n]: answer })).signals[String(n)] ?? []
    ).map((s) => s.code);

  it("notes an answer exactly one letter added, missing or changed from an accepted answer", () => {
    expect(signals(11, "pavments")).toContain("oneLetterAway");
    expect(signals(11, "pavement")).toContain("oneLetterAway");
    expect(signals(10, "lines")).toContain("oneLetterAway");
    expect(signals(11, "pavemments")).toContain("oneLetterAway");
  });

  it("does not note two changes, swapped letters, a variant under 4 letters, or a correct answer", () => {
    expect(signals(11, "pavemnets")).not.toContain("oneLetterAway");
    expect(signals(11, "pavmnts")).not.toContain("oneLetterAway");
    expect(signals(9, "aid")).not.toContain("oneLetterAway");
    expect(signals(11, "pavements")).toEqual([]);
  });

  it("notes an answer over the word limit by the validator's count", () => {
    expect(signals(9, "cleaner air")).toContain("wordLimit");
    expect(signals(10, "the lanes")).not.toContain("wordLimit");
  });

  it("notes a word that is not in the question's passage, only where the key says the words come from it", () => {
    expect(signals(7, "mobile")).toContain("notFromPassage");
    expect(signals(7, "station")).not.toContain("notFromPassage");
    const entry = demoKey.answers[7];
    if (!entry) throw new Error("no question 7");
    const withoutFlag = { accept: entry.accept, evidence: entry.evidence };
    const key = { ...demoKey, answers: { ...demoKey.answers, 7: withoutFlag } };
    expect(signals(7, "mobile", key)).not.toContain("notFromPassage");
  });

  it("never changes a mark through a signal", () => {
    const result = check({ "11": "pavments" });
    expect(result.outcomes[11]).toBe("incorrect");
    expect(result.score.marks).toBe(0);
  });
});

describe("signals on unanswered questions and pins", () => {
  it("notes only unanswered questions of an attempt that ended at time-out", () => {
    const timedOut = check({ "1": "TRUE" }, { finishReason: "timeUp" });
    expect(timedOut.signals["2"]).toEqual([{ code: "timeUp" }]);
    expect(timedOut.signals["1"]).toBeUndefined();
    expect(check({}, { finishReason: "user" }).signals).toEqual({});
  });

  it("notes when no pinned sentence is one the key cites, for an answer not fully correct", () => {
    const pinned = (answer: Answer, pins: Record<string, string[]>, n = 5) =>
      (check({ [n]: answer }, { pins }).signals[String(n)] ?? []).map(
        (s) => s.code,
      );
    expect(pinned("A", { "5": ["p1-3-s2"] })).toEqual(["pinnedElsewhere"]);
    expect(pinned("A", { "5": ["p1-3-s2", "p1-3-s3"] })).toEqual([]);
    expect(pinned("B", { "5": ["p1-3-s2"] })).toEqual([]);
    expect(pinned("FALSE", { "3": ["p1-1-s1"] }, 3)).toEqual([
      "falseInsteadOfNg",
    ]);
    expect(pinned(["A", "B"], { "23": ["p2-a-s1"] }, 22)).toEqual([
      "pinnedElsewhere",
    ]);
    expect(pinned(["A", "B"], { "23": ["p2-c-s3"] }, 22)).toEqual([]);
  });

  it("notes nothing on a question left unanswered without a time-out, even with pins", () => {
    expect(check({}, { pins: { "5": ["p1-3-s2"] } }).signals).toEqual({});
  });
});

describe("the outcome of an answer unit", () => {
  it("is correct, partly correct, not correct or no answer", () => {
    expect(unitOutcome(["correct"])).toBe("correct");
    expect(unitOutcome(["incorrect"])).toBe("incorrect");
    expect(unitOutcome(["unanswered"])).toBe("unanswered");
    expect(unitOutcome(["correct", "incorrect"])).toBe("partlyCorrect");
    expect(unitOutcome(["correct", "unanswered"])).toBe("partlyCorrect");
    expect(unitOutcome(["incorrect", "unanswered"])).toBe("incorrect");
  });
});

describe("checking a table gap (M8-17)", () => {
  it("checks a typed answer in a table cell like any typed answer, word limit included", () => {
    const test = demoTestWithTable();
    const result = checkAttempt(
      test,
      demoKey,
      attempt({ "7": "Phone", "8": "a station", "9": "" }),
    );
    expect(result.outcomes[7]).toBe("correct");
    expect(result.outcomes[8]).toBe("incorrect");
    expect(result.outcomes[9]).toBe("unanswered");
  });
});
