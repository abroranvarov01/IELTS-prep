import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import { catalogs, fill, noOverflow } from "./reading";

// Listening retries and repeated mistakes (M9-11): the first try's repeated
// mistake with its rough-rule label, a retry of only its questions with the
// rest of their groups locked, its own results, and the same retry resuming.

const TEST = "temporary-voa-1";
const ID = "s-00000000-0000-4000-8000-000000000131";
const T0 = 1_760_000_000_000;
const en = catalogs.en;
const desktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
const field = (page: Page, number: number) =>
  page.getByRole("textbox", {
    name: fill(en.reading.answer.label, { number }),
  });

/**
 * The first try, finished on the device: 1 correct; 2, 3 and 11 one letter
 * away (two question groups); 6 not correct; the rest unanswered: 1 of 40.
 */
async function firstTry(page: Page, locale = "en") {
  await page.goto(`/${locale}/practice`);
  await page.evaluate(
    ({ test, id, t0 }) => {
      localStorage.clear();
      localStorage.setItem(
        `listening:${test}`,
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
              "1": "bus",
              "2": "rivr",
              "3": "wheel",
              "6": "B",
              "11": "membrs",
            },
            flagged: [],
            view: { part: 1, scroll: {} },
            practice: { positions: {}, speed: 1 },
          },
        }),
      );
    },
    { test: TEST, id: ID, t0: T0 },
  );
  await page.goto(`/${locale}/listening/${TEST}/results`);
}

for (const locale of routing.locales) {
  const m = catalogs[locale];
  test(`the first try's repeated mistake is labelled as a rough rule, with its questions to practise, in /${locale}`, async ({
    page,
  }) => {
    await firstTry(page, locale);
    await expect(
      page.getByRole("heading", { name: m.reading.patterns.title }),
    ).toBeVisible();
    await expect(
      page.getByText(m.listening.patterns.heuristic, { exact: false }),
    ).toBeVisible();
    const card = page.getByRole("listitem").filter({
      has: page.getByRole("heading", {
        name: m.reading.patterns.oneLetterAway.title,
      }),
    });
    await expect(card).toContainText("2, 3, 11");
    await expect(
      card.getByRole("link", { name: m.reading.patterns.practise }),
    ).toHaveAttribute(
      "href",
      `/${locale}/listening/${TEST}/retry?of=${ID}&q=2,3,11`,
    );
    await noOverflow(page);
    expect((await axe(page)).violations).toEqual([]);
  });
}

test("the results offer every question not correct or unanswered once", async ({
  page,
}) => {
  await firstTry(page);
  await expect(page.getByText("1 of 40 correct")).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Try 39 questions again: not correct or no answer",
    }),
  ).toHaveAttribute(
    "href",
    new RegExp(`/en/listening/${TEST}/retry\\?of=${ID}&q=2,3,4,5,6,7,`),
  );
});

test("a retry shows only its questions, answers start empty, and its results are its own", async ({
  page,
}) => {
  await firstTry(page);
  await page.getByRole("link", { name: en.reading.patterns.practise }).click();
  await expect(page).toHaveURL(/\/retry\?of=/);

  await expect(page.getByText("1 of 3 to practise")).toBeVisible();
  await expect(field(page, 2)).toHaveValue("");
  await expect(field(page, 2)).toBeEnabled();
  // The rest of the group is there, locked; a group without retried questions is not.
  await expect(field(page, 1)).toBeDisabled();
  await expect(page.getByRole("radio")).toHaveCount(0);
  expect((await axe(page)).violations).toEqual([]);

  await field(page, 2).fill("river");
  await page.getByRole("button", { name: en.reading.question.next }).click();
  await expect(page.getByText("2 of 3 to practise")).toBeVisible();
  await field(page, 3).fill("wheels");
  await page.getByRole("button", { name: en.reading.question.next }).click();
  await expect(page.getByText("3 of 3 to practise")).toBeVisible();
  await expect(field(page, 11)).toBeFocused();
  await expect(
    page.getByRole("button", { name: en.reading.question.next }),
  ).toHaveCount(0);
  await field(page, 11).fill("members");

  if (!desktop(page))
    await expect(
      page.getByRole("button", { name: en.reading.finish.button }),
    ).toBeVisible();
  await page
    .getByRole("button", { name: en.reading.finish.button })
    .first()
    .click();
  await page
    .getByRole("button", { name: en.reading.finish.confirm, exact: true })
    .click();

  await expect(
    page.getByRole("heading", { level: 1, name: en.reading.retry.title }),
  ).toBeVisible();
  await expect(page.getByText("3 of 3 now correct")).toBeVisible();
  await expect(page.getByText(en.reading.retry.honest)).toBeVisible();
  await expect(page.getByText(/of 40/)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: en.reading.patterns.title }),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: /questions again/ })).toHaveCount(
    0,
  );

  await page
    .getByRole("link", { name: en.reading.retry.backToResults })
    .click();
  await expect(page.getByText("1 of 40 correct")).toBeVisible();
});

test("the same retry resumes; a different one replaces it; one the attempt got right can't start", async ({
  page,
}) => {
  await firstTry(page);
  await expect(page.getByText("1 of 40 correct")).toBeVisible();
  const address = `/en/listening/${TEST}/retry?of=${ID}&q=2`;
  await page.goto(address);
  await field(page, 2).fill("river");
  await page.goto(address);
  await expect(field(page, 2)).toHaveValue("river");

  await page.goto(`/en/listening/${TEST}/retry?of=${ID}&q=3`);
  await expect(field(page, 3)).toBeEnabled();
  await page.goto(address);
  await expect(field(page, 2)).toHaveValue("");

  await page.goto(`/en/listening/${TEST}/retry?of=${ID}&q=1`);
  await expect(
    page.getByRole("heading", { level: 1, name: en.reading.retry.unavailable }),
  ).toBeFocused();
  await expect(page.getByText(en.reading.retry.notAllowed)).toBeVisible();
});
