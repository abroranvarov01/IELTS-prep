import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import {
  type Locale,
  TEST,
  catalogs,
  fill,
  noOverflow,
  sentence,
  sheet,
} from "./reading";

// The evidence-first review on phones (READING_EXPERIENCE.md, M5): reached
// from the results, in the test-screen layout with the review sheet. The
// desktop layout is M5-08; below 1024 px every window shows the phone layout.

const en = catalogs.en;
const T0 = Date.UTC(2026, 9, 10, 9, 0);
const ID = "s-00000000-0000-4000-8000-000000000001";

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop")
    await page.setViewportSize({ width: 1000, height: 800 });
});

/**
 * A finished Practice session left on the device: question 1 correct (TRUE),
 * 2 not correct (TRUE; the key says FALSE), 3 correct (NOT GIVEN), 22–23
 * partly correct (A, B; the key accepts A and C), the rest unanswered. The
 * results page commits it.
 */
async function finishedAttempt(page: Page, locale: Locale = "en") {
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
}

const cardHeading = (page: Page) =>
  sheet(page).getByRole("heading", { level: 2 }).first();
const toReview = (current: number) =>
  fill(en.reading.review.toReview, { current, total: 37 });

async function openReviewFromResults(page: Page) {
  await finishedAttempt(page);
  await page.goto(`/en/reading/${TEST}/results`);
  await page
    .getByRole("link", { name: en.reading.results.reviewMistakesAndUnanswered })
    .click();
  await expect(cardHeading(page)).toHaveText(/^Question 2 of 40/);
}

test("the red button opens the first card to review; Next walks the mistakes and unanswered questions, counting cards", async ({
  page,
}) => {
  await openReviewFromResults(page);
  await expect(cardHeading(page)).toHaveText("Question 2 of 40Not correct");
  await expect(cardHeading(page)).toBeFocused();
  await expect(sheet(page).getByText(toReview(1))).toBeVisible();
  await expect(
    sheet(page).getByText(en.reading.review.yourAnswerIncorrect),
  ).toBeVisible();
  // Its evidence is marked in the passage and scrolled into view.
  await expect(page.getByText("Evidence for question 2")).toBeAttached();
  await expect(sentence(page, "p1-2-s3")).toBeInViewport();
  // The learner's pin is the sentence the key cites.
  await expect(
    sheet(page).getByText(en.reading.review.pinMatch),
  ).toBeAttached();

  await sheet(page)
    .getByRole("button", { name: en.reading.question.next })
    .click();
  await expect(cardHeading(page)).toHaveText("Question 4 of 40No answer");
  await expect(cardHeading(page)).toBeFocused();
  await expect(sheet(page).getByText(toReview(2))).toBeVisible();
  await expect(
    sheet(page).getByText(en.reading.review.noAnswerGiven),
  ).toBeAttached();
  await expect(page).toHaveURL(/q=4&set=mistakes$/);

  // Moving between cards replaces the address: Back leaves the review.
  await page.goBack();
  await expect(page).toHaveURL(/\/results$/);
});

test("the navigator shows outcome badges and opens a correct question, an unanswered one, and 22–23 from either number", async ({
  page,
}) => {
  await openReviewFromResults(page);
  const navigatorButton = sheet(page).getByRole("button", {
    name: en.reading.navigator.open,
  });
  const choose = async (name: string) => {
    await navigatorButton.click();
    await sheet(page)
      .getByRole("button", { name, exact: true })
      .first()
      .click();
  };

  await choose("Question 1, correct");
  await expect(cardHeading(page)).toHaveText("Question 1 of 40Correct");
  await expect(cardHeading(page)).toBeFocused();
  // Every card now, so no review progress.
  await expect(sheet(page).getByText(/To review/)).toHaveCount(0);
  await expect(page).toHaveURL(/q=1&set=all$/);

  await choose("Question 9, no answer");
  await expect(cardHeading(page)).toHaveText("Question 9 of 40No answer");

  await navigatorButton.click();
  const item = sheet(page).getByRole("button", {
    name: "Questions 22–23, partly correct",
  });
  await expect(item).toHaveCount(2);
  await item.nth(1).click();
  await expect(cardHeading(page)).toHaveText("Questions 22–231 of 2 correct");
  await navigatorButton.click();
  await sheet(page)
    .getByRole("button", { name: "Questions 22–23, partly correct, current" })
    .first()
    .click();
  await expect(cardHeading(page)).toHaveText("Questions 22–231 of 2 correct");
  await expect(
    sheet(page).getByText(en.reading.review.yourAnswerCorrect),
  ).toBeAttached();
  await expect(
    sheet(page).getByText(en.reading.review.yourAnswerIncorrect),
  ).toBeAttached();
});

test("Explain simpler shows the simpler explanation after the button, and Show in passage moves to the sentence", async ({
  page,
}) => {
  await openReviewFromResults(page);
  const simpler = sheet(page).getByRole("button", {
    name: en.reading.review.simpler,
  });
  await simpler.click();
  const hide = sheet(page).getByRole("button", {
    name: en.reading.review.simplerHide,
  });
  await expect(hide).toHaveAttribute("aria-expanded", "true");
  await expect(hide).toBeFocused();
  await expect(
    sheet(page).getByText(en.reading.review.simplerTitle),
  ).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 0));
  await sheet(page)
    .getByRole("button", { name: en.reading.evidence.show })
    .first()
    .click();
  await expect(sentence(page, "p1-2-s3")).toBeFocused();
  await expect(sentence(page, "p1-2-s3")).toBeInViewport();
});

test("the keyboard path: results to the review, Next, and the navigator closed with Escape", async ({
  page,
}) => {
  await finishedAttempt(page);
  await page.goto(`/en/reading/${TEST}/results`);
  const review = page.getByRole("link", {
    name: en.reading.results.reviewMistakesAndUnanswered,
  });
  await review.focus();
  await page.keyboard.press("Enter");
  await expect(cardHeading(page)).toBeFocused();

  const next = sheet(page).getByRole("button", {
    name: en.reading.question.next,
  });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(cardHeading(page)).toHaveText(/^Question 4 of 40/);
  await expect(cardHeading(page)).toBeFocused();

  const navigatorButton = sheet(page).getByRole("button", {
    name: en.reading.navigator.open,
  });
  await navigatorButton.focus();
  await page.keyboard.press("Enter");
  await expect(
    sheet(page).getByRole("heading", { name: en.reading.navigator.open }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(navigatorButton).toBeFocused();
});

test("an unknown attempt shows the empty state with Start the test", async ({
  page,
}) => {
  await page.goto(`/en/reading/${TEST}/review?attempt=s-missing&q=3`);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: en.reading.results.none.title,
    }),
  ).toBeFocused();
  await expect(
    page.getByRole("link", { name: en.reading.results.none.start }),
  ).toHaveAttribute("href", `/en/reading/${TEST}`);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the passage jumps to the evidence instead of scrolling smoothly", async ({
    page,
  }) => {
    await finishedAttempt(page);
    await page.goto(`/en/reading/${TEST}/results`);
    await page.goto(`/en/reading/${TEST}/review?attempt=${ID}&q=13&set=all`);
    await expect(cardHeading(page)).toBeFocused();
    // Read once, without waiting: a smooth scroll would still be moving.
    const [top, bottom, sheetTop] = await page.evaluate(() => {
      const box = document
        .querySelector('[data-sentence="p1-3-s4"]')
        ?.getBoundingClientRect();
      const region = document
        .querySelector("section[aria-label]")
        ?.getBoundingClientRect();
      return [box?.top ?? -1, box?.bottom ?? 1e9, region?.top ?? 0];
    });
    // Below the test bar, above the sheet.
    expect(top).toBeGreaterThanOrEqual(48);
    expect(bottom).toBeLessThanOrEqual(sheetTop);
  });
});

test.describe("at 320 px and at 200% zoom", () => {
  for (const locale of ["uz", "ru", "en"] as const) {
    test(`a card and the navigator fit and pass axe in /${locale}`, async ({
      page,
    }) => {
      const m = catalogs[locale];
      const axe = async () =>
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations;
      await page.setViewportSize({ width: 320, height: 640 });
      await finishedAttempt(page, locale);
      await page.goto(`/${locale}/reading/${TEST}/results`);
      await page
        .getByRole("link", {
          name: m.reading.results.reviewMistakesAndUnanswered,
        })
        .click();
      const card = page.getByRole("region", { name: m.reading.sheet.label });
      await card
        .getByRole("button", { name: m.reading.review.simpler })
        .click();
      await expect(card.getByText(m.reading.review.simplerTitle)).toBeVisible();
      await noOverflow(page);
      expect(await axe()).toEqual([]);

      // The longest outcome: the partly correct item.
      await page.goto(
        `/${locale}/reading/${TEST}/review?attempt=${ID}&q=22&set=mistakes`,
      );
      await expect(
        card.getByText(fill(m.reading.review.partly, { correct: 1, total: 2 })),
      ).toBeVisible();
      await noOverflow(page);
      await card
        .getByRole("button", { name: m.reading.navigator.open })
        .click();
      await noOverflow(page);
      expect(await axe()).toEqual([]);

      // 200% zoom of a 1280 × 800 window: 640 × 400 CSS pixels.
      await page.setViewportSize({ width: 640, height: 400 });
      await noOverflow(page);
    });
  }
});
