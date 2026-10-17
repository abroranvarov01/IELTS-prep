import { describe, expect, it } from "vitest";
import {
  type ReadingAttempt,
  SCORING_RULES_VERSION,
  type ResultRecord,
  checkAttempt,
} from "@/entities/reading";
import { demoKey, demoTest as test } from "@/entities/reading/testing";
import {
  keySentences,
  pinComparison,
  quotesOf,
  reviewCards,
  reviewPosition,
} from "./review";

function attempt(
  answers: ReadingAttempt["answers"],
  pins: ReadingAttempt["pins"] = {},
): ReadingAttempt {
  return {
    id: "s-00000000-0000-4000-8000-000000000001",
    testId: test.id,
    testVersion: test.version,
    kind: "test",
    mode: "practice",
    startedAt: 1,
    finishedAt: 2,
    finishReason: "user",
    answers,
    pins,
    highlights: [],
    committedAt: 3,
  };
}

function cardsOf(shown: ReadingAttempt) {
  const record: ResultRecord = {
    attemptId: shown.id,
    keyRevision: demoKey.revision,
    rulesVersion: SCORING_RULES_VERSION,
    checkedAt: 4,
    ...checkAttempt(test, demoKey, shown),
  };
  return reviewCards(test, shown, record);
}

// Every answer correct except question 2 (TRUE; the key says FALSE) and an
// empty question 6; 22–23 partly correct (A, B; the key accepts A and C).
const correctAnswers = Object.fromEntries(
  Object.entries(demoKey.answers)
    .filter(([n]) => n !== "23")
    .map(([n, entry]) => [n, n === "22" ? entry.accept : entry.accept[0]]),
) as ReadingAttempt["answers"];
const mixed = cardsOf(
  attempt({
    ...Object.fromEntries(
      Object.entries(correctAnswers).filter(([n]) => n !== "6"),
    ),
    "2": "TRUE",
    "22": ["A", "B"],
  }),
);
const keysOf = (cards: { unit: { key: string } }[]) =>
  cards.map((card) => card.unit.key);

describe("reviewCards", () => {
  it("makes one card per answer unit, a partly correct item with its marks", () => {
    expect(mixed).toHaveLength(39);
    const item = mixed.find((card) => card.unit.key === "22");
    expect(item).toMatchObject({ outcome: "partlyCorrect", marks: 1 });
    expect(item?.unit.numbers).toEqual([22, 23]);
  });
});

describe("reviewPosition", () => {
  it("walks the mistakes and unanswered questions in question order, each item once", () => {
    const position = reviewPosition(mixed, "mistakes", null);
    expect(position.set).toBe("mistakes");
    expect(keysOf(position.cards)).toEqual(["2", "6", "22"]);
    expect(position.index).toBe(0);
  });

  it("opens an item's one card from either of its numbers", () => {
    expect(reviewPosition(mixed, "mistakes", "23").index).toBe(2);
    expect(reviewPosition(mixed, "mistakes", "22").index).toBe(2);
  });

  it("opens a correct question in every card's order, as the navigator does", () => {
    const position = reviewPosition(mixed, "mistakes", "5");
    expect(position.set).toBe("all");
    expect(position.cards).toHaveLength(39);
    expect(position.cards[position.index]?.unit.key).toBe("5");
  });

  it("opens the sequence's first card for an unknown question number", () => {
    for (const q of ["0", "41", "x", null]) {
      const position = reviewPosition(mixed, "mistakes", q);
      expect(position.cards[position.index]?.unit.key).toBe("2");
    }
  });

  it("walks every card when every answer is correct", () => {
    const allCorrect = cardsOf(attempt(correctAnswers));
    const position = reviewPosition(allCorrect, "mistakes", null);
    expect(position.set).toBe("all");
    expect(position.cards).toHaveLength(39);
  });
});

describe("keySentences", () => {
  it("presents a NOT GIVEN answer's sentences as related, never as evidence", () => {
    expect(keySentences(demoKey.answers[3])).toEqual({
      kind: "related",
      sentenceIds: ["p1-2-s2"],
    });
    expect(keySentences(demoKey.answers[1]).kind).toBe("evidence");
  });

  it("allows NOT GIVEN without related sentences", () => {
    expect(
      keySentences({ accept: ["NOT GIVEN"], evidence: [] }).sentenceIds,
    ).toEqual([]);
  });
});

describe("pinComparison", () => {
  const unitOf = (key: string) =>
    mixed.find((card) => card.unit.key === key)?.unit ?? mixed[0]!.unit;

  it("says whether a pin is a sentence the key cites", () => {
    expect(
      pinComparison(
        unitOf("1"),
        attempt({}, { "1": ["p1-1-s2"] }),
        demoKey.answers[1],
      ),
    ).toEqual({ sentenceIds: ["p1-1-s2"], agreement: "match" });
    expect(
      pinComparison(
        unitOf("5"),
        attempt({}, { "5": ["p1-3-s2"] }),
        demoKey.answers[5],
      )?.agreement,
    ).toBe("miss");
  });

  it("never compares pins with NOT GIVEN's related sentences", () => {
    expect(
      pinComparison(
        unitOf("3"),
        attempt({}, { "3": ["p1-2-s2"] }),
        demoKey.answers[3],
      )?.agreement,
    ).toBe("notGiven");
  });

  it("gathers an item's pins from all its numbers, and has nothing without pins", () => {
    expect(
      pinComparison(
        unitOf("22"),
        attempt({}, { "22": ["p2-b-s4"], "23": ["p2-b-s4", "p2-a-s1"] }),
        demoKey.answers[22],
      )?.sentenceIds,
    ).toEqual(["p2-b-s4", "p2-a-s1"]);
    expect(
      pinComparison(unitOf("1"), attempt({}), demoKey.answers[1]),
    ).toBeUndefined();
  });
});

describe("quotesOf", () => {
  it("quotes sentences in passage order with their paragraph letter", () => {
    const passage = test.passages[1]!;
    expect(
      quotesOf(passage, ["p2-c-s3", "p2-b-s4"]).map((q) => [q.id, q.paragraph]),
    ).toEqual([
      ["p2-b-s4", "B"],
      ["p2-c-s3", "C"],
    ]);
  });
});
