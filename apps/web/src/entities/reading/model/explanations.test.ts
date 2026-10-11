import { describe, expect, it } from "vitest";
import { demoTest as test } from "./demo-test.fixture";
import { parseExplanations } from "./explanations";
import { questionUnits } from "./units";

type Item = { explanation: unknown; simpler: unknown };

/** Valid explanations of every answer unit of the demo test. */
function valid() {
  const items: Record<string, Item> = {};
  for (const unit of questionUnits(test))
    items[unit.key] = {
      explanation: [
        { text: "The passage says " },
        { en: "children rode to school" },
        { text: ", which matches the statement." },
      ],
      simpler: [{ text: "It matches, so " }, { en: "TRUE" }],
    };
  return {
    testId: test.id,
    version: test.version,
    locale: "ru",
    review: { status: "aiDraft" } as { status: unknown },
    items,
  };
}

const errorsOf = (input: unknown, locale = "ru") => {
  const result = parseExplanations(test, input, locale);
  return result.ok ? [] : result.errors;
};

describe("explanation files", () => {
  it("accept one explanation and one simpler version per answer unit, with English marked", () => {
    const result = parseExplanations(test, valid(), "ru");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.value.items)).toHaveLength(39);
    expect(result.value.items["22"]?.simpler).toEqual([
      { text: "It matches, so " },
      { en: "TRUE" },
    ]);
    expect(result.value.items["23"]).toBeUndefined();
  });

  it("belong to one test, content version and language", () => {
    expect(
      errorsOf({ ...valid(), testId: "other", version: 2, locale: "en" }),
    ).toEqual([
      'explanations.testId: expected "demo-academic-1"',
      "explanations.version: expected 1",
      'explanations.locale: expected "ru"',
    ]);
  });

  it("need a known review status", () => {
    expect(errorsOf({ ...valid(), review: { status: "human" } })).toEqual([
      "explanations.review.status: expected one of aiDraft, reviewed, approved",
    ]);
  });

  it("reject a missing unit and a unit the test does not have", () => {
    const input = valid();
    delete input.items["7"];
    input.items["23"] = input.items["22"] as Item;
    expect(errorsOf(input)).toEqual([
      "explanations.items.7: missing",
      "explanations.items.23: no such answer unit",
    ]);
  });

  it("reject empty texts and segments that are neither text nor English", () => {
    const input = valid();
    input.items["1"] = { explanation: [], simpler: [{ text: "  " }] };
    input.items["2"] = {
      explanation: [{ text: "a", en: "b" }],
      simpler: [{ text: "x" }],
    };
    expect(errorsOf(input)).toEqual([
      "explanations.items.1.explanation: expected a list of segments",
      "explanations.items.1.simpler[0]: expected { text } or { en }, not empty",
      "explanations.items.2.explanation[0]: expected { text } or { en }, not empty",
    ]);
  });

  it("reject texts over the length limits and a simpler text not shorter than its explanation", () => {
    const input = valid();
    input.items["1"] = {
      explanation: [{ text: "x".repeat(451) }],
      simpler: [{ text: "y".repeat(251) }],
    };
    input.items["2"] = {
      explanation: [{ text: "Short." }],
      simpler: [{ text: "Longer!" }],
    };
    expect(errorsOf(input)).toEqual([
      "explanations.items.1.explanation: 451 characters, at most 450",
      "explanations.items.1.simpler: 251 characters, at most 250",
      "explanations.items.2.simpler: expected shorter than the explanation",
    ]);
  });

  it("count characters as a reader does, so Uzbek and Russian letters count once", () => {
    const input = valid();
    input.items["1"] = {
      explanation: [{ text: "oʻ".repeat(225) }],
      simpler: [{ text: "gʻ" }],
    };
    expect(errorsOf(input, "ru")).toEqual([]);
  });

  it("keep English quotes to at most 8 words", () => {
    const input = valid();
    input.items["1"] = {
      explanation: [{ en: "one two three four five six seven eight nine" }],
      simpler: [{ text: "x" }],
    };
    expect(errorsOf(input)).toEqual([
      "explanations.items.1.explanation[0]: English quotes have at most 8 words",
    ]);
  });
});
