import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import { type Locale, catalogs, fill, noOverflow } from "./reading";

// Whole level checks (USER_FLOWS.md, Level check flows (M7)), in every
// interface language, on the phone layout (mobile project) and the desktop
// layout (desktop project): onboarding → the check → leave → resume → finish
// → the result → the next action; taking it again; a device that keeps
// nothing; axe, 200% zoom and reduced motion (ACCESSIBILITY.md).

const FORM = "level-check-reading-a";
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
};

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

/** The section's controls, the way each layout has them. */
function layout(page: Page, locale: Locale, isDesktop: boolean) {
  const m = catalogs[locale];
  const questions = page.getByRole("region", {
    name: m.reading.sheet.label,
    exact: true,
  });
  return {
    questionHeading: (number: number) =>
      page.locator("#question-heading:visible").filter({
        hasText: fill(m.reading.question.of, { number, total: 14 }),
      }),
    async chooseTrue() {
      const scope = isDesktop
        ? questions.locator('[data-question="1"]')
        : questions;
      await scope
        .locator("label")
        .filter({ has: page.getByRole("radio", { name: "TRUE", exact: true }) })
        .click();
    },
    async finish() {
      if (isDesktop) {
        await page
          .getByRole("region", { name: m.reading.navigator.open })
          .getByRole("button", {
            name: m.levelCheck.finish.button,
            exact: true,
          })
          .click();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: m.reading.finish.confirm, exact: true })
          .click();
      } else {
        await page
          .getByRole("button", { name: m.reading.navigator.open })
          .click();
        await questions
          .getByRole("button", {
            name: m.levelCheck.finish.button,
            exact: true,
          })
          .click();
        await questions
          .getByRole("button", { name: m.reading.finish.confirm, exact: true })
          .click();
      }
      await expect(page).toHaveURL(/\/level-check\/result\?attempt=/);
    },
  };
}

/** Adds the key's answers 2–9 to the section kept on the device, as the engine keeps them. */
async function answerMoreOnTheDevice(page: Page) {
  await page.evaluate(
    ([key, answers]) => {
      const raw = localStorage.getItem(key);
      if (!raw) throw new Error("no section on the device");
      const stored = JSON.parse(raw) as {
        session: { answers: Record<string, string> };
      };
      stored.session.answers = { ...stored.session.answers, ...answers };
      localStorage.setItem(key, JSON.stringify(stored));
    },
    [
      `reading:${FORM}`,
      Object.fromEntries(
        Object.entries(KEY)
          .filter(([n]) => Number(n) > 1)
          .map(([n, a]) => [String(n), a]),
      ),
    ] as const,
  );
}

for (const locale of routing.locales) {
  const m = catalogs[locale];

  test(`a learner in /${locale} sets a goal, finds their level, leaves and comes back, and is sent to practice`, async ({
    page,
  }, testInfo) => {
    const ui = layout(page, locale, testInfo.project.name === "desktop");

    // Onboarding: three taps, a General Training goal.
    await page.goto(`/${locale}`);
    await expect(page).toHaveURL(`/${locale}/start/exam`);
    await page.getByRole("button", { name: m.examType.general }).click();
    await page.getByRole("button", { name: "6.5", exact: true }).click();
    await expect(page).toHaveURL(`/${locale}/start/level-check`);
    await page.getByRole("link", { name: m.levelCheck.start }).click();

    // The intro says what it is and is not, then the check starts.
    await expect(page).toHaveURL(`/${locale}/level-check`);
    await expect(page.getByText(m.levelCheck.intro.honest)).toBeVisible();
    await expect(page.getByText(m.levelCheck.intro.academicNote)).toBeVisible();
    expect((await axe(page)).violations).toEqual([]);
    await page.getByRole("button", { name: m.levelCheck.intro.start }).click();
    await expect(ui.questionHeading(1)).toBeVisible();
    await expect(
      page.getByRole("button", { name: m.reading.flag.add }),
    ).toHaveCount(0);
    expect((await axe(page)).violations).toEqual([]);
    await ui.chooseTrue();

    // Leaving keeps the answer; Home and the intro continue it.
    await page.getByRole("link", { name: m.reading.exit }).click();
    await expect(page).toHaveURL(`/${locale}`);
    await page
      .getByRole("link", { name: m.levelCheck.resume.continue })
      .click();
    await expect(
      page.getByText(
        fill(m.levelCheck.resume.body, { answered: 1, total: 14 }),
      ),
    ).toBeVisible();
    await answerMoreOnTheDevice(page);
    await page
      .getByRole("button", { name: m.levelCheck.resume.continue })
      .click();
    await expect(ui.questionHeading(1)).toBeVisible();

    // Finishing: the result on our scale, focus on its heading, one red action.
    await ui.finish();
    await expect(
      page.getByRole("heading", { level: 1, name: m.levelCheck.result.title }),
    ).toBeFocused();
    await expect(page.getByText(m.levelCheck.levels[2])).toBeVisible();
    await expect(
      page.getByText(fill(m.reading.results.score, { score: 9, total: 14 })),
    ).toBeVisible();
    await expect(page.getByText(m.levelCheck.result.honest)).toBeVisible();
    await noOverflow(page);
    expect((await axe(page)).violations).toEqual([]);
    // 200% zoom of a 1280 × 800 window: 640 × 400 CSS pixels.
    await page.setViewportSize({ width: 640, height: 400 });
    await noOverflow(page);
    await page
      .getByRole("link", { name: m.levelCheck.result.practise })
      .click();
    await expect(page).toHaveURL(`/${locale}/practice`);

    // Home now leads to practice and keeps the starting point one tap away.
    await page.goto(`/${locale}`);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: m.levelCheck.result.practise,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: m.home.nextAction.seeStartingPoint })
      .click();
    await expect(page.getByText(m.levelCheck.levels[2])).toBeVisible();

    // Taking it again starts a fresh section; the earlier result stands.
    await page.getByRole("link", { name: m.levelCheck.retake.start }).click();
    await expect(
      page.getByText(m.levelCheck.retake.sameQuestions),
    ).toBeVisible();
    await page.getByRole("button", { name: m.levelCheck.retake.start }).click();
    await expect(ui.questionHeading(1)).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "TRUE" }).first(),
    ).not.toBeChecked();
    await page.getByRole("link", { name: m.reading.exit }).click();
    await page.goto(`/${locale}/level-check/result`);
    await expect(page.getByText(m.levelCheck.levels[2])).toBeVisible();
  });
}

test("a device that keeps nothing still runs the check in the tab and shows the result", async ({
  page,
}, testInfo) => {
  const ui = layout(page, "en", testInfo.project.name === "desktop");
  const m = catalogs.en;
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await page.goto("/en/level-check");
  await expect(
    page.getByText(m.levelCheck.intro.storageUnavailable),
  ).toBeVisible();
  await page.getByRole("button", { name: m.levelCheck.intro.start }).click();
  await expect(ui.questionHeading(1)).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(
    m.reading.storage.unavailable,
  );
  await ui.chooseTrue();
  // Leaving would lose the answers, so "Exit" asks first.
  await page.getByRole("link", { name: m.reading.exit }).click();
  await expect(
    page.getByRole("heading", { name: m.levelCheck.exitUnsaved.title }),
  ).toBeVisible();
  await page.getByRole("button", { name: m.reading.exitExam.stay }).click();
  await ui.finish();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: m.levelCheck.result.insufficient.title,
    }),
  ).toBeVisible();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the section's sheet changes state without animating", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "desktop",
      "the sheet is the phone layout",
    );
    await page.goto("/en/level-check");
    await page
      .getByRole("button", { name: catalogs.en.levelCheck.intro.start })
      .click();
    const sheet = page.getByRole("region", {
      name: catalogs.en.reading.sheet.label,
      exact: true,
    });
    await expect(sheet).toBeVisible();
    const duration = await sheet.evaluate(
      (e) => parseFloat(getComputedStyle(e).transitionDuration) * 1000,
    );
    expect(duration).toBeLessThan(1);
  });
});

test("the keyboard reaches the intro's action after the skip link, the logo and the navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/en/level-check");
  const start = page.getByRole("button", {
    name: catalogs.en.levelCheck.intro.start,
  });
  await expect(start).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    if (await start.evaluate((e) => e === document.activeElement)) break;
  }
  await expect(start).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: catalogs.en.onboarding.notNow }),
  ).toBeFocused();
});
