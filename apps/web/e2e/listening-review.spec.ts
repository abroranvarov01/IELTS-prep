import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import { catalogs, fill, noOverflow } from "./reading";

// The evidence-first Listening review on phones (M9-09): from the results
// into the first card, where the answer is heard, the excerpt and the whole
// part's transcript, Next, the navigator and "Explain simpler"; and without
// a network or a cached copy, the text stays usable and says the audio is
// not available.

const TEST = "temporary-voa-1";
const ID = "s-00000000-0000-4000-8000-000000000125";
const T0 = 1_760_000_000_000;
const desktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

const finished = {
  schema: 1,
  session: {
    sessionId: ID,
    testId: TEST,
    testVersion: 1,
    mode: "practice",
    status: "finished",
    finishReason: "user",
    startedAt: T0,
    finishedAt: T0 + 120_000,
    currentQuestion: 2,
    answers: { "1": "bus", "2": "lake", "6": "B" },
    flagged: [],
    view: { part: 1, scroll: {} },
    practice: { positions: {}, speed: 1 },
  },
};

/** "Play from Part 1, …": the time is in words with ICU plurals, so any text stands for it. */
function playFromName(m: (typeof catalogs)["en"], part: number): RegExp {
  const [before = "", after = ""] = fill(m.listening.review.playFromName, {
    part,
    time: "\u0000",
  }).split("\u0000");
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escape(before)}.+${escape(after)}$`);
}

async function seed(page: Page, locale: string) {
  await page.goto(`/${locale}/practice`);
  await page.evaluate(
    ({ test, value }) => {
      localStorage.clear();
      localStorage.setItem(`listening:${test}:finished`, value);
    },
    { test: TEST, value: JSON.stringify(finished) },
  );
}

for (const locale of routing.locales) {
  const m = catalogs[locale];
  test(`a phone review walks the mistakes with their evidence in /${locale}`, async ({
    page,
  }) => {
    test.skip(desktop(page), "the desktop review is M9-10's");
    await seed(page, locale);
    await page.goto(`/${locale}/listening/${TEST}/results`);
    await page
      .getByRole("link", {
        name: m.reading.results.reviewMistakesAndUnanswered,
      })
      .click();

    // The first card that is not fully correct: question 2 ("lake").
    const heading = page.getByRole("heading", { level: 2 }).first();
    await expect(heading).toContainText(
      fill(m.reading.question.of, { number: 2, total: 40 }),
    );
    await expect(heading).toBeFocused();
    await expect(
      page.getByText(
        fill(m.listening.review.heardAt, { part: 1, time: "0:51" }),
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: playFromName(m, 1) }),
    ).toBeVisible();
    await expect(page.locator("mark").first()).toHaveText(
      "goes along the river in a boat",
    );

    // The whole part's transcript, then "Explain simpler".
    await page
      .getByRole("button", {
        name: fill(m.listening.review.transcriptShow, { part: 1 }),
      })
      .press("Enter");
    await expect(
      page.getByRole("region", {
        name: fill(m.listening.review.transcriptTitle, { part: 1 }),
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: m.reading.review.simpler })
      .press("Enter");
    await expect(page.getByText(m.reading.review.simplerTitle)).toBeVisible();
    await noOverflow(page);
    // At the top, so no row sits under the sticky bars while axe measures targets.
    await page.evaluate(() => window.scrollTo(0, 0));
    expect((await axe(page)).violations).toEqual([]);

    // Next: the next card that is not fully correct.
    await page.getByRole("button", { name: m.reading.question.next }).click();
    await expect(page.getByRole("heading", { level: 2 }).first()).toContainText(
      fill(m.reading.question.of, { number: 3, total: 40 }),
    );
    await expect(page).toHaveURL(/q=3/);

    // The navigator by part; Escape closes it.
    await page.getByRole("button", { name: m.reading.navigator.open }).click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByText(
        fill(m.listening.navigator.partResult, {
          number: 1,
          correct: 1,
          total: 10,
        }),
      ),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
}

test("without a network or a cached copy, the review stays readable and says the audio is not available", async ({
  page,
}) => {
  test.skip(desktop(page), "the desktop review is M9-10's");
  await seed(page, "en");
  const en = catalogs.en;
  // The device reports no network from the start; nothing is cached.
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "onLine", { get: () => false }),
  );
  await page.goto(`/en/listening/${TEST}/review?attempt=${ID}&q=6&set=all`);
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await expect(
    page.getByText(en.listening.review.audioUnavailable).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: playFromName(en, 1) }),
  ).toBeDisabled();
  await expect(page.locator("mark").first()).toHaveText(
    "the Washington Monument is on the left",
  );
  await expect(
    page.getByRole("button", { name: en.listening.player.play, exact: true }),
  ).toHaveCount(0);
});

for (const locale of routing.locales) {
  const m = catalogs[locale];
  test(`the desktop review shows the part's transcript beside the card in /${locale}`, async ({
    page,
  }) => {
    test.skip(!desktop(page), "the phone review is tested above");
    await seed(page, locale);
    await page.goto(
      `/${locale}/listening/${TEST}/review?attempt=${ID}&q=2&set=mistakes`,
    );
    const column = page.getByRole("region", {
      name: fill(m.listening.review.transcriptTitle, { part: 1 }),
    });
    await expect(column.locator("mark")).toHaveText(
      "goes along the river in a boat",
    );
    await expect(column.locator("mark")).toBeInViewport();
    // The card does not repeat the excerpt; the transcript is the column.
    await expect(page.getByRole("main").locator("mark")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: playFromName(m, 1) }),
    ).toBeVisible();

    // The bar: the part's cells with their outcomes, the other parts by count.
    const bar = page.getByRole("navigation", {
      name: m.reading.navigator.open,
    });
    await bar
      .getByRole("button", {
        name: fill(m.listening.navigator.partResult, {
          number: 4,
          correct: 0,
          total: 10,
        }),
      })
      .click();
    await expect(page).toHaveURL(/q=31/);
    await expect(
      page.getByRole("region", {
        name: fill(m.listening.review.transcriptTitle, { part: 4 }),
      }),
    ).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    expect((await axe(page)).violations).toEqual([]);
  });
}
