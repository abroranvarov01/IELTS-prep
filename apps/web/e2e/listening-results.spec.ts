import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import { catalogs, fill, noOverflow } from "./reading";

// Listening results (M9-08): a sitting M8 left finished on the device is
// imported and checked when its results are first shown; an interrupted
// Exam, a temporary test and the checked-later note are said on the page.

const TEST = "temporary-voa-1";
const T0 = 1_760_000_000_000;
const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

/** What M8 kept: an Exam finished without the rest after an audio failure. */
const m8Exam = {
  schema: 1,
  session: {
    sessionId: "s-00000000-0000-4000-8000-000000000123",
    testId: TEST,
    testVersion: 1,
    mode: "exam",
    status: "finished",
    finishReason: "audioFailed",
    startedAt: T0,
    finishedAt: T0 + 120_000,
    currentQuestion: 2,
    answers: { "1": "bus", "2": "lake" },
    flagged: [],
    view: { part: 1, scroll: {} },
    exam: {
      recordingStartedAt: T0 + 5_000,
      pausedMs: 0,
      interruptions: 1,
      lastActiveAt: T0 + 120_000,
    },
  },
};

for (const locale of routing.locales) {
  const m = catalogs[locale];
  test(`an interrupted M8 Exam shows its results with every note in /${locale}`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/practice`);
    await page.evaluate(
      ({ test, value }) => {
        localStorage.clear();
        localStorage.setItem(`listening:${test}:finished`, value);
      },
      { test: TEST, value: JSON.stringify(m8Exam) },
    );
    await page.goto(`/${locale}/listening/${TEST}/results`);

    await expect(
      page.getByRole("heading", { name: m.reading.results.title }),
    ).toBeVisible();
    await expect(
      page.getByText(fill(m.reading.results.score, { score: 1, total: 40 })),
    ).toBeVisible();
    await expect(page.getByText(m.listening.results.honest)).toBeVisible();
    await expect(page.getByText(m.listening.temporary.label)).toBeVisible();
    await expect(
      page.getByText(m.listening.finished.interrupted),
    ).toBeVisible();
    await expect(
      page.getByText(m.reading.results.importedFromM4),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: m.reading.results.reviewMistakesAndUnanswered,
      }),
    ).toHaveAttribute("href", /\/listening\/temporary-voa-1\/review\?attempt=/);
    await noOverflow(page);
    expect((await axe(page)).violations).toEqual([]);

    // The test link now offers the last results, and the Hub shows the score.
    await page.goto(`/${locale}/listening/${TEST}`);
    await expect(
      page.getByRole("link", { name: m.reading.lastResults }),
    ).toBeVisible();
    await page.goto(`/${locale}/practice`);
    await expect(
      page.getByRole("link", { name: /Temporary Listening Practice 1/ }),
    ).toContainText(fill(m.practice.state.finished, { score: 1, total: 40 }));
  });
}

test("a device without Listening attempts says so and offers the test", async ({
  page,
}) => {
  await page.goto("/en/practice");
  await page.evaluate(() => localStorage.clear());
  await page.goto(`/en/listening/${TEST}/results`);
  await expect(
    page.getByRole("heading", { name: catalogs.en.reading.results.none.title }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: catalogs.en.reading.results.none.start }),
  ).toHaveAttribute("href", `/en/listening/${TEST}`);
});
