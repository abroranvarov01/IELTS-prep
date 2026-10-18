import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { createTranslator } from "next-intl";
import { routing } from "../src/shared/i18n/routing";
import { catalogs, fill, noOverflow } from "./reading";

// The Listening loop end to end (M9-13), in every interface language, on
// phones and desktop: practise, leave and reload, finish, review the
// mistakes, try them again, and come back to the results later; and two
// tabs of one session commit one attempt.

const TEST = "temporary-voa-1";
const desktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
const field = (page: Page, label: string, number: number) =>
  page.getByRole("textbox", { name: fill(label, { number }), exact: true });

/** "Finish test" (or a retry's) from the bottom bar or the phone's navigator, then "Finish". */
async function finish(page: Page, m: (typeof catalogs)["en"]) {
  if (desktop(page))
    await page
      .getByRole("navigation")
      .getByRole("button", { name: m.reading.finish.button })
      .click();
  else {
    await page
      .getByRole("button", { name: m.reading.navigator.open })
      .first()
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: m.reading.finish.button })
      .click();
  }
  await page
    .getByRole("button", { name: m.reading.finish.confirm, exact: true })
    .click();
}

for (const locale of routing.locales) {
  const m = catalogs[locale];
  const t = createTranslator({ locale, messages: m });
  test(`practise, reload, finish, review, try again and come back in /${locale}`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/practice`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page
      .getByRole("link", { name: /Temporary Listening Practice 1/ })
      .click();
    await page.getByRole("button", { name: m.reading.start }).click();

    // Answers survive a reload: 1 right, 2 wrong.
    await field(page, m.reading.answer.label, 1).fill("bus");
    await field(page, m.reading.answer.label, 2).fill("lake");
    await field(page, m.reading.answer.label, 2).blur();
    await page.reload();
    await expect(field(page, m.reading.answer.label, 1)).toHaveValue("bus");
    await expect(field(page, m.reading.answer.label, 2)).toHaveValue("lake");

    // Finish: the results, then the mistakes' review.
    await finish(page, m);
    await expect(
      page.getByText(fill(m.reading.results.score, { score: 1, total: 40 })),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: m.reading.results.reviewMistakesAndUnanswered,
      })
      .click();
    await expect(page.locator("#question-heading")).toContainText(
      fill(m.reading.question.of, { number: 2, total: 40 }),
    );
    await page.getByRole("button", { name: m.reading.question.next }).click();
    await expect(page.locator("#question-heading")).toContainText(
      fill(m.reading.question.of, { number: 3, total: 40 }),
    );
    await page
      .getByRole("link", { name: m.listening.review.toResults })
      .click();

    // Try the 39 questions not right again: its own results, never out of 40.
    await page
      .getByRole("link", { name: t("reading.results.tryAgain", { count: 39 }) })
      .click();
    await expect(
      page.getByText(t("reading.retry.progress", { current: 1, total: 39 })),
    ).toBeVisible();
    await expect(field(page, m.reading.answer.label, 2)).toHaveValue("");
    await expect(field(page, m.reading.answer.label, 1)).toBeDisabled();
    expect((await axe(page)).violations).toEqual([]);
    await field(page, m.reading.answer.label, 2).fill("river");
    await finish(page, m);
    await expect(
      page.getByRole("heading", { level: 1, name: m.reading.retry.title }),
    ).toBeVisible();
    await expect(
      page.getByText(t("reading.retry.score", { score: 1, total: 39 })),
    ).toBeVisible();
    await noOverflow(page);
    expect((await axe(page)).violations).toEqual([]);
    await page
      .getByRole("link", { name: m.reading.retry.backToResults })
      .click();
    await expect(
      page.getByText(fill(m.reading.results.score, { score: 1, total: 40 })),
    ).toBeVisible();

    // Coming back later: the test's start screen leads to its last results.
    await page.goto(`/${locale}/listening/${TEST}`);
    await page.getByRole("link", { name: m.reading.lastResults }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: m.reading.results.title }),
    ).toBeVisible();
    await expect(
      page.getByText(fill(m.reading.results.score, { score: 1, total: 40 })),
    ).toBeVisible();
  });
}

test("two tabs of one session finish it once: one attempt, one result", async ({
  page,
  context,
}) => {
  const en = catalogs.en;
  await page.goto(`/en/listening/${TEST}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: en.reading.start }).click();
  await field(page, en.reading.answer.label, 1).fill("bus");
  await field(page, en.reading.answer.label, 1).blur();

  const other = await context.newPage();
  await other.setViewportSize(page.viewportSize()!);
  await other.goto(`/en/listening/${TEST}`);
  await expect(field(other, en.reading.answer.label, 1)).toHaveValue("bus");

  await finish(page, en);
  await expect(
    page.getByText(fill(en.reading.results.score, { score: 1, total: 40 })),
  ).toBeVisible();
  // The stale tab finishes its copy of the same session.
  await finish(other, en);
  await expect(
    other.getByText(fill(en.reading.results.score, { score: 1, total: 40 })),
  ).toBeVisible();

  const attempts = await page.evaluate(
    () =>
      new Promise<unknown[]>((resolve) => {
        const open = indexedDB.open("ielts-prep-listening");
        open.onsuccess = () => {
          const req = open.result
            .transaction("attempts")
            .objectStore("attempts")
            .getAll();
          req.onsuccess = () => resolve(req.result);
        };
      }),
  );
  expect(attempts).toHaveLength(1);
});
