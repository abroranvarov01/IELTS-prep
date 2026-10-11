import { describe, expect, it } from "vitest";
import { exceedsWordLimit, fitsWordLimit } from "./word-limit";

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

describe("the word count of accepted answers (ADR-0008 §3)", () => {
  it("counts every space-separated part as a word", () => {
    expect(fitsWordLimit("winter weather", twoWords)).toBe(true);
    expect(fitsWordLimit("cold winter weather", twoWords)).toBe(false);
    expect(fitsWordLimit("  winter   weather ", twoWords)).toBe(true);
  });

  it("counts a hyphenated word once (ielts.org: 'check-in' counts as a single word)", () => {
    expect(fitsWordLimit("check-in desk", twoWords)).toBe(true);
    expect(fitsWordLimit("well-known", { words: 1, numbers: false })).toBe(
      true,
    );
  });

  it("counts articles as words, because no official source says otherwise (D4)", () => {
    expect(fitsWordLimit("the air", { words: 1, numbers: false })).toBe(false);
    expect(
      fitsWordLimit("the winter weather", { words: 3, numbers: false }),
    ).toBe(true);
  });

  it("frees one number in figures only where the limit allows a number", () => {
    const twoWordsAndNumber = { words: 2, numbers: true };
    expect(fitsWordLimit("1,500 small shops", twoWordsAndNumber)).toBe(true);
    expect(fitsWordLimit("3.5 small shops", twoWordsAndNumber)).toBe(true);
    expect(fitsWordLimit("15 small shops", twoWords)).toBe(false);
    expect(fitsWordLimit("15 20 shops", twoWordsAndNumber)).toBe(true);
    expect(fitsWordLimit("15 20 small shops", twoWordsAndNumber)).toBe(false);
  });

  it("counts a number written in words as a word", () => {
    expect(
      fitsWordLimit("fifteen small shops", { words: 2, numbers: true }),
    ).toBe(false);
  });
});
