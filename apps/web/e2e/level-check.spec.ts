import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/i18n/routing";
import { saveGoal } from "./goal";

const catalogs = { uz, ru, en };

for (const locale of routing.locales) {
  const messages = catalogs[locale];

  test.describe(`level check in /${locale}`, () => {
    test("home's next action leads to the honest 'being prepared' page", async ({
      page,
      context,
      baseURL,
    }) => {
      await saveGoal(context, baseURL);
      await page.goto(`/${locale}`);
      await page.getByRole("link", { name: messages.levelCheck.start }).click();

      await expect(page).toHaveURL(`/${locale}/level-check`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page).toHaveTitle(messages.levelCheck.comingSoon.title);
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: messages.levelCheck.comingSoon.title,
        }),
      ).toBeVisible();
      await expect(
        page.getByText(messages.levelCheck.comingSoon.body),
      ).toBeVisible();

      await page.getByRole("link", { name: messages.common.goHome }).click();
      await expect(page).toHaveURL(`/${locale}`);
    });

    test("is a real page (status 200), not a not-found page", async ({
      request,
    }) => {
      const response = await request.get(`/${locale}/level-check`);
      expect(response.status()).toBe(200);
    });

    test("has no WCAG 2.2 AA violations", async ({ page }) => {
      await page.goto(`/${locale}/level-check`);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    for (const width of [320, 360]) {
      test(`fits ${width} px without horizontal scroll or truncation`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/${locale}/level-check`);

        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
        const clipped = await page
          .getByRole("main")
          .locator("h1, p, a")
          .evaluateAll((elements) =>
            elements
              .filter((element) => element.scrollWidth > element.clientWidth)
              .map((element) => element.textContent),
          );
        expect(clipped).toEqual([]);
      });
    }
  });
}

test("the onboarding invitation's button leads to the same page", async ({
  page,
}) => {
  await page.goto("/ru/start/level-check");
  await page.getByRole("link", { name: ru.levelCheck.start }).click();

  await expect(page).toHaveURL("/ru/level-check");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: ru.levelCheck.comingSoon.title,
    }),
  ).toBeVisible();
});
