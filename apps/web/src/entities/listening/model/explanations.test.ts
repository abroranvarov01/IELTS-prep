import { describe, expect, it } from "vitest";
import { parseExplanations } from "./explanations";
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
import { checkUnits } from "./scoring";

function parsed<T>(
  result: { ok: true; value: T } | { ok: false; errors: string[] },
): T {
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
}
const test = parsed(parseListeningTest(fixtureTest()));
const transcript = parsed(parseTranscript(test, fixtureTranscript()));
const key = parsed(parseListeningKey(test, transcript, fixtureKey()));

// Every question's evidence in the fixture is its part's second segment.
function file() {
  const items: Record<string, unknown> = {};
  for (const unit of checkUnits(test))
    items[unit.key] = {
      explanation: [
        { text: "At " },
        { at: `p${unit.partNumber}-s2` },
        { text: " the speaker says " },
        { en: "The answer is right here" },
        { text: "." },
      ],
      simpler: [{ text: "It is said " }, { en: "right here" }, { text: "." }],
    };
  return {
    testId: "fixture-listening",
    version: 1,
    locale: "en",
    review: { status: "aiDraft" },
    items,
  };
}
const errorsOf = (change: (f: ReturnType<typeof file>) => void) => {
  const f = file();
  change(f);
  const result = parseExplanations(test, key, transcript, f, "en");
  return result.ok ? [] : result.errors;
};
const item = (f: ReturnType<typeof file>, k: string) =>
  f.items[k] as { explanation: unknown[]; simpler: unknown[] };

describe("Listening explanation files", () => {
  it("have one item per answer unit, a List TWO question once", () => {
    expect(errorsOf(() => {})).toEqual([]);
    expect(Object.keys(file().items)).toContain("37");
    expect(Object.keys(file().items)).not.toContain("38");
    expect(errorsOf((f) => delete f.items["3"])).toContainEqual(
      "explanations.items.3: missing",
    );
    expect(errorsOf((f) => (f.items["38"] = item(f, "37")))).toContainEqual(
      "explanations.items.38: no such answer unit",
    );
  });

  it("state a time only for the question's own evidence (LD13)", () => {
    expect(
      errorsOf((f) => (item(f, "1").explanation[1] = { at: "p1-s1" })),
    ).toContainEqual(
      'explanations.items.1.explanation[1].at: "p1-s1" is not evidence of this question',
    );
    expect(
      errorsOf((f) => (item(f, "1").explanation[1] = { at: "p9-s9" })),
    ).toContainEqual(
      'explanations.items.1.explanation[1].at: "p9-s9" is not a segment of the transcript',
    );
  });

  it("keep English quotes to 8 words and the simpler version shorter", () => {
    expect(
      errorsOf(
        (f) =>
          (item(f, "1").explanation[3] = {
            en: "one two three four five six seven eight nine",
          }),
      ),
    ).toContainEqual(
      "explanations.items.1.explanation[3]: English quotes have at most 8 words",
    );
    expect(
      errorsOf((f) => (item(f, "1").simpler = [{ text: "x".repeat(60) }])),
    ).toContainEqual(
      "explanations.items.1.simpler: expected shorter than the explanation",
    );
  });

  it("refuse an empty or mixed segment, and text over the length limit", () => {
    expect(
      errorsOf((f) => (item(f, "1").explanation[2] = { text: " " })),
    ).toContainEqual(
      "explanations.items.1.explanation[2]: expected { text }, { en } or { at }, not empty",
    );
    expect(
      errorsOf((f) => (item(f, "1").explanation[2] = { text: "a", en: "b" })),
    ).toContainEqual(
      "explanations.items.1.explanation[2]: expected { text }, { en } or { at }, not empty",
    );
    expect(
      errorsOf((f) => (item(f, "1").explanation = [{ text: "x".repeat(451) }])),
    ).toContainEqual(
      "explanations.items.1.explanation: 451 characters, at most 450",
    );
  });

  it("belong to their test, version and locale, with a review status", () => {
    const errors = errorsOf((f) => {
      f.locale = "ru";
      f.version = 2;
      f.review = { status: "checked" };
    });
    expect(errors).toEqual(
      expect.arrayContaining([
        'explanations.locale: expected "en"',
        "explanations.version: expected 1",
        "explanations.review.status: expected one of aiDraft, reviewed, approved",
      ]),
    );
  });
});
