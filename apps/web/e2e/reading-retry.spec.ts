import { expect, type Page, test } from "@playwright/test";
import { TEST, catalogs, choose, fill, storedRecords } from "./reading";

// Trying questions again (READING_EXPERIENCE.md, Targeted practice (M5)): on
// phones the test screen's sheet, on desktop (the desktop project, 1280 px)
// the two columns, both with only the retried questions.

const en = catalogs.en;
const T0 = Date.UTC(2026, 9, 10, 9, 0);
const ID = "s-00000000-0000-4000-8000-000000000001";

/**
 * A finished Practice attempt, committed by opening its results: 1 and 3
 * correct, 2 not correct (TRUE; the key says FALSE), 22–23 partly correct
 * (A, B), the rest unanswered: 3 of 40.
 */
async function finishedAttempt(page: Page) {
  await page.goto("/en");
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
            highlights: [],
            pins: {},
            view: { sheet: "partial", passage: 1, scroll: {} },
          },
        }),
      ),
    [TEST, T0, ID] as const,
  );
  await page.goto(`/en/reading/${TEST}/results`);
  await expect(page.getByText("3 of 40 correct")).toBeVisible();
}

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const heading = (page: Page, number: number) =>
  page.locator("#question-heading", {
    hasText: fill(en.reading.question.of, { number, total: 40 }),
  });
const range = (page: Page) =>
  page.locator("#question-heading", { hasText: "Questions 22–23" });
const navigatorRegion = (page: Page) =>
  page.getByRole("region", { name: en.reading.navigator.open });

/** Opens the list of questions: the sheet's navigator, or the desktop bar. */
async function questionList(page: Page) {
  if (isDesktop(page)) return navigatorRegion(page);
  await page.getByRole("button", { name: en.reading.navigator.open }).click();
  return page.getByRole("region", { name: en.reading.sheet.label });
}

async function next(page: Page) {
  await page.getByRole("button", { name: en.reading.question.next }).click();
}

async function finish(page: Page) {
  if (!isDesktop(page))
    await page.getByRole("button", { name: en.reading.navigator.open }).click();
  await page
    .getByRole("button", { name: en.reading.finish.button })
    .first()
    .click();
  await page
    .getByRole("button", { name: en.reading.finish.confirm, exact: true })
    .click();
  await expect(page).toHaveURL(/\/results\?attempt=s-/);
}

test("the results offer every question not fully correct or unanswered once, counted in positions", async ({
  page,
}) => {
  await finishedAttempt(page);
  const link = page.getByRole("link", {
    name: "Try 38 questions again: not correct or no answer",
  });
  await expect(link).toHaveAttribute(
    "href",
    new RegExp(`/en/reading/${TEST}/retry\\?of=${ID}&q=2,4,5,`),
  );
});

test("a retry shows only its questions, answers start empty, and its results are its own; the test's results stay as they were", async ({
  page,
}) => {
  await finishedAttempt(page);
  const [before] = await storedRecords(page, "attempts");
  const recordsBefore = await storedRecords(page, "results");

  await page.goto(`/en/reading/${TEST}/retry?of=${ID}&q=2,23`);
  await expect(heading(page, 2)).toBeVisible();
  await expect(page.getByText("1 of 3 to practise")).toBeVisible();
  await expect(page.getByRole("radio", { name: "TRUE" })).not.toBeChecked();

  const list = await questionList(page);
  await expect(list.getByRole("button", { name: /^Question 1, / })).toHaveCount(
    0,
  );
  await expect(list.getByRole("button", { name: /^Question 2, / })).toHaveCount(
    1,
  );
  if (!isDesktop(page))
    await page.getByRole("button", { name: en.reading.sheet.back }).click();

  await choose(page, "FALSE");
  await next(page);
  await expect(range(page)).toBeVisible();
  await expect(page.getByText("2 of 3 to practise")).toBeVisible();
  // 22–23 starts with both choices empty.
  await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: en.reading.question.next }),
  ).toHaveCount(0);

  await finish(page);
  await expect(
    page.getByRole("heading", { level: 1, name: en.reading.retry.title }),
  ).toBeVisible();
  await expect(page.getByText("1 of 3 now correct")).toBeVisible();
  await expect(page.getByText(en.reading.retry.honest)).toBeVisible();
  await expect(page.getByText(/of 40/)).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      // 2 is now correct, 22–23 unanswered.
      name: en.reading.results.reviewUnanswered,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /questions again/ })).toHaveCount(
    0,
  );

  // The retry is its own attempt; the test attempt and its record are unchanged.
  const attempts = await storedRecords(page, "attempts");
  expect(attempts.find((a) => a.id === ID)).toEqual(before);
  expect(attempts.find((a) => a.kind === "retry")).toMatchObject({
    retryOf: ID,
    questions: [2, 22, 23],
    mode: "practice",
  });
  const records = await storedRecords(page, "results");
  expect(records.filter((r) => r.attemptId === ID)).toEqual(recordsBefore);

  await page
    .getByRole("link", { name: en.reading.retry.backToResults })
    .click();
  await expect(page.getByText("3 of 40 correct")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: en.reading.results.title }),
  ).toBeVisible();
});

test("the same retry resumes; a different one replaces it", async ({
  page,
}) => {
  await finishedAttempt(page);
  const address = `/en/reading/${TEST}/retry?of=${ID}&q=2`;
  await page.goto(address);
  await choose(page, "FALSE");
  await page.goto(address);
  await expect(page.getByRole("radio", { name: "FALSE" })).toBeChecked();

  await page.goto(`/en/reading/${TEST}/retry?of=${ID}&q=4`);
  await expect(heading(page, 4)).toBeVisible();
  await page.goto(address);
  await expect(heading(page, 2)).toBeVisible();
  await expect(page.getByRole("radio", { name: "FALSE" })).not.toBeChecked();
});

test("a retry finished in two pages at once commits one attempt", async ({
  page,
}) => {
  await finishedAttempt(page);
  const address = `/en/reading/${TEST}/retry?of=${ID}&q=2`;
  await page.goto(address);
  await choose(page, "FALSE");
  const other = await page.context().newPage();
  await other.setViewportSize(
    page.viewportSize() ?? { width: 360, height: 800 },
  );
  await other.goto(address);
  await expect(other.getByRole("radio", { name: "FALSE" })).toBeChecked();

  await Promise.all([finish(page), finish(other)]);
  const retries = (await storedRecords(page, "attempts")).filter(
    (a) => a.kind === "retry",
  );
  expect(retries).toHaveLength(1);
  await expect(other.getByText("1 of 1 now correct")).toBeVisible();
});

for (const [name, address, reason] of [
  [
    "a source not on this device",
    `of=s-missing&q=2`,
    en.reading.retry.sourceMissing,
  ],
  [
    "questions the source got right",
    `of=${ID}&q=1`,
    en.reading.retry.notAllowed,
  ],
] as const)
  test(`a retry address of ${name} shows why it can't start`, async ({
    page,
  }) => {
    await finishedAttempt(page);
    await page.goto(`/en/reading/${TEST}/retry?${address}`);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: en.reading.retry.unavailable,
      }),
    ).toBeFocused();
    await expect(page.getByText(reason)).toBeVisible();
    await expect(
      page.getByRole("link", { name: en.reading.lastResults }),
    ).toHaveAttribute("href", `/en/reading/${TEST}/results`);
    await expect(
      page.getByRole("link", { name: en.reading.results.none.start }),
    ).toHaveAttribute("href", `/en/reading/${TEST}`);
  });
