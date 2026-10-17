import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import {
  type Locale,
  TEST,
  catalogs,
  fill,
  noOverflow,
  sentence,
} from "./reading";

// The evidence-first review on desktop (READING_EXPERIENCE.md, M5): from
// 1024 px the passage and the current card sit side by side, with the M4
// navigator bar and its outcome badges along the bottom. Desktop project only.

const en = catalogs.en;
const T0 = Date.UTC(2026, 9, 10, 9, 0);
const ID = "s-00000000-0000-4000-8000-000000000001";

/**
 * A finished Practice attempt on the device: 1 correct, 2 not correct, 3
 * correct, 22–23 partly correct, the rest unanswered (as in
 * reading-review.spec.ts).
 */
async function openReview(page: Page, locale: Locale = "en", q = "") {
  await page.goto(`/${locale}`);
  await page.evaluate(
    ([test, t0, id]) =>
      localStorage.setItem(
        `reading:${test}`,
        JSON.stringify({
          schema: 1,
          session: {
            sessionId: id,
            testId: test,
            testVersion: 1,
            mode: "practice",
            status: "finished",
            finishReason: "user",
            startedAt: t0,
            finishedAt: t0 + 600_000,
            currentQuestion: 1,
            answers: {
              "1": "TRUE",
              "2": "TRUE",
              "3": "NOT GIVEN",
              "22": ["A", "B"],
            },
            flagged: [],
            highlights: ["p1-1-s1"],
            pins: { "2": ["p1-2-s3"] },
            view: { sheet: "partial", passage: 1, scroll: {} },
          },
        }),
      ),
    [TEST, T0, ID] as const,
  );
  // The results page commits the attempt; the review opens from its button.
  await page.goto(`/${locale}/reading/${TEST}/results`);
  if (q)
    await page.goto(
      `/${locale}/reading/${TEST}/review?attempt=${ID}&q=${q}&set=mistakes`,
    );
  else
    await page
      .getByRole("link", {
        name: catalogs[locale].reading.results.reviewMistakesAndUnanswered,
      })
      .click();
}

const column = (page: Page, locale: Locale = "en") =>
  page.getByRole("region", {
    name: catalogs[locale].reading.sheet.label,
    exact: true,
  });
const bar = (page: Page, locale: Locale = "en") =>
  page.getByRole("region", { name: catalogs[locale].reading.navigator.open });
const cardHeading = (page: Page) => page.locator("#question-heading");

test("from 1024 px the passage and the card sit side by side, with the navigator bar; below it the sheet returns", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await openReview(page);
  await expect(cardHeading(page)).toHaveText("Question 2 of 40Not correct");
  await expect(cardHeading(page)).toBeFocused();
  await expect(column(page).getByText("To review: 1 of 37")).toBeVisible();

  const passageBox = await page.getByRole("main").boundingBox();
  const columnBox = await column(page).boundingBox();
  const barBox = await bar(page).boundingBox();
  expect(passageBox && columnBox && passageBox.x < columnBox.x).toBe(true);
  expect(
    columnBox && barBox && columnBox.y + columnBox.height <= barBox.y + 1,
  ).toBe(true);
  // The bar keeps its content-driven height: at most three rows at 1024 px.
  expect(barBox?.height).toBeLessThan(3 * 64);
  await expect(sentence(page, "p1-2-s3")).toBeInViewport();

  await page.setViewportSize({ width: 1023, height: 800 });
  await expect(bar(page)).toHaveCount(0);
  await expect(page.locator("#question-body")).toBeVisible();
});

test("Next and the bar's cells change the card; both numbers of 22–23 open its one card; another passage moves the passage column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openReview(page);
  await bar(page)
    .getByRole("button", { name: en.reading.question.next })
    .click();
  await expect(cardHeading(page)).toHaveText("Question 4 of 40No answer");
  await expect(cardHeading(page)).toBeFocused();
  await expect(page).toHaveURL(/q=4&set=mistakes$/);

  await bar(page).getByRole("button", { name: "Question 1, correct" }).click();
  await expect(cardHeading(page)).toHaveText("Question 1 of 40Correct");
  await expect(column(page).getByText(/To review/)).toHaveCount(0);

  await bar(page)
    .getByRole("button", {
      name: fill(en.reading.navigator.passage, { number: 2 }),
    })
    .click();
  await expect(page.getByText("Passage 2 of 3")).toBeVisible();
  const item = bar(page).getByRole("button", {
    name: /^Questions 22–23, partly correct/,
  });
  await expect(item).toHaveCount(2);
  await item.nth(1).click();
  await expect(cardHeading(page)).toHaveText("Questions 22–231 of 2 correct");
  await expect(sentence(page, "p2-b-s4")).toBeInViewport();
  await item.nth(0).click();
  await expect(cardHeading(page)).toHaveText("Questions 22–231 of 2 correct");
});

test("the keyboard goes through the test bar, the passage, the card and the navigator bar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openReview(page);
  await page.getByRole("link", { name: en.reading.review.toResults }).focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("main [data-sentence]:focus")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(column(page).locator(":focus")).toHaveCount(1);
  // Through the card's controls, then into the bar.
  for (let i = 0; i < 20; i++) {
    if ((await bar(page).locator(":focus").count()) > 0) break;
    await expect(column(page).locator(":focus")).toHaveCount(1);
    await page.keyboard.press("Tab");
  }
  await expect(bar(page).locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(cardHeading(page)).toBeFocused();
});

test("Show in passage scrolls the passage column to the sentence and focuses it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openReview(page, "en", "2");
  await page.getByRole("main").evaluate((e) => e.scrollTo(0, e.scrollHeight));
  await column(page)
    .getByRole("button", { name: en.reading.evidence.show })
    .first()
    .click();
  await expect(sentence(page, "p1-2-s3")).toBeFocused();
  await expect(sentence(page, "p1-2-s3")).toBeInViewport();
});

for (const width of [1024, 1280]) {
  for (const locale of ["uz", "ru", "en"] as const) {
    test(`at ${width} px in /${locale} the review fits and has no WCAG 2.2 AA violations`, async ({
      page,
    }) => {
      const m = catalogs[locale];
      await page.setViewportSize({ width, height: 800 });
      await openReview(page, locale, "22");
      await column(page, locale)
        .getByRole("button", { name: m.reading.review.simpler })
        .click();
      await expect(
        column(page, locale).getByText(m.reading.review.simplerTitle),
      ).toBeVisible();
      await expect(
        bar(page, locale).getByRole("button", {
          name: m.reading.question.next,
        }),
      ).toBeVisible();
      await noOverflow(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
