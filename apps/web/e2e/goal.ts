import type { BrowserContext } from "@playwright/test";

/**
 * Makes the browser a returning user: it has the goal cookie onboarding saves
 * (ADR-0003), so home opens instead of onboarding. Next.js stores the value
 * percent-encoded.
 */
export async function saveGoal(
  context: BrowserContext,
  baseURL: string | undefined,
  value = "v1|academic|7.0",
) {
  if (!baseURL) throw new Error("baseURL is not set");
  await context.addCookies([
    { name: "goal", value: encodeURIComponent(value), url: baseURL },
  ]);
}
