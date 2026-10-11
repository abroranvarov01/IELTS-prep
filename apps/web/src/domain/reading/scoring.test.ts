import { describe, expect, it } from "vitest";
import { normalizeTypedAnswer } from "./scoring";

describe("normalizing a typed answer", () => {
  it("ignores letter case (IDP: capitalization is not important in Reading)", () => {
    expect(normalizeTypedAnswer("Winter Weather")).toBe("winter weather");
    expect(normalizeTypedAnswer("BASKETS")).toBe("baskets");
  });

  it("ignores surrounding and repeated spaces", () => {
    expect(normalizeTypedAnswer("  winter \t  weather ")).toBe(
      "winter weather",
    );
  });

  it("reads typographic apostrophes and phone hyphens as plain ones", () => {
    expect(normalizeTypedAnswer("parents\u2019 group")).toBe("parents' group");
    expect(normalizeTypedAnswer("o\u02BCclock")).toBe("o'clock");
    expect(normalizeTypedAnswer("check\u2010in")).toBe("check-in");
    expect(normalizeTypedAnswer("check\u2011in")).toBe("check-in");
  });

  it("ignores one trailing full stop, as owner policy (D2), not an official rule", () => {
    expect(normalizeTypedAnswer("air.")).toBe("air");
    expect(normalizeTypedAnswer("air. ")).toBe("air");
    expect(normalizeTypedAnswer("air..")).toBe("air.");
  });

  it("keeps commas, semicolons, colons and other marks", () => {
    expect(normalizeTypedAnswer("air,")).toBe("air,");
    expect(normalizeTypedAnswer("air;")).toBe("air;");
    expect(normalizeTypedAnswer("air:")).toBe("air:");
    expect(normalizeTypedAnswer("air!")).toBe("air!");
  });

  it("never corrects spelling or word form", () => {
    expect(normalizeTypedAnswer("pavments")).toBe("pavments");
    expect(normalizeTypedAnswer("strengthen")).toBe("strengthen");
  });

  it("uses one Unicode form for the same letters", () => {
    expect(normalizeTypedAnswer("cafe\u0301")).toBe("caf\u00e9");
  });
});
