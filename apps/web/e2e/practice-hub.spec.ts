import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import { TEST, catalogs, fill, noOverflow, storedRecords } from "./reading";

// The Practice Hub (USER_FLOWS.md, Practice Hub (M6)): every shipped test with
// its state on this device, read without changing anything stored.

const en = catalogs.en;
const ID = "s-00000000-0000-4000-8000-000000000001";

function session(status: "inProgress" | "finished", mode = "practice") {
  return {
    schema: 1,
    session: {
      sessionId: ID,
      testId: TEST,
      testVersion: 1,
      mode,
      status,
      ...(status === "finished" && {
        finishReason: "user",
        finishedAt: 1760000600000,
      }),
      startedAt: 1760000000000,
      currentQuestion: 1,
      answers: { "1": "TRUE" },
      flagged: [],
      highlights: [],
      pins: {},
      view: { sheet: "partial", passage: 1, scroll: {} },
    },
  };
}

async function seed(page: Page, value: object) {
  await page.goto("/en");
  await page.evaluate(([key, json]) => localStorage.setItem(key, json), [
    `reading:${TEST}`,
    JSON.stringify(value),
  ] as const);
}

const row = (page: Page) =>
  page.getByRole("link", { name: /Demo Reading Test 1/ });

test("a test not started on this device, opened from the navigation", async ({
  page,
}) => {
  await page.goto("/en/practice");
  await expect(
    page.getByRole("heading", { level: 1, name: en.practice.title }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: en.practice.skill.reading }),
  ).toBeVisible();
  await expect(row(page)).toContainText(
    fill(en.practice.format, { passages: 3, questions: 40, minutes: 60 }),
  );
  await expect(row(page)).toContainText(en.practice.state.notStarted);
  await expect(
    page.getByRole("link", { name: en.nav.practice }).first(),
  ).toHaveAttribute("aria-current", "page");

  await row(page).click();
  await expect(page).toHaveURL(`/en/reading/${TEST}`);
  await expect(
    page.getByRole("button", { name: en.reading.start }),
  ).toBeVisible();
});

test("a test in progress shows its mode and resumes from the Hub", async ({
  page,
}) => {
  await seed(page, session("inProgress", "exam"));
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  await page.goto("/en/practice");
  await expect(row(page)).toContainText(
    fill(en.practice.state.inProgress, { mode: en.reading.mode.exam }),
  );
  // Visiting the Hub changes nothing stored.
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  await row(page).click();
  await expect(page.locator("#question-heading")).toBeVisible();
});

test("a finished test shows its last practice score and the way to its results", async ({
  page,
}) => {
  await seed(page, session("finished"));
  // The results page commits the attempt and stores its result.
  await page.goto(`/en/reading/${TEST}/results`);
  await expect(page.locator("#patterns-title")).toBeVisible();
  const attempts = await storedRecords(page, "attempts");
  const results = await storedRecords(page, "results");

  await page.goto("/en/practice");
  await expect(row(page)).toContainText(
    fill(en.practice.state.finished, { score: 1, total: 40 }),
  );
  await page.getByRole("link", { name: en.reading.lastResults }).click();
  await expect(page).toHaveURL(`/en/reading/${TEST}/results`);
  expect(await storedRecords(page, "attempts")).toEqual(attempts);
  expect(await storedRecords(page, "results")).toEqual(results);
});

test("says so when the device's progress can't be read, and the test still opens", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await page.goto("/en/practice");
  await expect(page.getByText(en.practice.storageUnavailable)).toBeVisible();
  await expect(row(page)).not.toContainText(en.practice.state.notStarted);
  await row(page).click();
  await expect(page).toHaveURL(`/en/reading/${TEST}`);
});

for (const locale of routing.locales)
  for (const width of [320, 1280])
    test(`fits ${width} px in /${locale} and has no WCAG 2.2 AA violations`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/en");
      await page.evaluate(([key, json]) => localStorage.setItem(key, json), [
        `reading:${TEST}`,
        JSON.stringify(session("inProgress")),
      ] as const);
      await page.goto(`/${locale}/practice`);
      await expect(row(page)).toContainText(
        fill(catalogs[locale].practice.state.inProgress, {
          mode: catalogs[locale].reading.mode.practice,
        }),
      );
      await noOverflow(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
