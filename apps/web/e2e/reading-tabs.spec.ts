import { expect, type Page, test } from "@playwright/test";
import { TEST, catalogs, choose, fill } from "./reading";

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

const sheet = (page: Page) =>
  page.getByRole("region", { name: en.reading.sheet.label });

const questionHeading = (page: Page, number: number) =>
  sheet(page).getByRole("heading", {
    name: fill(en.reading.question.of, { number, total: 40 }),
  });

const answeredText = (answered: number) =>
  fill(en.reading.finished.answered, { answered, total: 40 });

async function openTest(page: Page) {
  await page.goto(`/en/reading/${TEST}`);
}

async function startPractice(page: Page) {
  await openTest(page);
  await page.getByRole("button", { name: en.reading.start }).click();
  await expect(questionHeading(page, 1)).toBeVisible();
}

/** Opens the finish confirmation from the navigator. */
async function askToFinish(page: Page) {
  await page.getByRole("button", { name: en.reading.navigator.open }).click();
  await sheet(page)
    .getByRole("button", { name: en.reading.finish.button })
    .click();
  return sheet(page).getByRole("button", {
    name: en.reading.finish.confirm,
    exact: true,
  });
}

/** The records of one store of the attempt history, as committed. */
function storedRecords(page: Page, store: "attempts" | "firstTry") {
  return page.evaluate(
    (name) =>
      new Promise<Record<string, unknown>[]>((resolve, reject) => {
        const open = indexedDB.open("ielts-prep-reading");
        open.onsuccess = () => {
          const request = open.result
            .transaction(name, "readonly")
            .objectStore(name)
            .getAll();
          request.onsuccess = () => {
            open.result.close();
            resolve(request.result as Record<string, unknown>[]);
          };
          request.onerror = () => reject(request.error);
        };
        open.onerror = () => reject(open.error);
      }),
    store,
  );
}

test("a session finished in two tabs keeps the attempt committed first", async ({
  page: tabA,
}) => {
  await startPractice(tabA);
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
  await expect(tabA.getByText(answeredText(1))).toBeVisible();

  // The stale tab finishes later: it is shown the attempt tab A committed.
  await (await askToFinish(tabB)).click();
  await expect(tabB.getByText(answeredText(1))).toBeVisible();

  const attempts = await storedRecords(tabA, "attempts");
  expect(attempts).toHaveLength(1);
  expect(attempts[0]?.answers).toEqual({ "1": "TRUE" });
  expect(await tabA.evaluate(() => localStorage.length)).toBe(0);
});

test("finishing the same session in two tabs at once commits one attempt, shown in both", async ({
  page: tabA,
}) => {
  await startPractice(tabA);
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
  await expect(tabA.getByText(answeredText(answered))).toBeVisible();
  await expect(tabB.getByText(answeredText(answered))).toBeVisible();
  expect(await storedRecords(tabA, "firstTry")).toEqual([
    { schema: 1, testId: TEST, firstTry: attempt?.id },
  ]);
});

test("a stale tab's copy of a committed session is removed when it reloads", async ({
  page: tabA,
}) => {
  await startPractice(tabA);
  await choose(tabA, "TRUE");
  const tabB = await newTab(tabA);
  await openTest(tabB);
  await expect(questionHeading(tabB, 1)).toBeVisible();

  await (await askToFinish(tabA)).click();
  await expect(tabA.getByText(answeredText(1))).toBeVisible();

  // Tab B keeps answering its in-progress copy after the commit.
  await sheet(tabB)
    .getByRole("button", { name: en.reading.question.next })
    .click();
  await choose(tabB, "FALSE");
  await tabB.reload();
  await expect(tabB.getByText(answeredText(1))).toBeVisible();
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
