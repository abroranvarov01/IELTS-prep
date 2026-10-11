import { expect, test, type Page } from "@playwright/test";
import { type Locale, TEST, catalogs, fill, sentence } from "./reading";
import { routing } from "../src/i18n/routing";

// Whole Reading sessions, from the start screen to the results page, on the
// phone layout (mobile project) and the desktop layout (desktop project), in
// every interface language (M4-22).

// One question of every type in the demo test, with an answer for it.
type Step = { number: number } & (
  | { choose: RegExp }
  | { type: string }
  | { pick: RegExp }
  | { checks: RegExp[] }
);
const STEPS: Step[] = [
  { number: 1, choose: /^TRUE$/ }, // TRUE / FALSE / NOT GIVEN
  { number: 5, choose: /^A / }, // multiple choice
  { number: 7, type: "phone" }, // note completion
  { number: 10, type: "lanes" }, // sentence completion
  { number: 12, type: "baskets" }, // short answer
  { number: 14, pick: /^ii / }, // matching headings
  { number: 19, pick: /^B( |$)/ }, // matching information
  { number: 22, checks: [/^A /, /^C /] }, // choose two (answers 22 and 23)
  { number: 24, type: "strengthened" }, // summary completion
  { number: 28, choose: /^YES$/ }, // YES / NO / NOT GIVEN
  { number: 32, pick: /^A / }, // matching features
  { number: 35, pick: /^A / }, // matching sentence endings
  { number: 38, pick: /^A / }, // summary from a word box
];
const ANSWERED = 14;

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Moving between questions and finishing, the way each layout does it. */
function layout(page: Page, locale: Locale, isDesktop: boolean) {
  const m = catalogs[locale].reading;
  const questions = page.getByRole("region", {
    name: m.sheet.label,
    exact: true,
  });
  const bar = page.getByRole("region", { name: m.navigator.open });
  const cell = (number: number) =>
    new RegExp(`^${escape(fill(m.navigator.item, { number, states: "" }))}`);
  return {
    /** Where the controls of a question are: the sheet, or its place in the column. */
    controls: (number: number) =>
      isDesktop ? questions.locator(`[data-question="${number}"]`) : questions,
    async goTo(number: number) {
      if (isDesktop) {
        const target = bar.getByRole("button", { name: cell(number) });
        if ((await target.count()) === 0) {
          const passage = number <= 13 ? 1 : number <= 27 ? 2 : 3;
          const label =
            fill(m.navigator.passageProgress, {
              number: passage,
            }).split("{")[0] ?? "";
          await bar
            .getByRole("button", { name: new RegExp(`^${escape(label)}`) })
            .click();
        }
        await target.click();
      } else {
        await page.getByRole("button", { name: m.navigator.open }).click();
        await questions.getByRole("button", { name: cell(number) }).click();
      }
      await expect(page.locator("#question-heading")).toContainText(
        String(number),
      );
    },
    async isAnswered(number: number) {
      if (!isDesktop)
        await page.getByRole("button", { name: m.navigator.open }).click();
      const name = await (isDesktop ? bar : questions)
        .getByRole("button", { name: cell(number) })
        .getAttribute("aria-label");
      if (!isDesktop) await page.keyboard.press("Escape");
      return name?.includes(m.navigator.answered) ?? false;
    },
    async finish() {
      if (isDesktop) {
        await bar.getByRole("button", { name: m.finish.button }).click();
        await page
          .getByRole("dialog", { name: m.finish.title })
          .getByRole("button", { name: m.finish.confirm, exact: true })
          .click();
      } else {
        await this.goTo(40);
        await questions.getByRole("button", { name: m.finish.button }).click();
        await questions
          .getByRole("button", { name: m.finish.confirm, exact: true })
          .click();
      }
    },
  };
}

async function answer(
  page: Page,
  locale: Locale,
  ui: ReturnType<typeof layout>,
  step: Step,
) {
  const m = catalogs[locale].reading;
  const scope = ui.controls(step.number);
  if ("choose" in step) {
    await scope
      .locator("label")
      .filter({ has: page.getByRole("radio", { name: step.choose }) })
      .click();
  } else if ("type" in step) {
    await scope
      .getByRole("textbox", {
        name: fill(m.answer.label, { number: step.number }),
      })
      .fill(step.type);
  } else if ("pick" in step) {
    await scope.getByRole("button", { name: m.answer.choose }).click();
    await scope.getByRole("button", { name: step.pick }).click();
  } else {
    for (const option of step.checks)
      await scope
        .locator("label")
        .filter({ has: page.getByRole("checkbox", { name: option }) })
        .click();
  }
}

for (const mode of ["practice", "exam"] as const) {
  for (const locale of routing.locales) {
    test(`${mode} session in /${locale}: start, answer every question type, highlight${mode === "practice" ? ", pin" : ""}, move between passages, reload and resume, finish`, async ({
      page,
    }, testInfo) => {
      const m = catalogs[locale].reading;
      const ui = layout(page, locale, testInfo.project.name === "desktop");

      await page.goto(`/${locale}/reading/${TEST}?mode=${mode}`);
      await page.getByRole("button", { name: m.start }).click();
      await expect(page.locator("#question-heading")).toBeVisible();
      // The interface is in the user's language; the test content is English.
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("main").locator("article")).toHaveAttribute(
        "lang",
        "en",
      );
      await expect(ui.controls(1).locator('[lang="en"]').first()).toBeVisible();
      if (mode === "exam") await expect(page.getByRole("timer")).toBeVisible();

      const [first, second, ...rest] = STEPS;
      if (!first || !second) throw new Error("STEPS needs two steps");
      await ui.goTo(first.number);
      await answer(page, locale, ui, first);

      // Highlight a sentence, and in Practice pin one to question 1.
      await sentence(page, "p1-2-s2").click();
      await page.getByRole("button", { name: m.mark.highlight }).click();
      if (mode === "practice") {
        await sentence(page, "p1-1-s1").click();
        await page
          .getByRole("button", { name: fill(m.mark.pin, { number: 1 }) })
          .click();
      }
      await ui.goTo(second.number);
      await answer(page, locale, ui, second);

      // Leave and come back: everything is still there.
      await page.reload();
      await expect(sentence(page, "p1-2-s2").locator("mark")).toBeVisible();
      if (mode === "practice") {
        await ui.goTo(1);
        await expect(
          sentence(page, "p1-1-s1").getByText(
            fill(m.mark.pinned, { number: 1 }),
          ),
        ).toBeAttached();
      }
      expect(await ui.isAnswered(1)).toBe(true);
      expect(await ui.isAnswered(5)).toBe(true);
      if (mode === "exam") await expect(page.getByRole("timer")).toBeVisible();

      for (const step of rest) {
        await ui.goTo(step.number);
        await answer(page, locale, ui, step);
      }
      expect(await ui.isAnswered(38)).toBe(true);

      await ui.finish();
      await expect(page).toHaveURL(/\/results\?attempt=/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        m.results.title,
      );
      // The score of the answers given, out of 40 (never a band), and the
      // questions left without an answer.
      await expect(
        page.getByText(
          new RegExp(fill(m.results.score, { score: "\\d+", total: 40 })),
        ),
      ).toBeVisible();
      await expect(page.getByText(m.results.honest)).toBeVisible();
      const noAnswer = /<noAnswer>(.*)<\/noAnswer>/.exec(
        m.results.breakdown,
      )?.[1];
      if (!noAnswer) throw new Error("breakdown needs a <noAnswer> part");
      await expect(
        page.getByText(fill(noAnswer, { unanswered: 40 - ANSWERED }), {
          exact: true,
        }),
      ).toBeVisible();
    });
  }
}
