import { afterEach, describe, expect, it, vi } from "vitest";

// The framework boundary: the request's cookies and Next.js's redirect, which
// ends the action by throwing.
const cookieStore = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value === undefined ? undefined : { value };
    },
    set: (name: string, value: string) => cookieStore.set(name, value),
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirect(url);
  },
}));
class Redirect extends Error {
  constructor(readonly url: string) {
    super(url);
  }
}

const { answerExamType, answerTargetBand } = await import("./actions");

async function submit(
  action: (locale: string, form: FormData) => Promise<void>,
  locale: string,
  field: string,
  value: string,
) {
  const form = new FormData();
  form.set(field, value);
  try {
    await action(locale, form);
  } catch (error) {
    if (error instanceof Redirect) return error.url;
    throw error;
  }
  throw new Error("the action did not redirect");
}

afterEach(() => cookieStore.clear());

describe("onboarding answers", () => {
  it("saves the exam type and opens the band question", async () => {
    expect(await submit(answerExamType, "ru", "examType", "general")).toBe(
      "/ru/start/band",
    );
    expect(cookieStore.get("goal")).toBe("v1|general|");
  });

  it("keeps the earlier answer when the band is answered", async () => {
    cookieStore.set("goal", "v1|academic|");

    expect(await submit(answerTargetBand, "uz", "targetBand", "8+")).toBe(
      "/uz/start/level-check",
    );
    expect(cookieStore.get("goal")).toBe("v1|academic|8+");
  });

  it("ignores a value that is not an answer and asks the same question again", async () => {
    expect(await submit(answerTargetBand, "en", "targetBand", "9.0")).toBe(
      "/en/start/band",
    );
    expect(cookieStore.has("goal")).toBe(false);
  });

  it("never redirects to an address built from an untrusted locale", async () => {
    expect(
      await submit(answerExamType, "//evil.example", "examType", "academic"),
    ).toBe("/uz/start/band");
  });
});
