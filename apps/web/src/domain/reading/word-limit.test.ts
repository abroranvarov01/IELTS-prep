import { describe, expect, it } from "vitest";
import { exceedsWordLimit } from "./word-limit";

const twoWords = { words: 2, numbers: false };

describe("the Practice word-limit warning", () => {
  it("is due only when an answer has more words than the instruction allows", () => {
    expect(exceedsWordLimit("rooftop gardens", twoWords)).toBe(false);
    expect(exceedsWordLimit("the rooftop gardens", twoWords)).toBe(true);
    expect(exceedsWordLimit("baskets", { words: 1, numbers: false })).toBe(
      false,
    );
    expect(exceedsWordLimit("", twoWords)).toBe(false);
  });

  it("does not count extra spaces, and a hyphenated word is one word", () => {
    expect(exceedsWordLimit("  winter   weather ", twoWords)).toBe(false);
    expect(exceedsWordLimit("well-known shops", twoWords)).toBe(false);
  });

  it("never counts a number as a word", () => {
    expect(exceedsWordLimit("15 small shops", twoWords)).toBe(false);
    expect(
      exceedsWordLimit("1990 small shops", { words: 2, numbers: true }),
    ).toBe(false);
  });
});
