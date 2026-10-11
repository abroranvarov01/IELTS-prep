import { expect, type Page, test } from "@playwright/test";
import {
  TEST,
  askToFinish,
  catalogs,
  choose,
  fill,
  openTest,
  questionHeading,
  sheet,
  startTest,
  storedRecords,
} from "./reading";

const en = catalogs.en;

// Two pages in one browser context share localStorage and IndexedDB, like two
// tabs of one browser. The attempt history keeps the first committed attempt
// of a session, whatever the other tab does (ADR-0009 §4, §11). The phone
// layout, as in reading.spec.ts.

const T0 = Date.UTC(2026, 9, 10, 9, 0);

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop")
    await page.setViewportSize({ width: 1000, height: 800 });
});

async function newTab(page: Page) {
  const tab = await page.context().newPage();
  await tab.setViewportSize(page.viewportSize() ?? { width: 360, height: 800 });
  return tab;
}

// Questions 1 (TRUE) and 2 (FALSE) are both answered correctly here, so the
// score tells which tab's answers were committed.
const scoreText = (score: number) =>
  fill(en.reading.results.score, { score, total: 40 });

test("a session finished in two tabs keeps the attempt committed first", async ({
  page: tabA,
}) => {
  await startTest(tabA);
  await choose(tabA, "TRUE");
  const tabB = await newTab(tabA);
  await openTest(tabB);
  await expect(questionHeading(tabB, 1)).toBeVisible();
  await expect(tabB.getByRole("radio", { name: "TRUE" })).toBeChecked();

  // Tab B answers one more question in its own copy of the session.
  await sheet(tabB)
    .getByRole("button", { name: en.reading.question.next })
    .click();
  await choose(tabB, "FALSE");

  await (await askToFinish(tabA)).click();
  await expect(tabA.getByText(scoreText(1))).toBeVisible();

  // The stale tab finishes later: it is shown the attempt tab A committed.
  await (await askToFinish(tabB)).click();
  await expect(tabB.getByText(scoreText(1))).toBeVisible();

  const attempts = await storedRecords(tabA, "attempts");
  expect(attempts).toHaveLength(1);
  expect(attempts[0]?.answers).toEqual({ "1": "TRUE" });
  expect(await tabA.evaluate(() => localStorage.length)).toBe(0);
});

test("finishing the same session in two tabs at once commits one attempt, shown in both", async ({
  page: tabA,
}) => {
  await startTest(tabA);
  await choose(tabA, "TRUE");
  const tabB = await newTab(tabA);
  await openTest(tabB);
  await expect(questionHeading(tabB, 1)).toBeVisible();
  await sheet(tabB)
    .getByRole("button", { name: en.reading.question.next })
    .click();
  await choose(tabB, "FALSE");

  const [finishA, finishB] = [await askToFinish(tabA), await askToFinish(tabB)];
  await Promise.all([finishA.click(), finishB.click()]);

  await expect
    .poll(async () => (await storedRecords(tabA, "attempts")).length)
    .toBe(1);
  const [attempt] = await storedRecords(tabA, "attempts");
  const answered = Object.keys(
    (attempt?.answers as Record<string, unknown>) ?? {},
  ).length;
  await expect(tabA.getByText(scoreText(answered))).toBeVisible();
  await expect(tabB.getByText(scoreText(answered))).toBeVisible();
  expect(await storedRecords(tabA, "firstTry")).toEqual([
    { schema: 1, testId: TEST, firstTry: attempt?.id },
  ]);
});

test("a stale tab's copy of a committed session is removed when it reloads", async ({
  page: tabA,
}) => {
  await startTest(tabA);
  await choose(tabA, "TRUE");
  const tabB = await newTab(tabA);
  await openTest(tabB);
  await expect(questionHeading(tabB, 1)).toBeVisible();

  await (await askToFinish(tabA)).click();
  await expect(tabA.getByText(scoreText(1))).toBeVisible();

  // Tab B keeps answering its in-progress copy after the commit.
  await sheet(tabB)
    .getByRole("button", { name: en.reading.question.next })
    .click();
  await choose(tabB, "FALSE");
  await tabB.reload();
  // The stale copy is gone: the test link offers the committed results (D6).
  await expect(
    tabB.getByRole("link", { name: en.reading.lastResults }),
  ).toBeVisible();
  await expect
    .poll(() =>
      tabB.evaluate((key) => localStorage.getItem(key), `reading:${TEST}`),
    )
    .toBeNull();
  expect(await storedRecords(tabB, "attempts")).toHaveLength(1);
});

test("sessions stored by M4 are resumed and imported with their highlights, without a result", async ({
  page,
}) => {
  const m4Session = {
    testId: TEST,
    testVersion: 1,
    currentQuestion: 1,
    answers: { "1": "TRUE" },
    flagged: [],
    highlights: ["p1-1-s1"],
    pins: {},
    view: { sheet: "partial", passage: 1, scroll: {} },
  };
  const m4Finished = {
    ...m4Session,
    mode: "exam",
    status: "finished",
    finishReason: "timeUp",
    startedAt: T0,
    finishedAt: T0 + 3_600_000,
  };
  const m4Current = {
    ...m4Session,
    mode: "practice",
    status: "inProgress",
    startedAt: T0 + 7_200_000,
  };
  await page.goto("/en");
  await page.evaluate(
    ([test, finished, current]) => {
      localStorage.setItem(
        `reading:${test}:finished`,
        JSON.stringify({ schema: 1, session: finished }),
      );
      localStorage.setItem(
        `reading:${test}`,
        JSON.stringify({ schema: 1, session: current }),
      );
    },
    [TEST, m4Finished, m4Current] as const,
  );

  await openTest(page);
  await expect(questionHeading(page, 1)).toBeVisible();
  await expect(page.getByRole("radio", { name: "TRUE" })).toBeChecked();
  await expect(
    page.locator('main [data-sentence="p1-1-s1"] mark'),
  ).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        (key) => localStorage.getItem(key),
        `reading:${TEST}:finished`,
      ),
    )
    .toBeNull();
  const attempts = await storedRecords(page, "attempts");
  expect(attempts).toEqual([
    expect.objectContaining({
      id: `m4-finished-${T0}`,
      importedFromM4: true,
      highlights: ["p1-1-s1"],
      answers: { "1": "TRUE" },
      finishReason: "timeUp",
    }),
  ]);
  expect(await storedRecords(page, "firstTry")).toEqual([
    { schema: 1, testId: TEST, firstTry: "unknown" },
  ]);

  // The session in progress keeps the id derived from its start time.
  await choose(page, "FALSE");
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
    `reading:${TEST}`,
  );
  expect(stored.session.sessionId).toBe(`m4-current-${T0 + 7_200_000}`);
});
