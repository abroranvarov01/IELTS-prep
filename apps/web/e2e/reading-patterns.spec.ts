import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { TEST, catalogs, noOverflow } from "./reading";

// "Mistakes that repeated" on a test attempt's results (READING_EXPERIENCE.md,
// Error Intelligence (M5)), from seeded attempts on the device.

const en = catalogs.en;
const T0 = Date.UTC(2026, 9, 10, 9, 0);
const sessionId = (n: number) => `s-00000000-0000-4000-8000-00000000000${n}`;
// NOT GIVEN for FALSE in 2 and 4 (one group) and for NO in 28 (another).
const NG_FALSE = { "2": "NOT GIVEN", "4": "NOT GIVEN", "28": "NOT GIVEN" };

/** Leaves a finished session on the device; its results page commits it. */
async function finished(
  page: Page,
  n: number,
  answers: Record<string, string>,
  slot: "current" | "m4" = "current",
) {
  await page.evaluate(
    ([test, t0, id, answers, slot]) =>
      localStorage.setItem(
        slot === "m4" ? `reading:${test}:finished` : `reading:${test}`,
        JSON.stringify({
          schema: 1,
          session: {
            ...(slot === "current" && { sessionId: id }),
            testId: test,
            testVersion: 1,
            mode: "practice",
            status: "finished",
            finishReason: "user",
            startedAt: t0,
            finishedAt: t0 + 600_000,
            currentQuestion: 1,
            answers,
            flagged: [],
            highlights: [],
            pins: {},
            view: { sheet: "partial", passage: 1, scroll: {} },
          },
        }),
      ),
    [TEST, T0 + n * 1_000_000, sessionId(n), answers, slot] as const,
  );
}

async function results(page: Page, n?: number) {
  await page.goto(
    `/en/reading/${TEST}/results${n ? `?attempt=${sessionId(n)}` : ""}`,
  );
  await expect(
    page.getByRole("heading", { level: 2, name: en.reading.patterns.title }),
  ).toBeVisible();
}

const card = (page: Page) =>
  page.getByRole("listitem").filter({ hasText: "mixed up with" });

test.beforeEach(async ({ page }) => {
  await page.goto("/en");
});

test("a category in 3 questions of 2 groups shows its card, which practises those questions again", async ({
  page,
}) => {
  await finished(page, 1, NG_FALSE);
  await results(page);
  await expect(page.getByText(en.reading.patterns.scopeThisTry)).toBeVisible();
  await expect(card(page)).toHaveCount(1);
  await expect(card(page)).toContainText(
    "3 of 3 questions whose answer was NOT GIVEN, FALSE or NO (questions 2, 4, 28)",
  );
  await expect(card(page).locator('[lang="en"]').first()).toHaveText(
    "NOT GIVEN",
  );
  await noOverflow(page);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(axe.violations).toEqual([]);

  await card(page)
    .getByRole("link", { name: en.reading.patterns.practise })
    .click();
  await expect(page.getByText("1 of 3 to practise")).toBeVisible();
});

test("too few questions show the not-enough-evidence text, without a card", async ({
  page,
}) => {
  await finished(page, 1, { "2": "NOT GIVEN", "28": "NOT GIVEN" });
  await results(page);
  await expect(page.getByText(en.reading.patterns.noneThisTry)).toBeVisible();
  await expect(card(page)).toHaveCount(0);
});

test("a later attempt shows the first attempt's repeated mistakes, scoped to it", async ({
  page,
}) => {
  await finished(page, 1, NG_FALSE);
  await results(page);
  await finished(page, 2, { "1": "TRUE" });
  await results(page, 2);
  await expect(page.getByText(en.reading.patterns.scopeFirstTry)).toBeVisible();
  await expect(card(page)).toHaveCount(1);
  await expect(
    card(page).getByRole("link", { name: en.reading.patterns.practise }),
  ).toHaveAttribute("href", new RegExp(`of=${sessionId(1)}&q=2,4,28$`));
});

test("with an M4 attempt on the device the first try is unknown, and nothing is looked for", async ({
  page,
}) => {
  await finished(page, 1, { "1": "TRUE" }, "m4");
  await finished(page, 2, NG_FALSE);
  await results(page, 2);
  await expect(
    page.getByText(en.reading.patterns.unknownFirstTry),
  ).toBeVisible();
  await expect(card(page)).toHaveCount(0);
});
