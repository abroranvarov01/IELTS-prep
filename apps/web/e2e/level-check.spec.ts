import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/shared/i18n/routing";
import { saveGoal } from "./goal";
import { choose } from "./reading";

// The level check (USER_FLOWS.md, Level check flows (M7)): the intro, the
// Reading section on the form, leaving and resuming. Finishing and the result
// are covered with the result page (M7-10, M7-11).

const catalogs = { uz, ru, en };
const FORM = "level-check-reading-a";

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));

// The section tests use the question sheet; the desktop project runs them
// below the desktop breakpoint, as reading.spec.ts does.
test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop")
    await page.setViewportSize({ width: 1000, height: 800 });
});

const trueOf1 = (page: Page) => page.getByRole("radio", { name: "TRUE" });

async function startCheck(page: Page, locale: keyof typeof catalogs = "en") {
  const messages = catalogs[locale];
  await page.goto(`/${locale}/level-check`);
  await page
    .getByRole("button", { name: messages.levelCheck.intro.start })
    .click();
  await expect(page).toHaveURL(/\/level-check\/reading\?start=\d+$/);
  await expect(page.locator("#question-heading:visible")).toHaveText(
    fill(messages.reading.question.of, { number: 1, total: 14 }),
  );
}

for (const locale of routing.locales) {
  const messages = catalogs[locale];

  test.describe(`level check in /${locale}`, () => {
    test("home's next action leads to the intro, which says what the check is and is not", async ({
      page,
      context,
      baseURL,
    }) => {
      await saveGoal(context, baseURL, "v1|general|6.5");
      await page.goto(`/${locale}`);
      await page.getByRole("link", { name: messages.levelCheck.start }).click();

      await expect(page).toHaveURL(`/${locale}/level-check`);
      await expect(page).toHaveTitle(messages.levelCheck.title);
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: messages.levelCheck.title,
        }),
      ).toBeVisible();
      await expect(
        page.getByText(
          fill(messages.levelCheck.intro.covers, {
            passages: 2,
            questions: 14,
          }),
        ),
      ).toBeVisible();
      await expect(
        page.getByText(messages.levelCheck.intro.honest),
      ).toBeVisible();
      // A General Training goal gets the Academic-style line.
      await expect(
        page.getByText(messages.levelCheck.intro.academicNote),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: messages.levelCheck.intro.start }),
      ).toBeVisible();
      await page
        .getByRole("link", { name: messages.onboarding.notNow })
        .click();
      await expect(page).toHaveURL(`/${locale}`);
    });

    test("has no WCAG 2.2 AA violations", async ({ page }) => {
      await page.goto(`/${locale}/level-check`);
      await expect(
        page.getByRole("button", { name: messages.levelCheck.intro.start }),
      ).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    for (const width of [320, 360]) {
      test(`fits ${width} px without horizontal scroll or truncation`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/${locale}/level-check`);
        await expect(
          page.getByRole("button", { name: messages.levelCheck.intro.start }),
        ).toBeVisible();
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
        const clipped = await page
          .getByRole("main")
          .locator("h1, p, li, a, button")
          .evaluateAll((elements) =>
            elements
              .filter((element) => element.scrollWidth > element.clientWidth)
              .map((element) => element.textContent),
          );
        expect(clipped).toEqual([]);
      });
    }
  });
}

test("the onboarding invitation's button leads to the intro", async ({
  page,
}) => {
  await page.goto("/ru/start/level-check");
  await page.getByRole("link", { name: ru.levelCheck.start }).click();
  await expect(page).toHaveURL("/ru/level-check");
  await expect(
    page.getByRole("heading", { level: 1, name: ru.levelCheck.title }),
  ).toBeVisible();
});

test("the section is the Reading screen without a timer, flag, pins or evidence, with the form's 14 questions", async ({
  page,
}) => {
  await startCheck(page);
  await expect(page.getByText(/\d+:\d\d/)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: en.reading.flag.add }),
  ).toHaveCount(0);
  await expect(
    page.getByText(fill(en.reading.passageOf, { number: 1, total: 2 })),
  ).toBeVisible();
  await choose(page, "TRUE");
  await expect(page.getByText(en.reading.evidence.title)).toHaveCount(0);
  // The last question offers "Finish", not "Finish test".
  await page.getByRole("button", { name: en.reading.navigator.open }).click();
  await expect(
    page.getByRole("button", {
      name: en.levelCheck.finish.button,
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: en.reading.finish.button }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: fill(en.reading.navigator.item, {
        number: 14,
        states: en.reading.navigator.unanswered,
      }),
    })
    .click();
  await expect(page.locator("#question-heading:visible")).toHaveText(
    fill(en.reading.question.of, { number: 14, total: 14 }),
  );
});

test("leaving keeps the answers on the device; Home and the intro offer to continue, and the section resumes where it stopped", async ({
  page,
  context,
  baseURL,
}) => {
  await saveGoal(context, baseURL);
  await startCheck(page);
  await choose(page, "TRUE");
  await page.getByRole("button", { name: en.reading.question.next }).click();
  await expect(page.locator("#question-heading:visible")).toHaveText(
    fill(en.reading.question.of, { number: 2, total: 14 }),
  );
  await page.getByRole("link", { name: en.reading.exit }).click();
  await expect(page).toHaveURL("/en");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), `reading:${FORM}`),
  ).toContain('"TRUE"');

  // Home's card continues the check; the intro's in-progress form too.
  await expect(
    page.getByRole("heading", { level: 2, name: en.levelCheck.resume.title }),
  ).toBeVisible();
  await page.getByRole("link", { name: en.levelCheck.resume.continue }).click();
  await expect(page).toHaveURL("/en/level-check");
  await expect(
    page.getByRole("heading", { level: 1, name: en.levelCheck.resume.title }),
  ).toBeVisible();
  await expect(
    page.getByText(fill(en.levelCheck.resume.body, { answered: 1, total: 14 })),
  ).toBeVisible();
  await page
    .getByRole("button", { name: en.levelCheck.resume.continue })
    .click();
  await expect(page).toHaveURL(/\/en\/level-check\/reading\?resume=\d+$/);
  await expect(page.locator("#question-heading:visible")).toHaveText(
    fill(en.reading.question.of, { number: 2, total: 14 }),
  );

  // Onboarding step 3 says the same while the check is in progress.
  await page.goto("/en/start/level-check");
  await expect(
    page.getByRole("heading", { level: 1, name: en.levelCheck.resume.title }),
  ).toBeVisible();
});

test("'Start over' discards the answers and starts from question 1", async ({
  page,
}) => {
  await startCheck(page);
  await choose(page, "TRUE");
  await page.getByRole("button", { name: en.reading.question.next }).click();
  await page.getByRole("link", { name: en.reading.exit }).click();
  await page.goto("/en/level-check");
  await page
    .getByRole("button", { name: en.levelCheck.resume.startOver })
    .click();
  await expect(page).toHaveURL(/\/en\/level-check\/reading\?start=\d+$/);
  await expect(page.locator("#question-heading:visible")).toHaveText(
    fill(en.reading.question.of, { number: 1, total: 14 }),
  );
  await expect(trueOf1(page)).not.toBeChecked();
});

test("the section opened with nothing in progress goes to the intro", async ({
  page,
}) => {
  await page.goto("/en/level-check/reading");
  await expect(page).toHaveURL("/en/level-check");
});

test("the Reading history stays empty after a level-check session is kept on the device", async ({
  page,
}) => {
  await startCheck(page);
  await page.goto("/en/practice");
  await expect(
    page.getByRole("link", { name: /Demo Reading Test 1/ }),
  ).toContainText(en.practice.state.notStarted);
  await expect(page.getByRole("link", { name: /Level check/ })).toHaveCount(0);
});

// --- The result (M7-10) -----------------------------------------------------

const KEY: Record<number, string> = {
  1: "TRUE",
  2: "NOT GIVEN",
  3: "TRUE",
  4: "FALSE",
  5: "appliance",
  6: "power",
  7: "wind",
  8: "ii",
  9: "iv",
  10: "i",
  11: "iii",
  12: "B",
  13: "C",
  14: "B",
};

/** A section in progress with the first `correct` answers right, kept on the device as the engine keeps it. */
async function seedSection(page: Page, correct: number) {
  await page.goto("/en");
  const answers: Record<string, string> = {};
  for (let n = 1; n <= correct; n++) answers[String(n)] = KEY[n] ?? "";
  await page.evaluate(([key, json]) => localStorage.setItem(key, json), [
    `reading:${FORM}`,
    JSON.stringify({
      schema: 1,
      session: {
        sessionId: "s-00000000-0000-4000-8000-00000000c0de",
        testId: FORM,
        testVersion: 1,
        mode: "practice",
        status: "inProgress",
        startedAt: Date.now() - 600_000,
        currentQuestion: 14,
        answers,
        flagged: [],
        highlights: [],
        pins: {},
        view: { sheet: "partial", passage: 2, scroll: {} },
      },
    }),
  ] as const);
}

async function finishSection(page: Page) {
  await page.goto("/en/level-check/reading");
  await expect(page.locator("#question-heading:visible")).toBeVisible();
  await page.getByRole("button", { name: en.reading.navigator.open }).click();
  await page
    .getByRole("button", { name: en.levelCheck.finish.button, exact: true })
    .click();
  await page
    .getByRole("button", { name: en.reading.finish.confirm, exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/level-check\/result\?attempt=/);
}

test("finishing shows the starting point on our scale, the score, the honest lines and what to practise first; Home moves on to practice", async ({
  page,
  context,
  baseURL,
}) => {
  await saveGoal(context, baseURL, "v1|general|6.5");
  await seedSection(page, 11);
  await finishSection(page);
  await expect(
    page.getByRole("heading", { level: 1, name: en.levelCheck.result.title }),
  ).toBeFocused();
  await expect(page.getByText(en.levelCheck.levels[3])).toBeVisible();
  await expect(
    page.getByText(fill(en.reading.results.score, { score: 11, total: 14 })),
  ).toBeVisible();
  await expect(
    page.getByText(fill(en.levelCheck.result.scope, { questions: 14 })),
  ).toBeVisible();
  await expect(page.getByText(en.levelCheck.result.honest)).toBeVisible();
  await expect(page.getByText(en.levelCheck.intro.academicNote)).toBeVisible();
  // Multiple choice: 3 of 3 not correct, the only type to practise first.
  await expect(
    page
      .getByText(en.levelCheck.result.practiseFirst)
      .filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page
      .getByText("multiple choice", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  // The only "band" on the page is the honest line saying it is not one.
  await expect(page.getByText(/band/i).filter({ visible: true })).toHaveCount(
    1,
  );
  await expect(page.getByText(/\d\.\d/)).toHaveCount(0);

  // The stored record carries the level and the versions, never a band.
  const records = await page.evaluate(
    () =>
      new Promise<Record<string, unknown>[]>((resolve) => {
        const open = indexedDB.open("ielts-prep-level-check");
        open.onsuccess = () => {
          const req = open.result
            .transaction("results")
            .objectStore("results")
            .getAll();
          req.onsuccess = () =>
            resolve(req.result as Record<string, unknown>[]);
        };
      }),
  );
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({
    level: 3,
    score: 11,
    total: 14,
    keyRevision: 1,
    rulesVersion: 1,
    levelRulesVersion: 1,
    practiseFirst: ["multipleChoice"],
  });

  await page.getByRole("link", { name: en.levelCheck.result.practise }).click();
  await expect(page).toHaveURL("/en/practice");

  await page.goto("/en");
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: en.levelCheck.result.practise,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: en.home.nextAction.seeStartingPoint }),
  ).toHaveAttribute("href", "/en/level-check/result");
  await page.goto("/en/start/level-check");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: en.levelCheck.result.practise,
    }),
  ).toBeVisible();
});

test("with more than half unanswered there is no starting point, only the way to take it again", async ({
  page,
}) => {
  await seedSection(page, 5);
  await finishSection(page);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: en.levelCheck.result.insufficient.title,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      fill(en.levelCheck.result.insufficient.answered, {
        answered: 5,
        total: 14,
      }),
    ),
  ).toBeVisible();
  await expect(page.getByText(en.levelCheck.result.practiseFirst)).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("link", { name: en.levelCheck.retake.start }),
  ).toHaveAttribute("href", "/en/level-check");
});

test("'See your answers' opens the review of the check's attempt, and the result can be reopened later", async ({
  page,
}) => {
  await seedSection(page, 9);
  await finishSection(page);
  await page
    .getByRole("link", { name: en.levelCheck.result.seeAnswers })
    .click();
  await expect(page).toHaveURL(/\/en\/level-check\/review\?attempt=/);
  await expect(page.locator("#question-heading:visible")).toBeVisible();
  await expect(
    page.getByText(en.reading.review.correctAnswer).first(),
  ).toBeVisible();
  await page.getByRole("link", { name: en.levelCheck.result.title }).click();
  await expect(page).toHaveURL(/\/en\/level-check\/result/);
  await expect(page.getByText(en.levelCheck.levels[2])).toBeVisible();

  // The intro now offers to take it again, naming the starting point.
  await page.goto("/en/level-check");
  await expect(
    page.getByRole("button", { name: en.levelCheck.retake.start }),
  ).toBeVisible();
  await expect(
    page.getByText(en.levelCheck.retake.sameQuestions),
  ).toBeVisible();
  await expect(page.getByText(/On the way/)).toBeVisible();
});

test("the result page with nothing finished on this device says so", async ({
  page,
}) => {
  await page.goto("/en/level-check/result");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: en.levelCheck.result.none.title,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: en.levelCheck.title }).click();
  await expect(page).toHaveURL("/en/level-check");
});

for (const locale of routing.locales)
  test(`the result fits 320 px in /${locale} and has no WCAG 2.2 AA violations`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await seedSection(page, 9);
    await finishSection(page);
    await page.goto(`/${locale}/level-check/result`);
    await expect(
      page.getByText(catalogs[locale].levelCheck.levels[2]),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
