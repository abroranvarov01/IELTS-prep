import { describe, expect, it } from "vitest";
import { firstUnansweredQuestion } from "./onboarding";

describe("first unanswered question", () => {
  it("is the exam type when nothing is answered", () => {
    expect(firstUnansweredQuestion({})).toBe("exam");
    expect(firstUnansweredQuestion({ targetBand: "7.0" })).toBe("exam");
  });

  it("is the target band once the exam type is answered", () => {
    expect(firstUnansweredQuestion({ examType: "general" })).toBe("band");
  });

  it("is none when both are answered, 'I don't know yet' included", () => {
    expect(
      firstUnansweredQuestion({ examType: "unknown", targetBand: "unknown" }),
    ).toBeUndefined();
  });
});
