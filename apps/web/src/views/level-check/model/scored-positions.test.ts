import { describe, expect, it } from "vitest";
import { demoTest } from "@/entities/reading/testing";
import { fixtureListeningTest } from "@/entities/listening/testing";
import { listeningScoredPositions, scoredPositions } from "./scored-positions";

describe("scoredPositions", () => {
  it("pairs every position of the form with its group's type and its outcome, unanswered when none", () => {
    const positions = scoredPositions(demoTest, {
      1: "correct",
      5: "incorrect",
    });
    expect(positions).toHaveLength(40);
    expect(positions[0]).toEqual({
      number: 1,
      type: "trueFalseNotGiven",
      outcome: "correct",
    });
    expect(positions[4]).toEqual({
      number: 5,
      type: "multipleChoice",
      outcome: "incorrect",
    });
    expect(positions[1]?.outcome).toBe("unanswered");
    expect(positions.map((p) => p.number)).toEqual(
      Array.from({ length: 40 }, (_, i) => i + 1),
    );
  });
});

describe("listeningScoredPositions", () => {
  it("pairs every position of a Listening form with its type, matching named as the result names it", () => {
    const positions = listeningScoredPositions(fixtureListeningTest, {
      1: "correct",
    });
    expect(positions).toHaveLength(40);
    expect(positions[0]).toEqual({
      number: 1,
      type: "formCompletion",
      outcome: "correct",
    });
    expect(positions.find((p) => p.number === 23)?.type).toBe("matching");
    expect(positions[1]?.outcome).toBe("unanswered");
  });
});
