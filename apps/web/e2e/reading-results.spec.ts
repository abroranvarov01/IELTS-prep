import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import {
  type Locale,
  TEST,
  askToFinish,
  catalogs,
  choose,
  fill,
  noOverflow,
  openTest,
  sheet,
  startTest,
  storedRecords,
} from "./reading";

// The results page (READING_EXPERIENCE.md, M5): reached by finishing a test,
// in the shell, never showing a band. The phone layout for the test itself,
// as in reading.spec.ts.

const en = catalogs.en;
const T0 = Date.UTC(2026, 9, 10, 9, 0);

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop")
    await page.setViewportSize({ width: 1000, height: 800 });
});

const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const scoreText = (score: number, locale: Locale = "en") =>
  fill(catalogs[locale].reading.results.score, { score, total: 40 });

/** Question 1 correct (TRUE), question 2 not correct (TRUE; the key says FALSE). */
async function answerOneRightOneWrong(page: Page) {
  await choose(page, "TRUE");
  await sheet(page)
    .getByRole("button", { name: en.reading.question.next })
    .click();
  await choose(page, "TRUE");
}

async function finish(page: Page) {
  await (await askToFinish(page)).click();
  await expect(page).toHaveURL(/\/results\?attempt=/);
}

/** Rewrites the stored result records, as an earlier key revision would have left them. */
function rewriteRecords(
  page: Page,
  change: "scoreChanged" | "noteChanged" | "nothingChanged",
) {
  return page.evaluate(
    (kind) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("ielts-prep-reading");
        open.onsuccess = () => {
          const tx = open.result.transaction("results", "readwrite");
          const store = tx.objectStore("results");
          const all = store.getAll();
          all.onsuccess = () => {
            for (const record of all.result) {
              store.delete([
                record.attemptId,
                record.keyRevision,
                record.rulesVersion,
              ]);
              const earlier = {
                ...record,
                keyRevision: 9,
                checkedAt: record.checkedAt - 1000,
              };
              if (kind === "scoreChanged") {
                earlier.outcomes = { ...record.outcomes, 1: "incorrect" };
                earlier.score = { ...record.score, marks: 0 };
              }
              if (kind === "noteChanged")
                earlier.signals = {
                  ...record.signals,
                  "1": [{ code: "pinnedElsewhere" }],
                };
              store.put(earlier);
            }
          };
          tx.oncomplete = () => {
            open.result.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
        open.onerror = () => reject(open.error);
      }),
    change,
  );
}

test("finishing a Practice test opens its results: the score out of 40, the honest line, the counts and a review button that names what it opens", async ({
  page,
}) => {
  await startTest(page);
  await answerOneRightOneWrong(page);
  await finish(page);

  await expect(heading(page)).toHaveText(en.reading.results.title);
  await expect(heading(page)).toBeFocused();
  await expect(page.getByText(scoreText(1))).toBeVisible();
  await expect(page.getByText(en.reading.results.honest)).toBeVisible();
  await expect(page.getByText("Not correct: 1")).toBeVisible();
  await expect(page.getByText("No answer: 38")).toBeVisible();
  await expect(page.getByText(/Estimated band/)).toHaveCount(0);

  const review = page.getByRole("link", {
    name: en.reading.results.reviewMistakesAndUnanswered,
  });
  await expect(review).toHaveAttribute(
    "href",
    /\/en\/reading\/demo-academic-1\/review\?attempt=s-[0-9a-f-]+&set=mistakes$/,
  );
  await expect(
    page.getByRole("link", { name: en.reading.finished.again }),
  ).toHaveAttribute("href", `/en/reading/${TEST}`);

  // One record, for the current key revision and rules version.
  const records = await storedRecords(page, "results");
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ keyRevision: 1, rulesVersion: 1 });
});

test("finishing an Exam opens its results", async ({ page }) => {
  await startTest(page, "exam");
  await choose(page, "TRUE");
  await finish(page);
  await expect(heading(page)).toHaveText(en.reading.results.title);
  await expect(page.getByText(scoreText(1))).toBeVisible();
  await expect(
    page.getByText(new RegExp(`· ${en.reading.mode.exam}$`)),
  ).toBeVisible();
});

test("reloading, and opening the results in two pages at once, leave exactly one record", async ({
  page,
}) => {
  await startTest(page);
  await choose(page, "TRUE");
  await finish(page);
  await expect(page.getByText(scoreText(1))).toBeVisible();
  const url = page.url();

  const other = await page.context().newPage();
  await Promise.all([page.reload(), other.goto(url)]);
  await expect(page.getByText(scoreText(1))).toBeVisible();
  await expect(other.getByText(scoreText(1))).toBeVisible();
  expect(await storedRecords(page, "results")).toHaveLength(1);
});

for (const [change, notice] of [
  ["scoreChanged", fill(en.reading.results.rechecked, { score: 0, total: 40 })],
  ["noteChanged", en.reading.results.recheckedSameScore],
  ["nothingChanged", undefined],
] as const) {
  test(`a result checked with another key revision gets a new record, and the correction notice shows only a visible change (${change})`, async ({
    page,
  }) => {
    await startTest(page);
    await choose(page, "TRUE");
    await finish(page);
    await expect(page.getByText(scoreText(1))).toBeVisible();

    await rewriteRecords(page, change);
    await page.reload();
    await expect(page.getByText(scoreText(1))).toBeVisible();
    const records = await storedRecords(page, "results");
    expect(records.map((r) => r.keyRevision).sort()).toEqual([1, 9]);
    if (notice) await expect(page.getByText(notice)).toBeVisible();
    else
      await expect(page.getByText(/Rechecked after a correction/)).toHaveCount(
        0,
      );
  });
}

test("an M4 finished session on the device shows its results, with the note that it was checked later", async ({
  page,
}) => {
  await page.goto("/en");
  await page.evaluate(
    ([test, t0]) =>
      localStorage.setItem(
        `reading:${test}:finished`,
        JSON.stringify({
          schema: 1,
          session: {
            testId: test,
            testVersion: 1,
            mode: "exam",
            status: "finished",
            finishReason: "timeUp",
            startedAt: t0,
            finishedAt: t0 + 3_600_000,
            currentQuestion: 1,
            answers: { "1": "TRUE", "13": "winter weather" },
            flagged: [],
            highlights: ["p1-1-s1"],
            pins: {},
            view: { sheet: "partial", passage: 1, scroll: {} },
          },
        }),
      ),
    [TEST, T0] as const,
  );
  await page.goto(`/en/reading/${TEST}/results`);
  await expect(heading(page)).toContainText(en.reading.finished.timeUp);
  await expect(page.getByText(scoreText(2))).toBeVisible();
  await expect(page.getByText(en.reading.results.importedFromM4)).toBeVisible();
  const [attempt] = await storedRecords(page, "attempts");
  expect(attempt).toMatchObject({
    id: `m4-finished-${T0}`,
    highlights: ["p1-1-s1"],
  });
});

test("a finished session left uncommitted on the device is committed when the test opens, and its results replace the test screen", async ({
  page,
}) => {
  const sessionId = "s-00000000-0000-4000-8000-000000000001";
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
            answers: { "1": "TRUE" },
            flagged: [],
            highlights: [],
            pins: {},
            view: { sheet: "partial", passage: 1, scroll: {} },
          },
        }),
      ),
    [TEST, T0, sessionId] as const,
  );
  await openTest(page);
  await expect(page).toHaveURL(new RegExp(`/results\\?attempt=${sessionId}$`));
  await expect(page.getByText(scoreText(1))).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate((key) => localStorage.getItem(key), `reading:${TEST}`),
    )
    .toBeNull();
  expect(await storedRecords(page, "attempts")).toEqual([
    expect.objectContaining({ id: sessionId, answers: { "1": "TRUE" } }),
  ]);
});

test("without IndexedDB the results are shown with the notice, and the finished session stays on the device", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      value: undefined,
      configurable: true,
    });
  });
  await startTest(page);
  await choose(page, "TRUE");
  await finish(page);
  await expect(page.getByText(scoreText(1))).toBeVisible();
  await expect(
    page.getByText(en.reading.results.storageUnavailable),
  ).toBeVisible();
  const kept = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
    `reading:${TEST}`,
  );
  expect(kept?.session?.status).toBe("finished");
});

test("with nothing on this device, or an unknown attempt, the page says so and offers the test", async ({
  page,
}) => {
  for (const address of [
    `/en/reading/${TEST}/results`,
    `/en/reading/${TEST}/results?attempt=s-00000000-0000-4000-8000-000000000009`,
  ]) {
    await page.goto(address);
    await expect(heading(page)).toHaveText(en.reading.results.none.title);
    await expect(
      page.getByRole("link", { name: en.reading.results.none.start }),
    ).toHaveAttribute("href", `/en/reading/${TEST}`);
  }
});

test("the test page never carries the answer key or explanations; the results page has the key", async ({
  page,
}) => {
  // "the winter weather" is only in the answer key; "well within" only in an explanation.
  const bodies: string[] = [];
  page.on("response", async (response) => {
    const type = response.headers()["content-type"] ?? "";
    if (/javascript|html|x-component/.test(type))
      bodies.push(await response.text().catch(() => ""));
  });
  await openTest(page);
  await expect(
    page.getByRole("button", { name: en.reading.start }),
  ).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(bodies.length).toBeGreaterThan(0);
  expect(bodies.some((b) => b.includes("the winter weather"))).toBe(false);
  expect(bodies.some((b) => b.includes("well within"))).toBe(false);

  bodies.length = 0;
  await page.goto(`/en/reading/${TEST}/results`);
  await expect(heading(page)).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(bodies.some((b) => b.includes("the winter weather"))).toBe(true);
});

test.describe("at 320 px and at 200% zoom", () => {
  for (const locale of ["uz", "ru", "en"] as const) {
    test(`the results fit and pass axe in /${locale}`, async ({ page }) => {
      const m = catalogs[locale];
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(`/${locale}/reading/${TEST}`);
      await page.getByRole("button", { name: m.reading.start }).click();
      await page
        .locator("label")
        .filter({
          has: page.getByRole("radio", { name: "FALSE", exact: true }),
        })
        .click();
      await page
        .getByRole("button", { name: m.reading.navigator.open })
        .click();
      await page
        .getByRole("region", { name: m.reading.sheet.label })
        .getByRole("button", { name: m.reading.finish.button })
        .click();
      await page
        .getByRole("region", { name: m.reading.sheet.label })
        .getByRole("button", { name: m.reading.finish.confirm, exact: true })
        .click();
      await expect(heading(page)).toHaveText(m.reading.results.title);
      await expect(page.getByText(scoreText(0, locale))).toBeVisible();
      await expect(
        page.getByRole("link", {
          name: m.reading.results.reviewMistakesAndUnanswered,
        }),
      ).toBeVisible();
      await noOverflow(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);

      // 200% zoom of a 1280 × 800 window: 640 × 400 CSS pixels.
      await page.setViewportSize({ width: 640, height: 400 });
      await noOverflow(page);
    });
  }
});
