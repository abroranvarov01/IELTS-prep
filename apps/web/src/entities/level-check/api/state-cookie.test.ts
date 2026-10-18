import { describe, expect, it } from "vitest";
import {
  LEVEL_CHECK_COOKIE,
  readLevelCheckState,
  saveLevelCheckState,
} from "./state-cookie";

function cookieStore() {
  const values = new Map<string, string>();
  const options: unknown[] = [];
  return {
    options,
    get: (name: string) => {
      const value = values.get(name);
      return value === undefined ? undefined : { value };
    },
    set: (name: string, value: string, opts: unknown) => {
      values.set(name, value);
      options.push(opts);
    },
  };
}

describe("the level-check state cookie", () => {
  it("reads no check when the cookie is missing", () => {
    expect(readLevelCheckState(cookieStore())).toEqual({
      reading: "none",
      listening: "none",
    });
  });

  it("saves the state as an HttpOnly, Lax, long-lived cookie and reads it back", () => {
    const store = cookieStore();
    saveLevelCheckState(store, { reading: "inProgress", listening: "none" });
    expect(store.get(LEVEL_CHECK_COOKIE)?.value).toBe(
      "v1|reading=inProgress|listening=none",
    );
    expect(store.options[0]).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 400 * 24 * 60 * 60,
    });
    expect(readLevelCheckState(store)).toEqual({
      reading: "inProgress",
      listening: "none",
    });
  });
});
