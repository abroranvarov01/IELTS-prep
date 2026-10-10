import { describe, expect, it } from "vitest";
import { nextAction } from "./next-action";

describe("next action", () => {
  it("is the level check while there is no practice history", () => {
    expect(nextAction()).toEqual({ kind: "levelCheck" });
  });
});
