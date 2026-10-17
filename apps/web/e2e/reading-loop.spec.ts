import { expect, type Page, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import {
  type Locale,
  TEST,
  catalogs,
  fill,
  sentence,
  storedRecords,
} from "./reading";

// The Reading product loop as one flow (M5-11): practise, finish, see the
// results, understand mistakes in the review, try them again, and come back,
// with a reload at each step. Answering uses the phone layout (the desktop
// project narrows its window); on the desktop project the results, review and
// retry results are then seen at 1280 px, the desktop review layout.

const T0 = Date.UTC(2026, 9, 10, 9, 0);
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function ui(page: Page, locale: Locale) {
  const m = catalogs[locale].reading;
  const sheet = page.getByRole("region", { name: m.sheet.label, exact: true });
  // Client navigation keeps earlier pages mounted but hidden: only the
  // visible heading is the current one.
  const heading = page.locator("#question-heading:visible");
  return {
    m,
    sheet,
    heading,
    async goTo(number: number) {
      await page.getByRole("button", { name: m.navigator.open }).click();
      await sheet
        .getByRole("button", {
          name: new RegExp(
            `^${escape(fill(m.navigator.item, { number, states: "" }))}`,
          ),
        })
        .click();
      await expect(heading).toContainText(String(number));
    },
    async choose(role: "radio" | "checkbox", name: RegExp) {
      await page
        .locator("label")
        .filter({ has: page.getByRole(role, { name }) })
        .click();
    },
    async finish() {
      await page.getByRole("button", { name: m.navigator.open }).click();
      await sheet.getByRole("button", { name: m.finish.button }).click();
      await sheet
        .getByRole("button", { name: m.finish.confirm, exact: true })
        .click();
      await expect(page).toHaveURL(/\/results\?attempt=s-/);
    },
    score: (score: number, total = 40) =>
      fill(m.results.score, { score, total }),
  };
}

async function wide(page: Page, isDesktop: boolean, on: boolean) {
  if (isDesktop)
    await page.setViewportSize({ width: on ? 1280 : 1000, height: 800 });
}

for (const locale of routing.locales) {
  test(`in /${locale}: a Practice test, its results, the review of mistakes and unanswered questions, a retry and back`, async ({
    page,
  }, testInfo) => {
    const isDesktop = testInfo.project.name === "desktop";
    const u = ui(page, locale);
    const { m } = u;
    await wide(page, isDesktop, false);

    // Practise: 1 correct (TRUE), 3 not correct (FALSE; the key says NOT
    // GIVEN), 7 not correct (typed), 22–23 partly correct (A, B).
    await page.goto(`/${locale}/reading/${TEST}?mode=practice`);
    await page.getByRole("button", { name: m.start }).click();
    await u.choose("radio", /^TRUE$/);
    await u.goTo(3);
    await u.choose("radio", /^FALSE$/);
    await u.goTo(7);
    await u.sheet
      .getByRole("textbox", { name: fill(m.answer.label, { number: 7 }) })
      .fill("mobile");
    await page.reload();
    await u.goTo(22);
    await u.choose("checkbox", /^A /);
    await u.choose("checkbox", /^B /);
    await u.finish();
    const attemptId = new URL(page.url()).searchParams.get("attempt");

    // The results, also after a reload.
    await wide(page, isDesktop, true);
    for (const reload of [false, true]) {
      if (reload) await page.reload();
      await expect(page.getByText(u.score(2))).toBeVisible();
      await expect(page.getByText(m.results.honest)).toBeVisible();
    }

    // The review starts at the first card to review: 2, never answered.
    await page
      .getByRole("link", { name: m.results.reviewMistakesAndUnanswered })
      .click();
    await expect(u.heading).toContainText(m.review.unanswered);
    await expect(u.heading).toContainText(
      fill(m.question.of, { number: 2, total: 40 }),
    );
    await page.reload();
    await expect(u.sheet.getByText(m.review.noAnswerGiven)).toBeAttached();

    const card = async (q: number, set = "mistakes") => {
      await page.goto(
        `/${locale}/reading/${TEST}/review?attempt=${attemptId}&q=${q}&set=${set}`,
      );
      await expect(u.heading).toBeFocused();
    };
    // NOT GIVEN with related sentences, never as proof; Explain simpler.
    await card(3);
    await expect(
      u.sheet.getByRole("heading", { name: m.review.relatedTitle }),
    ).toBeAttached();
    await u.sheet.getByRole("button", { name: m.review.simpler }).click();
    await expect(u.sheet.getByText(m.review.simplerTitle)).toBeVisible();
    // 22–23: one card, partly correct.
    await card(23);
    await expect(u.heading).toContainText(
      fill(m.review.partly, { correct: 1, total: 2 }),
    );
    await expect(u.heading).toContainText(
      fill(m.question.range, { from: 22, to: 23 }),
    );
    // A typed answer, English test content in a localized card.
    await card(7);
    await expect(u.sheet.getByText("mobile", { exact: true })).toHaveAttribute(
      "lang",
      "en",
    );
    // A list question left unanswered, and a correct one.
    await card(14);
    await expect(u.sheet.getByText(m.review.correctAnswer)).toBeAttached();
    await card(1, "all");
    await expect(u.heading).toContainText(m.review.correct);
    await expect(page.locator("article")).toHaveAttribute("lang", "en");

    // Back to the results, then try the questions again.
    await page.getByRole("link", { name: m.review.toResults }).click();
    await expect(page.getByText(u.score(2))).toBeVisible();
    await wide(page, isDesktop, false);
    await page.locator('a[href*="/retry?of="]').click();
    await expect(page).toHaveURL(/\/retry\?of=/);
    await expect(u.heading).toContainText(
      fill(m.question.of, { number: 2, total: 40 }),
    );
    await page.reload();
    await u.choose("radio", /^FALSE$/);
    await u.finish();

    // The retry's results: out of its own 39 questions (all but 1, with
    // 22–23 whole), never out of 40.
    await wide(page, isDesktop, true);
    for (const reload of [false, true]) {
      if (reload) await page.reload();
      await expect(
        page.getByRole("heading", { level: 1, name: m.retry.title }),
      ).toBeVisible();
      await expect(
        page.getByText(fill(m.retry.score, { score: 1, total: 39 })),
      ).toBeVisible();
    }
    await page.getByRole("link", { name: m.retry.backToResults }).click();
    await expect(page.getByText(u.score(2))).toBeVisible();
  });
}

test("an Exam that ran out of time while away: its results, then the review of an unanswered question", async ({
  page,
}) => {
  const u = ui(page, "en");
  await page.goto("/en");
  await page.evaluate(
    ([test, id]) =>
      localStorage.setItem(
        `reading:${test}`,
        JSON.stringify({
          schema: 1,
          session: {
            sessionId: id,
            testId: test,
            testVersion: 1,
            mode: "exam",
            status: "inProgress",
            startedAt: Date.now() - 61 * 60_000,
            currentQuestion: 1,
            answers: { "1": "TRUE" },
            flagged: [],
            highlights: [],
            pins: {},
            view: { sheet: "partial", passage: 1, scroll: {} },
          },
        }),
      ),
    [TEST, "s-00000000-0000-4000-8000-000000000001"] as const,
  );
  await page.goto(`/en/reading/${TEST}`);
  await expect(page).toHaveURL(/\/results\?attempt=s-/);
  await page.reload();
  await expect(page.getByText(u.m.finished.timeUp)).toBeVisible();
  await expect(page.getByText(u.score(1))).toBeVisible();
  await page.getByRole("link", { name: u.m.results.reviewUnanswered }).click();
  await expect(u.heading).toContainText(u.m.review.unanswered);
  await expect(page.getByText(u.m.signals.timeUp)).toBeAttached();
});

test("M4 data on the device: the unfinished session resumes, the finished one is imported with its highlights and checked later, without repeated-mistake detection", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "desktop")
    await page.setViewportSize({ width: 1000, height: 800 });
  const { m } = ui(page, "en");
  await page.goto("/en");
  await page.evaluate(
    ([test, t0]) => {
      const session = (startedAt: number, extra: object) => ({
        schema: 1,
        session: {
          testId: test,
          testVersion: 1,
          mode: "practice",
          startedAt,
          currentQuestion: 1,
          flagged: [],
          pins: {},
          view: { sheet: "partial", passage: 1, scroll: {} },
          ...extra,
        },
      });
      localStorage.setItem(
        `reading:${test}:finished`,
        JSON.stringify(
          session(t0, {
            status: "finished",
            finishReason: "user",
            finishedAt: t0 + 600_000,
            answers: { "2": "NOT GIVEN", "4": "NOT GIVEN", "28": "NOT GIVEN" },
            highlights: ["p1-1-s1"],
          }),
        ),
      );
      localStorage.setItem(
        `reading:${test}`,
        JSON.stringify(
          session(t0 + 3_600_000, {
            status: "inProgress",
            answers: { "1": "TRUE" },
            highlights: [],
          }),
        ),
      );
    },
    [TEST, T0] as const,
  );

  await page.goto(`/en/reading/${TEST}`);
  await expect(page.locator("#question-heading")).toBeVisible();
  await expect(page.getByRole("radio", { name: "TRUE" })).toBeChecked();

  await page.goto(`/en/reading/${TEST}/results?attempt=m4-finished-${T0}`);
  await expect(page.getByText(m.results.importedFromM4)).toBeVisible();
  await expect(page.getByText(m.patterns.unknownFirstTry)).toBeVisible();
  await page.goto(
    `/en/reading/${TEST}/review?attempt=m4-finished-${T0}&q=1&set=all`,
  );
  await expect(sentence(page, "p1-1-s1").locator("mark")).toBeVisible();
});

test("two pages of one test: finished in one, answered differently and finished in the other; both show the first committed attempt", async ({
  page: tabA,
}, testInfo) => {
  if (testInfo.project.name === "desktop")
    await tabA.setViewportSize({ width: 1000, height: 800 });
  const u = ui(tabA, "en");
  await tabA.goto(`/en/reading/${TEST}?mode=practice`);
  await tabA.getByRole("button", { name: u.m.start }).click();
  await u.choose("radio", /^TRUE$/);

  const tabB = await tabA.context().newPage();
  await tabB.setViewportSize(
    tabA.viewportSize() ?? { width: 360, height: 800 },
  );
  const b = ui(tabB, "en");
  await tabB.goto(`/en/reading/${TEST}`);
  await expect(tabB.getByRole("radio", { name: "TRUE" })).toBeChecked();

  await u.finish();
  await expect(tabA.getByText(u.score(1))).toBeVisible();

  await b.choose("radio", /^FALSE$/);
  await b.goTo(2);
  await b.choose("radio", /^FALSE$/);
  await b.finish();
  await expect(tabB.getByText(b.score(1))).toBeVisible();
  await tabA.reload();
  await expect(tabA.getByText(u.score(1))).toBeVisible();

  const attempts = await storedRecords(tabA, "attempts");
  expect(attempts).toHaveLength(1);
  expect(attempts[0]?.answers).toEqual({ "1": "TRUE" });
  expect(await storedRecords(tabA, "firstTry")).toEqual([
    { schema: 1, testId: TEST, firstTry: attempts[0]?.id },
  ]);
  expect(await storedRecords(tabA, "results")).toHaveLength(1);
});
