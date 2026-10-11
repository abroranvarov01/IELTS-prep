import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import { saveGoal } from "./goal";

// These tests visit home as a returning user (home sends a new one to onboarding).
test.beforeEach(async ({ context, baseURL }) => {
  await saveGoal(context, baseURL);
});

test.describe("visiting / with a supported browser language", () => {
  test.use({ locale: "ru-RU" });

  test("redirects to that language", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/ru");
  });
});

test.describe("visiting / with an unsupported browser language", () => {
  test.use({ locale: "de-DE" });

  test("redirects to the default locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(`/${routing.defaultLocale}`);
  });
});

for (const locale of routing.locales) {
  test(`/${locale} sets html lang to ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
  });

  test(`/${locale} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
