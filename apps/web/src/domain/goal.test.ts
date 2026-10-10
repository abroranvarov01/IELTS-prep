import { describe, expect, it } from "vitest";
import {
  EXAM_TYPES,
  TARGET_BANDS,
  isGoalComplete,
  parseGoal,
  serializeGoal,
} from "./goal";

describe("goal", () => {
  it("offers the owner's band answers, as IELTS-notation strings", () => {
    expect(TARGET_BANDS).toEqual(["6.0", "6.5", "7.0", "7.5", "8+", "unknown"]);
  });

  it("round-trips every combination of answers, including unanswered ones", () => {
    for (const examType of [...EXAM_TYPES, undefined]) {
      for (const targetBand of [...TARGET_BANDS, undefined]) {
        const goal = {
          ...(examType && { examType }),
          ...(targetBand && { targetBand }),
        };
        expect(parseGoal(serializeGoal(goal))).toEqual(goal);
      }
    }
  });

  it.each([
    ["nothing stored", undefined],
    ["an empty value", ""],
    ["a value that is not a goal", "hello"],
    ["another version", "v2|academic|7.0"],
    ["too few parts", "v1|academic"],
    ["too many parts", "v1|academic|7.0|x"],
  ])("reads %s as no answers", (_, stored) => {
    expect(parseGoal(stored)).toEqual({});
  });

  it("reads an unknown answer as that question unanswered", () => {
    expect(parseGoal("v1|academic|9.0")).toEqual({ examType: "academic" });
    expect(parseGoal("v1|<script>|8+")).toEqual({ targetBand: "8+" });
  });

  it("is complete only when both questions are answered, 'I don't know yet' included", () => {
    expect(isGoalComplete({ examType: "unknown", targetBand: "unknown" })).toBe(
      true,
    );
    expect(isGoalComplete({ examType: "general" })).toBe(false);
    expect(isGoalComplete({ targetBand: "7.0" })).toBe(false);
    expect(isGoalComplete({})).toBe(false);
  });
});
