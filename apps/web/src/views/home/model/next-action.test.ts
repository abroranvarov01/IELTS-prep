import { describe, expect, it } from "vitest";
import { nextAction } from "./next-action";

const state = (
  reading: "none" | "inProgress" | "done",
  listening: "none" | "inProgress" | "done" = "none",
) => nextAction({ reading, listening });

describe("next action", () => {
  it("is the level check while there is no practice history", () => {
    expect(state("none")).toEqual({ kind: "levelCheck" });
  });

  it("is continuing the level check while a section is in progress", () => {
    expect(state("inProgress")).toEqual({ kind: "continueLevelCheck" });
    expect(state("done", "inProgress")).toEqual({
      kind: "continueLevelCheck",
    });
  });

  it("is the finished section's practice once one section is done", () => {
    expect(state("done")).toEqual({ kind: "practiseReading" });
    expect(state("none", "done")).toEqual({ kind: "practiseListening" });
  });

  it("is the Practice Hub without a skill once both sections are done", () => {
    expect(state("done", "done")).toEqual({ kind: "practiseBoth" });
  });
});
