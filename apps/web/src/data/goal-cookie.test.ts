import { describe, expect, it, vi } from "vitest";
import { GOAL_COOKIE, readGoal, saveGoal } from "./goal-cookie";

function cookieStore() {
  const values = new Map<string, string>();
  const set = vi.fn((name: string, value: string) => {
    values.set(name, value);
  });
  return {
    get: (name: string) => {
      const value = values.get(name);
      return value === undefined ? undefined : { value };
    },
    set,
  };
}

describe("goal cookie", () => {
  it("reads back the goal it saved", () => {
    const cookies = cookieStore();

    saveGoal(cookies, { examType: "general", targetBand: "6.5" });

    expect(readGoal(cookies)).toEqual({
      examType: "general",
      targetBand: "6.5",
    });
  });

  it("reads no answers when the cookie is missing or tampered with", () => {
    const cookies = cookieStore();
    expect(readGoal(cookies)).toEqual({});

    cookies.set(GOAL_COOKIE, "v1|admin|10");
    expect(readGoal(cookies)).toEqual({});
  });

  it("writes an HTTP-only, same-site cookie that lasts 400 days", () => {
    const cookies = cookieStore();

    saveGoal(cookies, { examType: "academic" });

    expect(cookies.set).toHaveBeenCalledWith(GOAL_COOKIE, "v1|academic|", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 34_560_000,
    });
  });
});
