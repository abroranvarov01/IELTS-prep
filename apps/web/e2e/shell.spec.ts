import { expect, test } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/shared/i18n/routing";
import { saveGoal } from "./goal";

// These tests visit home as a returning user (home sends a new one to onboarding).
test.beforeEach(async ({ context, baseURL }) => {
  await saveGoal(context, baseURL);
});

const catalogs = { uz, ru, en };

for (const locale of routing.locales) {
  const messages = catalogs[locale];

  test.describe(`app shell in /${locale}`, () => {
    test("has exactly one header and one main landmark", async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
    });

    test("the header logo loads and links to the home page", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const logoLink = page
        .getByRole("banner")
        .getByRole("link", { name: messages.app.name });
      await expect(logoLink).toHaveAttribute("href", `/${locale}`);
      const logo = logoLink.getByRole("img", { name: messages.app.name });
      await expect
        .poll(() =>
          logo.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
    });

    test("the skip link is the first tab stop and moves focus to main", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      await page.keyboard.press("Tab");
      const skipLink = page.getByRole("link", {
        name: messages.shell.skipToContent,
      });
      await expect(skipLink).toBeFocused();
      expect((await skipLink.boundingBox())?.height).toBeGreaterThanOrEqual(44);

      await page.keyboard.press("Enter");
      await expect(page.getByRole("main")).toBeFocused();
    });

    for (const width of [320, 360]) {
      test(`fits ${width} px without horizontal scroll or truncation`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/${locale}`);
        // Show the skip link, the shell's only visible string.
        await page.keyboard.press("Tab");

        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);

        const skipLink = page.getByRole("link", {
          name: messages.shell.skipToContent,
        });
        expect(
          await skipLink.evaluate(
            (element) => element.scrollWidth <= element.clientWidth,
          ),
        ).toBe(true);
      });
    }

    test("centers the content in a 1200 px column at 1280 px", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/${locale}`);
      const column = await page
        .getByRole("main")
        .locator("> div")
        .evaluate((element) => {
          const { left, width } = element.getBoundingClientRect();
          return {
            left,
            width,
            viewport: document.documentElement.clientWidth,
          };
        });
      expect(column.width).toBe(1200);
      expect(column.left).toBe((column.viewport - 1200) / 2);
    });
  });
}
