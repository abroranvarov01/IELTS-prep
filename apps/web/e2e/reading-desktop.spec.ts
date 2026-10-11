import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { createTranslator } from "next-intl";
import en from "../messages/en.json";
import {
  type Locale,
  TEST,
  actions,
  catalogs,
  fill,
  noOverflow,
  sentence,
} from "./reading";

// The desktop layout, from the approved 64rem breakpoint (READING_EXPERIENCE.md,
// desktop layout), in the desktop project only (playwright.config.ts). The
// phone and tablet layout is covered by reading.spec.ts.

const column = (page: Page, locale: Locale = "en") =>
  page.getByRole("region", {
    name: catalogs[locale].reading.sheet.label,
    exact: true,
  });
const navigatorBar = (page: Page, locale: Locale = "en") =>
  page.getByRole("region", { name: catalogs[locale].reading.navigator.open });
const currentHeading = (page: Page) => page.locator("#question-heading");
const question = (page: Page, number: number) =>
  column(page).locator(`[data-question="${number}"]`);
const cell = (page: Page, number: number) =>
  navigatorBar(page).getByRole("button", {
    name: new RegExp(
      `^${fill(en.reading.navigator.item, { number, states: "" })}`,
    ),
  });
const heading = (number: number) =>
  fill(en.reading.question.of, { number, total: 40 });

async function start(page: Page, locale: Locale = "en", mode = "practice") {
  await page.goto(`/${locale}/reading/${TEST}?mode=${mode}`);
  await page
    .getByRole("button", { name: catalogs[locale].reading.start })
    .click();
  await expect(currentHeading(page)).toHaveText(
    fill(catalogs[locale].reading.question.of, { number: 1, total: 40 }),
  );
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test("from 1024 px the passage and the questions sit side by side and scroll on their own; below it the sheet returns", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await start(page);
  const main = await page.getByRole("main").boundingBox();
  const questions = await column(page).boundingBox();
  expect(main && questions).toBeTruthy();
  if (!main || !questions) return;
  expect(questions.x).toBeGreaterThanOrEqual(main.x + main.width - 1);
  expect(Math.round((main.width / (main.width + questions.width)) * 100)).toBe(
    55,
  );
  await expect(
    page.getByRole("button", { name: en.reading.sheet.hide }),
  ).toHaveCount(0);

  await column(page).evaluate((e) => e.scrollTo(0, 600));
  expect(await page.getByRole("main").evaluate((e) => e.scrollTop)).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    ),
  ).toBe(0);

  await page.setViewportSize({ width: 1023, height: 800 });
  await expect(
    page.getByRole("button", { name: en.reading.sheet.hide }),
  ).toBeVisible();
});

test("after the layout changes between phone and desktop, the passage still answers taps and arrow keys", async ({
  page,
}) => {
  await start(page);
  for (const width of [1023, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await sentence(page, "p1-1-s1").click();
    await expect(actions(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(actions(page)).toHaveCount(0);
    await expect(sentence(page, "p1-1-s1")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(sentence(page, "p1-1-s2")).toBeFocused();
  }
});

test("the column shows the passage's questions; Next, the cells and another passage move the current question into view", async ({
  page,
}) => {
  await start(page);
  await expect(column(page).getByRole("heading", { level: 3 })).toHaveCount(13);

  await navigatorBar(page)
    .getByRole("button", { name: en.reading.question.next })
    .click();
  await expect(currentHeading(page)).toHaveText(heading(2));
  await expect(currentHeading(page)).toBeFocused();

  await cell(page, 12).click();
  await expect(currentHeading(page)).toHaveText(heading(12));
  await expect(currentHeading(page)).toBeFocused();
  await expect(currentHeading(page)).toBeInViewport();

  await navigatorBar(page)
    .getByRole("button", {
      name: fill(en.reading.navigator.passageProgress, {
        number: 2,
        answered: 0,
        total: 14,
      }),
    })
    .click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "How Rooftop Gardens Change a Building",
    }),
  ).toBeVisible();
  await expect(currentHeading(page)).toHaveText(heading(14));
  await expect(currentHeading(page)).toBeFocused();
  await expect(
    page.getByText(fill(en.reading.passageOf, { number: 2, total: 3 })),
  ).toBeVisible();
});

test("working in a question makes it current, and Mark for review in the bar marks that question", async ({
  page,
}) => {
  await start(page);
  await question(page, 3)
    .locator("label")
    .filter({ has: page.getByRole("radio", { name: "FALSE" }) })
    .click();
  await expect(cell(page, 3)).toHaveAccessibleName(
    fill(en.reading.navigator.item, {
      number: 3,
      states: [
        en.reading.navigator.answered,
        en.reading.navigator.current,
      ].join(", "),
    }),
  );
  await expect(
    question(page, 3).getByRole("radio", { name: "FALSE" }),
  ).toBeFocused();

  await navigatorBar(page)
    .getByRole("button", { name: en.reading.flag.add })
    .click();
  await expect(cell(page, 3)).toHaveAccessibleName(
    new RegExp(en.reading.navigator.flagged),
  );
  await expect(
    navigatorBar(page).getByRole("button", { name: en.reading.flag.remove }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("a notes or summary group shows its text once, with a labeled field per question", async ({
  page,
}) => {
  await start(page);
  const notes = column(page).getByRole("region", {
    name: fill(en.reading.question.range, { from: 7, to: 9 }),
  });
  await expect(notes.getByText("Shared bicycles")).toHaveCount(1);
  for (const number of [7, 8, 9])
    await expect(
      notes.getByRole("textbox", {
        name: fill(en.reading.answer.label, { number }),
      }),
    ).toBeVisible();
  await notes
    .getByRole("textbox", {
      name: fill(en.reading.answer.label, { number: 8 }),
    })
    .fill("station");
  await expect(notes.getByText("(8)").locator("..")).toContainText("station");
  await expect(cell(page, 8)).toHaveAccessibleName(/current/);
});

test("an option list opens in place in the question column, and choosing fills the answer", async ({
  page,
}) => {
  await start(page);
  await cell(page, 13).click();
  await navigatorBar(page)
    .getByRole("button", { name: en.reading.question.next })
    .click();
  await expect(currentHeading(page)).toHaveText(heading(14));
  const answerButton = question(page, 14).getByRole("button", {
    name: en.reading.answer.choose,
  });
  await answerButton.click();
  const listHeading = question(page, 14).getByRole("heading", {
    name: fill(en.reading.evidence.paragraph, { letter: "A" }),
  });
  await expect(listHeading).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(answerButton).toBeFocused();

  await answerButton.click();
  await question(page, 14)
    .getByRole("button", { name: /^ii Turning empty roofs/ })
    .click();
  await expect(
    question(page, 14).getByRole("button", { name: /^ii Turning empty roofs/ }),
  ).toBeFocused();
  await expect(cell(page, 14)).toHaveAccessibleName(
    new RegExp(en.reading.navigator.answered),
  );
});

test("Finish test asks in a dialog; Escape and Keep working return to it; Finish shows the finished page", async ({
  page,
}) => {
  const t = createTranslator({ locale: "en", messages: en });
  await start(page);
  const finish = navigatorBar(page).getByRole("button", {
    name: en.reading.finish.button,
  });
  const dialog = page.getByRole("dialog", { name: en.reading.finish.title });

  await finish.click();
  await expect(dialog).toContainText(
    t("reading.finish.unanswered", { count: 40 }),
  );
  await expect(
    dialog.getByRole("heading", { name: en.reading.finish.title }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(finish).toBeFocused();

  await finish.click();
  await dialog.getByRole("button", { name: en.reading.finish.cancel }).click();
  await expect(dialog).toBeHidden();
  await expect(finish).toBeFocused();

  await finish.click();
  await dialog
    .getByRole("button", { name: en.reading.finish.confirm, exact: true })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: en.reading.results.title }),
  ).toBeFocused();
});

test("Pin Evidence: the action bar sits in the passage column above the navigator bar, and the evidence shows under the question", async ({
  page,
}) => {
  await start(page);
  await sentence(page, "p1-2-s2").click();
  const bar = await actions(page).boundingBox();
  const main = await page.getByRole("main").boundingBox();
  const bottom = await navigatorBar(page).boundingBox();
  expect(bar && main && bottom).toBeTruthy();
  if (!bar || !main || !bottom) return;
  expect(bar.x).toBeGreaterThanOrEqual(main.x);
  expect(bar.x + bar.width).toBeLessThanOrEqual(main.x + main.width);
  expect(bar.y + bar.height).toBeLessThanOrEqual(bottom.y);

  await actions(page)
    .getByRole("button", { name: fill(en.reading.mark.pin, { number: 1 }) })
    .click();
  await expect(
    question(page, 1).getByRole("heading", { name: en.reading.evidence.title }),
  ).toBeVisible();
  await expect(
    sentence(page, "p1-2-s2").getByText(
      fill(en.reading.mark.pinned, { number: 1 }),
    ),
  ).toBeAttached();
});

test("Exam Mode shows the timer in the test bar and offers no Pin Evidence", async ({
  page,
}) => {
  await start(page, "en", "exam");
  await expect(page.getByRole("timer")).toBeVisible();
  await sentence(page, "p1-1-s1").click();
  const buttons = actions(page).getByRole("button");
  await expect(buttons).toHaveCount(2);
  await expect(buttons.nth(0)).toHaveAccessibleName(en.reading.mark.highlight);
  await expect(buttons.nth(1)).toHaveAccessibleName(en.reading.mark.cancel);
  await expect(
    column(page).getByRole("heading", { name: en.reading.evidence.title }),
  ).toHaveCount(0);
});

test("the keyboard alone goes through the test bar, the passage, the questions and the navigator bar", async ({
  page,
}) => {
  await start(page);
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  await expect(sentence(page, "p1-1-s1")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(sentence(page, "p1-1-s2")).toBeFocused();

  // Questions 1–4: Tab into each radio group, choose with the arrow keys.
  for (const number of [1, 2, 3, 4]) {
    await page.keyboard.press("Tab");
    if (number > 1) await page.keyboard.press("Tab"); // past "Clear answer"
    await expect(
      question(page, number).getByRole("radio", { name: "TRUE" }),
    ).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(
      question(page, number).getByRole("radio", { name: "FALSE" }),
    ).toBeChecked();
    await expect(currentHeading(page)).toHaveText(heading(number));
  }

  // On through the remaining questions to the navigator bar.
  for (let i = 0; i < 40; i++) {
    if (
      await navigatorBar(page).evaluate((bar) =>
        bar.contains(document.activeElement),
      )
    )
      break;
    await page.keyboard.press("Tab");
  }
  await expect(cell(page, 1)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(currentHeading(page)).toHaveText(heading(1));
  await expect(currentHeading(page)).toBeFocused();
});

for (const width of [1024, 1280]) {
  for (const locale of ["en", "ru"] as const) {
    test(`at ${width} px in /${locale} nothing overflows and there are no WCAG 2.2 AA violations, also with the finish dialog open`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await start(page, locale);
      await noOverflow(page);
      await axe(page);
      await navigatorBar(page, locale)
        .getByRole("button", { name: catalogs[locale].reading.finish.button })
        .click();
      await expect(
        page.getByRole("dialog", {
          name: catalogs[locale].reading.finish.title,
        }),
      ).toBeVisible();
      await axe(page);
    });
  }
}
