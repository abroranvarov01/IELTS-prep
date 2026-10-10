import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/i18n/routing";

type Locale = (typeof routing.locales)[number];
const catalogs = { uz, ru, en };
const TEST = "demo-academic-1";

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template,
  );
}

async function startPractice(page: Page, locale: Locale = "en") {
  await page.goto(`/${locale}/reading/${TEST}`);
  await page
    .getByRole("button", { name: catalogs[locale].reading.start })
    .click();
  await expect(questionHeading(page, locale, 1)).toBeVisible();
}

function questionHeading(page: Page, locale: Locale, number: number) {
  return page.getByRole("heading", {
    level: 2,
    name: fill(catalogs[locale].reading.question.of, { number, total: 40 }),
  });
}

/** Taps an option row, as a user does (the native input inside is visually hidden). */
async function choose(page: Page, name: string) {
  await page
    .locator("label")
    .filter({ has: page.getByRole("radio", { name, exact: true }) })
    .click();
}

const sheet = (page: Page, locale: Locale = "en") =>
  page.getByRole("region", { name: catalogs[locale].reading.sheet.label });

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
  const clipped = await page
    .locator("h1, h2, p, label, a, button")
    .evaluateAll((elements) =>
      elements
        // Visually hidden elements (the skip link) are 1 px wide by design.
        .filter((e) => e.clientWidth > 1 && e.scrollWidth > e.clientWidth + 1)
        .map((e) => e.textContent),
    );
  expect(clipped).toEqual([]);
}

test("opens the start screen with both modes, Practice chosen, and starts the test", async ({
  page,
}) => {
  await page.goto(`/en/reading/${TEST}`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Demo Reading Test 1" }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: new RegExp(en.reading.mode.practice) }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: new RegExp(en.reading.mode.exam) }),
  ).not.toBeChecked();

  await page.getByRole("button", { name: en.reading.start }).click();
  await expect(questionHeading(page, "en", 1)).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Bicycles in the Small City" }),
  ).toBeVisible();
  await expect(
    page.getByText(fill(en.reading.passageOf, { number: 1, total: 3 })),
  ).toBeVisible();
  // The test screen has its own bar instead of the shell header.
  await expect(page.getByRole("img", { name: en.app.name })).toHaveCount(0);
});

test("an unknown test is not found", async ({ page }) => {
  const response = await page.goto("/en/reading/no-such-test");
  expect(response?.status()).toBe(404);
});

test("choosing an answer does not move on, and the answer can be cleared", async ({
  page,
}) => {
  await startPractice(page);
  await choose(page, "FALSE");

  await expect(questionHeading(page, "en", 1)).toBeVisible();
  await expect(
    sheet(page).getByText(en.reading.navigator.answered),
  ).toBeVisible();

  await page.getByRole("button", { name: en.reading.answer.clear }).click();
  await expect(page.getByRole("radio", { name: "FALSE" })).not.toBeChecked();
  await expect(
    sheet(page).getByText(en.reading.navigator.answered),
  ).toHaveCount(0);
});

test("Next and Previous move between questions, focus the new question, and show its passage", async ({
  page,
}) => {
  await startPractice(page);
  await page.getByRole("button", { name: en.reading.question.next }).click();
  await expect(questionHeading(page, "en", 2)).toBeFocused();

  for (let n = 3; n <= 14; n++)
    await page.getByRole("button", { name: en.reading.question.next }).click();
  await expect(questionHeading(page, "en", 14)).toBeVisible();
  await expect(
    page.getByText(fill(en.reading.passageOf, { number: 2, total: 3 })),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "How Rooftop Gardens Change a Building",
    }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: en.reading.question.previous })
    .click();
  await expect(questionHeading(page, "en", 13)).toBeFocused();
  await expect(
    page.getByRole("heading", { level: 1, name: "Bicycles in the Small City" }),
  ).toBeVisible();
});

test("each question starts at its top, even after scrolling the previous one", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await startPractice(page);
  const body = page.locator("#question-body");
  await body.evaluate((e) => e.scrollTo(0, e.scrollHeight));
  expect(await body.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);

  await page.getByRole("button", { name: en.reading.question.next }).click();
  await expect(questionHeading(page, "en", 2)).toBeFocused();
  expect(await body.evaluate((e) => e.scrollTop)).toBe(0);
});

test("the handle button moves the sheet between collapsed and partial, also by keyboard", async ({
  page,
}) => {
  await startPractice(page);
  const hide = page.getByRole("button", { name: en.reading.sheet.hide });
  await expect(hide).toHaveAttribute("aria-expanded", "true");
  await hide.click();

  const show = page.getByRole("button", { name: en.reading.sheet.show });
  await expect(show).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("radio", { name: "TRUE" })).toHaveCount(0);
  await expect(questionHeading(page, "en", 1)).toBeVisible();

  await show.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("radio", { name: "TRUE" })).toBeVisible();
});

test("dragging the handle up snaps the sheet to expanded", async ({ page }) => {
  await startPractice(page);
  const handle = page.getByRole("button", { name: en.reading.sheet.hide });
  const box = await handle.boundingBox();
  if (!box) throw new Error("no handle");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, 60, { steps: 8 });
  await page.mouse.up();

  const viewport = page.viewportSize()!.height;
  await expect
    .poll(async () => (await sheet(page).boundingBox())?.height)
    .toBeGreaterThan(viewport - 60);
});

test("the sheet spans the screen width in every state", async ({ page }) => {
  await startPractice(page);
  const width = page.viewportSize()!.width;
  const expected = Math.min(width, 640);
  expect((await sheet(page).boundingBox())?.width).toBe(expected);
  await page.getByRole("button", { name: en.reading.sheet.hide }).click();
  await expect
    .poll(async () => (await sheet(page).boundingBox())?.width)
    .toBe(expected);
});

test("a reload keeps the question, its answer and the sheet state", async ({
  page,
}) => {
  await startPractice(page);
  await page.getByRole("button", { name: en.reading.question.next }).click();
  await choose(page, "FALSE");
  await page.getByRole("button", { name: en.reading.sheet.hide }).click();

  await page.reload();
  await expect(questionHeading(page, "en", 2)).toBeVisible();
  await page.getByRole("button", { name: en.reading.sheet.show }).click();
  await expect(page.getByRole("radio", { name: "FALSE" })).toBeChecked();
});

test("says so when the device cannot keep answers, and the test still works", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await startPractice(page);
  await expect(page.getByRole("status")).toHaveText(
    en.reading.storage.unavailable,
  );
  await choose(page, "TRUE");
  await expect(page.getByRole("radio", { name: "TRUE" })).toBeChecked();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the sheet changes state without animating", async ({ page }) => {
    await startPractice(page);
    const duration = await sheet(page).evaluate(
      (e) => parseFloat(getComputedStyle(e).transitionDuration) * 1000,
    );
    expect(duration).toBeLessThan(1);
  });
});

for (const locale of routing.locales) {
  const messages = catalogs[locale];

  test.describe(`Reading in /${locale}`, () => {
    test("the start screen and the reading screen have no WCAG 2.2 AA violations", async ({
      page,
    }) => {
      const axe = () =>
        new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
      await page.goto(`/${locale}/reading/${TEST}`);
      await expect(
        page.getByRole("button", { name: messages.reading.start }),
      ).toBeVisible();
      expect((await axe()).violations).toEqual([]);

      await page.getByRole("button", { name: messages.reading.start }).click();
      await expect(questionHeading(page, locale, 1)).toBeVisible();
      expect((await axe()).violations).toEqual([]);
    });

    test("the skip link leads to the question", async ({ page }) => {
      await startPractice(page, locale);
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: messages.reading.skipToQuestion }),
      ).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(questionHeading(page, locale, 1)).toBeFocused();
    });

    for (const width of [320, 360]) {
      test(`fits ${width} px without horizontal scroll or truncation`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 640 });
        await page.goto(`/${locale}/reading/${TEST}`);
        await expect(
          page.getByRole("button", { name: messages.reading.start }),
        ).toBeVisible();
        await noOverflow(page);

        await page
          .getByRole("button", { name: messages.reading.start })
          .click();
        await expect(questionHeading(page, locale, 1)).toBeVisible();
        await noOverflow(page);
      });
    }
  });
}

test.describe("question navigator", () => {
  const navButton = (page: Page, name: string | RegExp) =>
    sheet(page).getByRole("button", { name });

  test("opens in the expanded sheet with all 40 questions, and jumps across passages", async ({
    page,
  }) => {
    await startPractice(page);
    await page.getByRole("button", { name: en.reading.navigator.open }).click();
    await expect(
      page.getByRole("heading", { name: en.reading.navigator.open }),
    ).toBeFocused();
    await expect(
      sheet(page).getByRole("button", { name: /^Question \d+,/ }),
    ).toHaveCount(40);
    const viewport = page.viewportSize()!.height;
    await expect
      .poll(async () => (await sheet(page).boundingBox())?.height)
      .toBeGreaterThan(viewport - 60);

    await navButton(page, "Question 30, no answer").click();
    await expect(questionHeading(page, "en", 30)).toBeFocused();
    await expect(
      page.getByText(fill(en.reading.passageOf, { number: 3, total: 3 })),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Should Homework Be Shorter?",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: en.reading.navigator.open }),
    ).toHaveCount(0);
  });

  test("shows answered, marked and current questions in words", async ({
    page,
  }) => {
    await startPractice(page);
    await choose(page, "TRUE");
    await page.getByRole("button", { name: en.reading.question.next }).click();
    await page.getByRole("button", { name: en.reading.flag.add }).click();
    await expect(
      page.getByRole("button", { name: en.reading.flag.remove }),
    ).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: en.reading.navigator.open }).click();
    await expect(navButton(page, "Question 1, answered")).toBeVisible();
    await expect(
      navButton(page, "Question 2, no answer, marked for review, current"),
    ).toBeVisible();
  });

  test("Back and Escape close it and return focus", async ({ page }) => {
    await startPractice(page);
    const open = page.getByRole("button", { name: en.reading.navigator.open });
    await open.click();
    await page.getByRole("button", { name: en.reading.sheet.back }).click();
    await expect(open).toBeFocused();

    await open.click();
    await page.keyboard.press("Escape");
    await expect(open).toBeFocused();
    await expect(page.getByRole("radio", { name: "TRUE" })).toBeVisible();
  });

  test("works with the keyboard only", async ({ page }) => {
    await startPractice(page);
    await page.getByRole("button", { name: en.reading.navigator.open }).focus();
    await page.keyboard.press("Enter");
    const last = navButton(page, "Question 40, no answer");
    for (
      let i = 0;
      i < 60 && !(await last.evaluate((e) => e === document.activeElement));
      i++
    ) {
      await page.keyboard.press("Tab");
    }
    await expect(last).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(questionHeading(page, "en", 40)).toBeFocused();
  });

  test("fits 320 px with six questions per row", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await startPractice(page);
    await page.getByRole("button", { name: en.reading.navigator.open }).click();
    const tops = await sheet(page)
      .getByRole("button", { name: /^Question ([1-7]),/ })
      .evaluateAll((buttons) =>
        buttons.map((b) => Math.round(b.getBoundingClientRect().top)),
      );
    expect(new Set(tops.slice(0, 6)).size).toBe(1);
    expect(tops[6]).toBeGreaterThan(tops[0]!);
    await noOverflow(page);
  });

  for (const locale of ["en", "ru"] as const) {
    test(`has no WCAG 2.2 AA violations when open in /${locale}`, async ({
      page,
    }) => {
      await startPractice(page, locale);
      await page
        .getByRole("button", { name: catalogs[locale].reading.navigator.open })
        .click();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
