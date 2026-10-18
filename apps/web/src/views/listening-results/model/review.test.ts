import { describe, expect, it } from "vitest";
import {
  type QuestionGroup,
  type ResultRecord,
  checkUnits,
} from "@/entities/listening";
import {
  fixtureListeningKey as key,
  fixtureListeningTest as test,
  fixtureListeningTranscript as transcript,
} from "@/entities/listening/testing";
import {
  evidenceOf,
  evidenceStretch,
  gapContext,
  markQuotes,
  reviewAudioSource,
  reviewCards,
  reviewPosition,
} from "./review";

function record(correct: number[]): ResultRecord {
  const outcomes: ResultRecord["outcomes"] = {};
  for (let n = 1; n <= 40; n++)
    outcomes[n] = correct.includes(n) ? "correct" : "unanswered";
  return {
    attemptId: "s-00000000-0000-4000-8000-000000000001",
    keyRevision: 1,
    rulesVersion: 1,
    checkedAt: 1,
    outcomes,
    signals: {},
    score: { kind: "practiceRawScore", marks: correct.length, positions: 40 },
  };
}
const all = Array.from({ length: 40 }, (_, i) => i + 1);
const group = (id: string) =>
  test.parts
    .flatMap((p) => p.questionGroups)
    .find((g) => g.id === id) as QuestionGroup;

describe("the Listening review", () => {
  it("walks the cards not fully correct, a List TWO question and a choose-two item once each", () => {
    const cards = reviewCards(
      test,
      record(all.filter((n) => n !== 22 && n !== 38)),
    );
    const position = reviewPosition(cards, "mistakes", null);
    expect(position.cards.map((c) => c.unit.key)).toEqual(["21", "37"]);
    expect(position.cards[0]).toMatchObject({
      outcome: "partlyCorrect",
      marks: 1,
    });
  });

  it("opens a question outside the sequence among all cards, and every card when all are correct", () => {
    const cards = reviewCards(test, record(all.filter((n) => n !== 5)));
    expect(reviewPosition(cards, "mistakes", "9")).toMatchObject({
      set: "all",
    });
    expect(
      reviewPosition(reviewCards(test, record(all)), "mistakes", null).set,
    ).toBe("all");
    expect(reviewPosition(cards, "mistakes", "999").index).toBe(0);
  });

  it("finds where an answer is heard, each segment once, with its quotes", () => {
    const unit = checkUnits(test).find((u) => u.key === "21")!;
    const heard = evidenceOf(unit, key, transcript);
    expect(heard.map((h) => [h.segment.id, h.quotes])).toEqual([
      ["p3-s2", ["right here"]],
    ]);
  });

  it("plays the evidence from 3 seconds before, never before the recording starts (LD8)", () => {
    expect(
      evidenceStretch({
        id: "a",
        startMs: 1200,
        endMs: 3000,
        speaker: "S",
        text: "x",
      }),
    ).toEqual({ fromMs: 0, toMs: 3000 });
    expect(
      evidenceStretch({
        id: "b",
        startMs: 10_000,
        endMs: 12_000,
        speaker: "S",
        text: "x",
      }),
    ).toEqual({ fromMs: 7000, toMs: 12_000 });
  });

  it("marks every evidence phrase in its sentence", () => {
    expect(
      markQuotes("First, how easy. Second, safe.", ["safe", "how easy"]),
    ).toEqual([
      { text: "First, ", mark: false },
      { text: "how easy", mark: true },
      { text: ". Second, ", mark: false },
      { text: "safe", mark: true },
      { text: ".", mark: false },
    ]);
  });

  it("shows a gap in its sentence, form line with its label, table row with its headings, or flow-chart step", () => {
    expect(gapContext(group("p1-form"), 2)).toMatchObject({
      kind: "line",
      label: "Field 2",
    });
    expect(gapContext(group("p2-table"), 14)).toMatchObject({
      kind: "row",
      heading: [{ text: "Pool" }],
      cells: [{ column: "Open" }, { column: "Note" }],
    });
    expect(gapContext(group("p2-flow"), 16)).toMatchObject({ kind: "lines" });
    expect(gapContext(group("p3-sentences"), 29)).toMatchObject({
      kind: "line",
    });
    expect(gapContext(group("p1-mc"), 8)).toBeUndefined();
  });

  it("plays a valid cached copy first, otherwise the network, and has no audio offline without one", () => {
    const networkUrl = "/media/listening/t/part-1.m4a";
    expect(
      reviewAudioSource({ cached: "blob:1", online: false, networkUrl }),
    ).toBe("blob:1");
    expect(
      reviewAudioSource({ cached: undefined, online: true, networkUrl }),
    ).toBe(networkUrl);
    expect(
      reviewAudioSource({ cached: undefined, online: false, networkUrl }),
    ).toBeUndefined();
  });
});
