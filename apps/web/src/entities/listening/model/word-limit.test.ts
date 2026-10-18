import { describe, expect, it } from "vitest";
import { fitsListeningWordLimit, isNumberPart } from "./word-limit";

const oneWordOrNumber = { words: 1, numbers: true };
const oneWordOnly = { words: 1, numbers: false };

describe("the Listening word limit", () => {
  it("counts a hyphenated word as one word (ielts.org)", () => {
    expect(fitsListeningWordLimit("check-in", oneWordOnly)).toBe(true);
    expect(fitsListeningWordLimit("check in", oneWordOnly)).toBe(false);
  });

  it("counts articles as words (owner decision D4)", () => {
    expect(fitsListeningWordLimit("the river", oneWordOnly)).toBe(false);
  });

  it("lets one number part go free only where the limit allows a number", () => {
    expect(fitsListeningWordLimit("24 April", oneWordOrNumber)).toBe(true);
    expect(fitsListeningWordLimit("24 April", oneWordOnly)).toBe(false);
    expect(fitsListeningWordLimit("24 25 April", oneWordOrNumber)).toBe(false);
  });

  it("counts a unit after a number as a word", () => {
    expect(fitsListeningWordLimit("5 kg", oneWordOrNumber)).toBe(true);
    expect(fitsListeningWordLimit("5 kg bags", oneWordOrNumber)).toBe(false);
  });
});

describe("a number part (owner decision LD5)", () => {
  it("is a numeric date, a time, a price, a decimal or a thousand", () => {
    for (const part of ["32", "19/02", "6:45", "6.45", "$4.50", "£12", "1,500"])
      expect(isNumberPart(part), part).toBe(true);
  });

  it("is not letters, a unit stuck to a number, or a separator at an edge", () => {
    for (const part of ["thirty", "5kg", "kg5", "6:", "/02", "4.50$", "$"])
      expect(isNumberPart(part), part).toBe(false);
  });
});
