import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/shared/i18n/routing";

type Locale = (typeof routing.locales)[number];

const catalogs = { uz, ru, en };
const steps = ["exam", "band", "level-check"] as const;

function stepText(locale: Locale, current: number) {
  return catalogs[locale].onboarding.step
    .replace("{current}", String(current))
    .replace("{total}", "3");
}

function answer(page: Page, name: string) {
  return page.getByRole("group").getByRole("button", { name, exact: true });
}

// Next.js percent-encodes cookie values; the app reads them decoded.
async function goalCookie(context: BrowserContext) {
  const cookie = (await context.cookies()).find(({ name }) => name === "goal");
  return cookie && { ...cookie, value: decodeURIComponent(cookie.value) };
}

for (const locale of routing.locales) {
  const messages = catalogs[locale];

  test.describe(`onboarding in /${locale}`, () => {
    test("three taps from the first question to the level-check invitation", async ({
      page,
      context,
    }) => {
      await page.goto(`/${locale}/start/exam`);
      await expect(
        page.getByRole("main").getByText(stepText(locale, 1)),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: messages.onboarding.examType.title,
        }),
      ).toBeVisible();
      await expect(page).toHaveTitle(messages.onboarding.examType.title);

      await answer(page, messages.examType.academic).click();
      await expect(page).toHaveURL(`/${locale}/start/band`);
      await expect(
        page.getByRole("main").getByText(stepText(locale, 2)),
      ).toBeVisible();

      await answer(page, "7.0").click();
      await expect(page).toHaveURL(`/${locale}/start/level-check`);
      await expect(
        page.getByRole("main").getByText(stepText(locale, 3)),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: messages.levelCheck.title,
        }),
      ).toBeVisible();

      // Exactly one primary action, plus the quieter "Not now".
      await expect(
        page.getByRole("link", { name: messages.levelCheck.start }),
      ).toHaveAttribute("href", `/${locale}/level-check`);
      await expect(
        page.getByRole("link", { name: messages.onboarding.notNow }),
      ).toHaveAttribute("href", `/${locale}?onboarding=later`);

      const cookie = await goalCookie(context);
      expect(cookie).toMatchObject({
        value: "v1|academic|7.0",
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
      });
    });

    for (const step of steps) {
      test(`step "${step}" has no WCAG 2.2 AA violations`, async ({ page }) => {
        await page.goto(`/${locale}/start/${step}`);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(results.violations).toEqual([]);
      });

      for (const width of [320, 360]) {
        test(`step "${step}" fits ${width} px without horizontal scroll or truncation`, async ({
          page,
        }) => {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(`/${locale}/start/${step}`);

          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          );
          expect(overflow).toBe(0);
          const clipped = await page
            .getByRole("main")
            .locator("h1, p, a, button")
            .evaluateAll((elements) =>
              elements
                .filter((element) => element.scrollWidth > element.clientWidth)
                .map((element) => element.textContent),
            );
          expect(clipped).toEqual([]);
        });
      }
    }
  });
}

test.describe("onboarding answers", () => {
  const messages = en;

  test("'I don't know yet' is a full answer to both questions", async ({
    page,
    context,
  }) => {
    await page.goto("/en/start/exam");
    await answer(page, messages.onboarding.dontKnow).click();
    await expect(page).toHaveURL("/en/start/band");
    await answer(page, messages.onboarding.dontKnow).click();
    await expect(page).toHaveURL("/en/start/level-check");

    expect((await goalCookie(context))?.value).toBe("v1|unknown|unknown");
  });

  test("going back shows the earlier answer as selected, also after a reload", async ({
    page,
  }) => {
    await page.goto("/en/start/exam");
    await answer(page, messages.examType.general).click();
    await expect(page).toHaveURL("/en/start/band");

    await page.goBack();
    await expect(page).toHaveURL("/en/start/exam");
    const selected = `${messages.examType.general} ${messages.onboarding.selected}`;
    await expect(answer(page, selected)).toBeVisible();

    await page.reload();
    await expect(answer(page, selected)).toBeVisible();
    await expect(answer(page, messages.examType.academic)).toBeVisible();
  });

  test("'8+' is announced as '8 or higher' and saved as 8+", async ({
    page,
    context,
  }) => {
    await page.goto("/en/start/band");
    await answer(page, messages.targetBand.eightPlusLabel).click();
    await expect(page).toHaveURL("/en/start/level-check");

    expect((await goalCookie(context))?.value).toBe("v1||8+");
  });

  test("can be completed with the keyboard only", async ({ page }) => {
    await page.goto("/en/start/exam");
    const target = answer(page, messages.examType.general);
    for (
      let i = 0;
      i < 10 && !(await target.evaluate((e) => e === document.activeElement));
      i++
    ) {
      await page.keyboard.press("Tab");
    }
    await expect(target).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/en/start/band");

    const band = answer(page, "6.5");
    for (
      let i = 0;
      i < 10 && !(await band.evaluate((e) => e === document.activeElement));
      i++
    ) {
      await page.keyboard.press("Tab");
    }
    await expect(band).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page).toHaveURL("/en/start/level-check");
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("the answers still save and lead on", async ({ page, context }) => {
      await page.goto("/ru/start/exam");
      await answer(page, ru.examType.academic).click();
      await expect(page).toHaveURL("/ru/start/band");
      await answer(page, "7.5").click();
      await expect(page).toHaveURL("/ru/start/level-check");
      await expect(
        page.getByRole("link", { name: ru.levelCheck.start }),
      ).toBeVisible();

      expect((await goalCookie(context))?.value).toBe("v1|academic|7.5");
    });
  });
});
