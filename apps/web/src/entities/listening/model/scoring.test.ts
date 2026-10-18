import { describe, expect, it } from "vitest";
import type { KeyEntry, ListeningKey } from "./content";
import {
  fixtureKey,
  fixtureTest,
  fixtureTranscript,
} from "./listening-test.fixture";
import {
  parseListeningKey,
  parseListeningTest,
  parseTranscript,
} from "./parse-content";
import { type CheckedAnswers, checkAttempt, checkUnits } from "./scoring";

// The fixture: every part's transcript says "You now have some time to look
// at the questions." (0–1.2 s) and "The answer is right here." (1.2–3 s);
// every question's evidence is the second segment. Typed answers accept
// "right here" and "here" (questions 27–30: "here" only; 37: "bread",
// 38: "milk"); 21–22 accept A and C.
function parsed<T>(
  result: { ok: true; value: T } | { ok: false; errors: string[] },
): T {
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
}
const test = parsed(parseListeningTest(fixtureTest()));
const transcript = parsed(parseTranscript(test, fixtureTranscript()));

function keyWith(
  changes: Record<number, Partial<KeyEntry>> = {},
): ListeningKey {
  const key = structuredClone(
    parsed(parseListeningKey(test, transcript, fixtureKey())),
  );
  for (const [n, change] of Object.entries(changes))
    Object.assign(key.answers[Number(n)] ?? {}, change);
  return key;
}

function check(
  answers: CheckedAnswers["answers"],
  options: Partial<CheckedAnswers> & { key?: ListeningKey } = {},
) {
  const { key = keyWith(), ...attempt } = options;
  return checkAttempt(test, key, transcript, {
    mode: "practice",
    answers,
    ...attempt,
  });
}
const signalsOf = (result: ReturnType<typeof check>, unit: number) =>
  (result.signals[String(unit)] ?? []).map((s) => s.code);

const said = { segment: "p1-s2", quote: "right here" };

describe("Listening checking", () => {
  it("counts 40 scoring positions, one mark each, and nothing for no answer", () => {
    const empty = check({});
    expect(empty.score).toEqual({
      kind: "practiceRawScore",
      marks: 0,
      positions: 40,
    });
    expect(Object.values(empty.outcomes).every((o) => o === "unanswered")).toBe(
      true,
    );
  });

  it("ignores case, extra spaces and one trailing full stop (LD3, D2), but never spelling", () => {
    const result = check({ "1": "  RIGHT   Here. ", "2": "rigth here" });
    expect(result.outcomes[1]).toBe("correct");
    expect(result.outcomes[2]).toBe("incorrect");
  });

  it("accepts only the variants the key lists: numeric dates day first (LD4, product policy)", () => {
    const key = keyWith({
      36: { accept: ["24 April", "24th April", "24/04"] },
    });
    expect(check({ "36": "24/04" }, { key }).outcomes[36]).toBe("correct");
    expect(check({ "36": "04/24" }, { key }).outcomes[36]).toBe("incorrect");
  });

  it("marks choose-several letters in either order, never more than the item's numbers", () => {
    expect(check({ "21": ["C", "A"] }).outcomes).toMatchObject({
      21: "correct",
      22: "correct",
    });
    expect(check({ "21": ["A", "B"] }).outcomes).toMatchObject({
      21: "correct",
      22: "incorrect",
    });
    expect(check({ "21": ["A"] }).outcomes).toMatchObject({
      21: "correct",
      22: "unanswered",
    });
  });

  it("makes one unit of a List TWO question", () => {
    const unit = checkUnits(test).find((u) => u.numbers.includes(37));
    expect(unit?.numbers).toEqual([37, 38]);
    expect(checkUnits(test).filter((u) => u.numbers.includes(38))).toHaveLength(
      1,
    );
  });

  it("marks List TWO answers in either order, the same answer twice once (LD6)", () => {
    expect(check({ "37": "milk", "38": "Bread" }).score.marks).toBe(2);
    expect(check({ "37": "bread", "38": "bread" }).outcomes).toMatchObject({
      37: "correct",
      38: "incorrect",
    });
    expect(check({ "38": "milk" }).outcomes).toMatchObject({
      37: "correct",
      38: "unanswered",
    });
  });

  it("marks List TWO answers in order when the key says the question is ordered", () => {
    const key = keyWith({ 37: { ordered: true } });
    expect(check({ "37": "milk", "38": "bread" }, { key }).score.marks).toBe(0);
    expect(check({ "37": "bread", "38": "milk" }, { key }).score.marks).toBe(2);
  });

  it("checks only the questions of a retry", () => {
    const result = check({ "1": "here" }, { questions: [1, 37, 38] });
    expect(result.score).toEqual({
      kind: "practiceRawScore",
      marks: 1,
      positions: 3,
    });
  });
});

describe("Listening signals", () => {
  it("never notes an answer accepted as correct (M9-04 clarification)", () => {
    const key = keyWith({
      1: {
        fromRecording: true,
        distractors: [{ text: "there", ...said, review: "verified" }],
      },
    });
    const result = check(
      { "1": "Right Here", "37": "bread", "38": "milk" },
      { key },
    );
    expect(result.signals).toEqual({});
  });

  it("notes an answer one letter from a variant of at least 4 letters", () => {
    expect(signalsOf(check({ "1": "rigt here" }), 1)).toContain(
      "oneLetterAway",
    );
    expect(signalsOf(check({ "27": "hare" }), 27)).toContain("oneLetterAway");
    const short = keyWith({ 27: { accept: ["bus"] } });
    expect(signalsOf(check({ "27": "bun" }, { key: short }), 27)).not.toContain(
      "oneLetterAway",
    );
  });

  it("notes an answer over the word limit, a number part counted once", () => {
    expect(signalsOf(check({ "27": "right here" }), 27)).toContain("wordLimit");
    expect(signalsOf(check({ "1": "about 6:45" }), 1)).not.toContain(
      "wordLimit",
    );
    expect(signalsOf(check({ "1": "about six forty" }), 1)).toContain(
      "wordLimit",
    );
  });

  it("notes a word that is neither in the part's transcript nor in a variant, only where the recording's words are required", () => {
    const fromRecording = keyWith({
      1: { fromRecording: true, accept: ["right here", "here", "yonder"] },
    });
    expect(
      signalsOf(check({ "1": "THERE" }, { key: fromRecording }), 1),
    ).toContain("notInTranscript");
    expect(
      signalsOf(check({ "1": "yonder here" }, { key: fromRecording }), 1),
    ).not.toContain("notInTranscript");
    expect(signalsOf(check({ "1": "there" }), 1)).not.toContain(
      "notInTranscript",
    );
  });

  it("notes numbers that differ only as -teen and -ty, in figures or words", () => {
    const key = keyWith({ 36: { accept: ["30", "thirty"] } });
    for (const answer of ["13", "thirteen"])
      expect(signalsOf(check({ "36": answer }, { key }), 36)).toEqual([
        "teenTyNumber",
      ]);
    for (const answer of ["14", "31", "3"])
      expect(signalsOf(check({ "36": answer }, { key }), 36)).not.toContain(
        "teenTyNumber",
      );
  });

  it("notes the same digits written differently", () => {
    const key = keyWith({ 36: { accept: ["6:45", "6.45"] } });
    expect(signalsOf(check({ "36": "6-45" }, { key }), 36)).toEqual([
      "sameDigitsDifferentForm",
    ]);
    expect(signalsOf(check({ "36": "6:54" }, { key }), 36)).toEqual([]);
  });

  it("notes a mentioned option only from a distractor entry verified against the recording (LD13)", () => {
    const entry = (review: "aiDraft" | "verified") =>
      keyWith({ 8: { distractors: [{ option: "B", ...said, review }] } });
    expect(
      signalsOf(check({ "8": "B" }, { key: entry("verified") }), 8),
    ).toEqual(["mentionedOption"]);
    expect(
      signalsOf(check({ "8": "B" }, { key: entry("aiDraft") }), 8),
    ).toEqual([]);
    expect(
      signalsOf(check({ "8": "C" }, { key: entry("verified") }), 8),
    ).toEqual([]);
    const typed = keyWith({
      1: { distractors: [{ text: "there", ...said, review: "verified" }] },
    });
    expect(signalsOf(check({ "1": "There." }, { key: typed }), 1)).toContain(
      "mentionedOption",
    );
  });
});

describe("notes on unanswered questions", () => {
  const exam = (options: Partial<CheckedAnswers>) =>
    check({}, { mode: "exam", finishReason: "user", ...options });

  it("says nothing in Practice", () => {
    expect(check({}, { finishReason: "timeUp" }).signals).toEqual({});
  });

  it("says the recording had not reached a question only from recorded playback before its evidence", () => {
    const result = exam({
      finishReason: "audioFailed",
      playedToMs: { 1: 1199, 2: 1200 },
    });
    expect(signalsOf(result, 1)).toEqual(["notReached"]);
    expect(signalsOf(result, 11)).toEqual([]);
  });

  it("says nothing about hearing a question when playback coverage is unknown", () => {
    expect(exam({ finishReason: "audioFailed" }).signals).toEqual({});
    expect(exam({ playedToMs: { 2: 0 } }).signals["1"]).toBeUndefined();
  });

  it("states that the check time ended, not why the question had no answer", () => {
    const result = exam({ finishReason: "timeUp", playedToMs: { 1: 3000 } });
    expect(signalsOf(result, 1)).toEqual(["timeUp"]);
    expect(
      signalsOf(exam({ finishReason: "user", playedToMs: { 1: 3000 } }), 1),
    ).toEqual([]);
  });
});
