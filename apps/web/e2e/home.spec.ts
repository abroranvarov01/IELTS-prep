import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/shared/i18n/routing";
import { saveGoal } from "./goal";

const catalogs = { uz, ru, en };

// Next.js keeps routes visited earlier in the DOM, hidden, so only visible
// paragraphs count.
function goalLine(page: Page) {
  return page.getByRole("main").locator("p").filter({ visible: true }).last();
}

// The approved goal-line strings mark the band with <b>; the visible text has no tag.
function targetBandText(template: string, band: string) {
  return template.replace("<b>{band}</b>", band);
}

for (const locale of routing.locales) {
  const messages = catalogs[locale];

  test.describe(`home in /${locale}`, () => {
    test("a returning user sees one next action and their goal", async ({
      page,
      context,
      baseURL,
    }) => {
      await saveGoal(context, baseURL, "v1|general|6.5");
      await page.goto(`/${locale}`);

      await expect(page).toHaveURL(`/${locale}`);
      await expect(page).toHaveTitle(messages.home.title);
      await expect(
        page.getByRole("heading", { level: 1, name: messages.home.title }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: messages.levelCheck.title,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: messages.levelCheck.start }),
      ).toHaveAttribute("href", `/${locale}/level-check`);
      await expect(goalLine(page)).toHaveText(
        `${targetBandText(messages.home.goal.targetBand, "6.5")} · ${messages.examType.general}`,
      );
      await expect(
        page.getByRole("link", { name: messages.home.goal.change }),
      ).toHaveAttribute("href", `/${locale}/start/exam`);
    });

    test("has exactly one primary (red) action", async ({
      page,
      context,
      baseURL,
    }) => {
      await saveGoal(context, baseURL);
      await page.goto(`/${locale}`);
      // Elements filled with the brand.primary token, resolved by the browser.
      const red = await page.locator("a, button").evaluateAll((elements) => {
        const probe = document.createElement("div");
        probe.style.backgroundColor = "var(--color-brand-primary)";
        document.body.append(probe);
        const primary = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return elements.filter(
          (element) => getComputedStyle(element).backgroundColor === primary,
        ).length;
      });
      expect(red).toBe(1);
    });

    test("has no WCAG 2.2 AA violations", async ({
      page,
      context,
      baseURL,
    }) => {
      await saveGoal(context, baseURL);
      await page.goto(`/${locale}`);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    for (const width of [320, 360]) {
      test(`fits ${width} px without horizontal scroll or truncation`, async ({
        page,
        context,
        baseURL,
      }) => {
        await saveGoal(context, baseURL, "v1|general|8+");
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/${locale}`);
        await expect(goalLine(page)).toContainText("8+");

        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
        const clipped = await page
          .getByRole("main")
          .locator("h1, h2, p, a")
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

test.describe("entering home", () => {
  test("a first visit goes through onboarding and ends on home", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page).toHaveURL("/en/start/exam");
    await page.getByRole("button", { name: en.examType.academic }).click();
    await page.getByRole("button", { name: "7.0", exact: true }).click();
    await page.getByRole("link", { name: en.onboarding.notNow }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: en.home.title }),
    ).toBeVisible();
    await expect(goalLine(page)).toHaveText(
      `${targetBandText(en.home.goal.targetBand, "7.0")} · ${en.examType.academic}`,
    );

    // Later visits open home directly.
    await page.goto("/en");
    await expect(page).toHaveURL("/en");
  });

  test("a half-finished onboarding continues at the unanswered question", async ({
    page,
    context,
    baseURL,
  }) => {
    await saveGoal(context, baseURL, "v1|academic|");
    await page.goto("/uz");
    await expect(page).toHaveURL("/uz/start/band");
  });

  test("an unreadable saved goal counts as unanswered", async ({
    page,
    context,
    baseURL,
  }) => {
    await saveGoal(context, baseURL, "v9|admin|10");
    await page.goto("/ru");
    await expect(page).toHaveURL("/ru/start/exam");
  });

  test("'I don't know yet' shows the band as not set and leaves the exam type out", async ({
    page,
    context,
    baseURL,
  }) => {
    await saveGoal(context, baseURL, "v1|unknown|unknown");
    await page.goto("/en");
    await expect(goalLine(page)).toHaveText(en.home.goal.targetBandNotSet);
  });

  test("'Not now' never loops back into onboarding, even when no goal was kept", async ({
    page,
  }) => {
    await page.goto("/en?onboarding=later");
    await expect(page).toHaveURL("/en?onboarding=later");
    await expect(
      page.getByRole("heading", { level: 1, name: en.home.title }),
    ).toBeVisible();
    await expect(goalLine(page)).toHaveText(en.home.goal.targetBandNotSet);
  });

  test("'Change goal' reruns the questions with the current answers marked", async ({
    page,
    context,
    baseURL,
  }) => {
    await saveGoal(context, baseURL, "v1|general|6.5");
    await page.goto("/en");
    await page.getByRole("link", { name: en.home.goal.change }).click();

    await expect(page).toHaveURL("/en/start/exam");
    await expect(
      page.getByRole("button", {
        name: `${en.examType.general} ${en.onboarding.selected}`,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: en.examType.academic }).click();
    await expect(
      page.getByRole("button", { name: `6.5 ${en.onboarding.selected}` }),
    ).toBeVisible();
  });

  test("direct links to other pages never lead into onboarding", async ({
    page,
  }) => {
    await page.goto("/en/start/band");
    await expect(page).toHaveURL("/en/start/band");
    await page.goto("/en/some-practice-link");
    await expect(page).toHaveURL("/en/some-practice-link");
  });
});
