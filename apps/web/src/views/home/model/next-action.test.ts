import { describe, expect, it } from "vitest";
import { nextAction } from "./next-action";

describe("next action", () => {
  it("is the level check while there is no practice history", () => {
    expect(nextAction("none")).toEqual({ kind: "levelCheck" });
  });

  it("is continuing the level check while one is in progress", () => {
    expect(nextAction("inProgress")).toEqual({ kind: "continueLevelCheck" });
  });

  it("is Reading practice once the Reading section is done", () => {
    expect(nextAction("done")).toEqual({ kind: "practiseReading" });
  });
});
