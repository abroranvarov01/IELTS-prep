import { describe, expect, it } from "vitest";
import {
  NO_LEVEL_CHECK,
  parseLevelCheckState,
  serializeLevelCheckState,
} from "./state";

describe("the level-check state cookie value", () => {
  it("round-trips the state of every skill's section", () => {
    const state = { reading: "done", listening: "inProgress" } as const;
    expect(serializeLevelCheckState(state)).toBe(
      "v1|reading=done|listening=inProgress",
    );
    expect(parseLevelCheckState(serializeLevelCheckState(state))).toEqual(
      state,
    );
  });

  it("reads no value, another version or a malformed value as no check", () => {
    expect(parseLevelCheckState(undefined)).toEqual(NO_LEVEL_CHECK);
    expect(parseLevelCheckState("v2|reading=done")).toEqual(NO_LEVEL_CHECK);
    expect(parseLevelCheckState("done")).toEqual(NO_LEVEL_CHECK);
  });

  it("reads an unknown part as 'none' for its skill and ignores unknown skills", () => {
    expect(parseLevelCheckState("v1|reading=finished|writing=done")).toEqual(
      NO_LEVEL_CHECK,
    );
    expect(parseLevelCheckState("v1|listening=done")).toEqual({
      reading: "none",
      listening: "done",
    });
  });

  it("never carries a score or a level", () => {
    expect(serializeLevelCheckState(NO_LEVEL_CHECK)).not.toMatch(
      /\d\.\d|level/,
    );
  });
});
