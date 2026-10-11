import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { createTranslator } from "next-intl";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/i18n/routing";
import {
  type Locale,
  TEST,
  actions,
  catalogs,
  choose,
  fill,
  noOverflow,
  sentence,
} from "./reading";

async function startPractice(page: Page, locale: Locale = "en") {
  await page.goto(`/${locale}/reading/${TEST}`);
  await page
    .getByRole("button", { name: catalogs[locale].reading.start })
    .click();
  await expect(questionHeading(page, locale, 1)).toBeVisible();
}

function questionHeading(page: Page, locale: Locale, number: number) {
  return page.getByRole("heading", {
    level: 2,
    name: fill(catalogs[locale].reading.question.of, { number, total: 40 }),
  });
}

const sheet = (page: Page, locale: Locale = "en") =>
  page.getByRole("region", { name: catalogs[locale].reading.sheet.label });

// The phone and tablet layout, with the question sheet. The desktop project
// runs these below the desktop breakpoint; reading-desktop.spec.ts covers the
// desktop layout.
test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop")
    await page.setViewportSize({ width: 1000, height: 800 });
});

test("opens the start screen with both modes, Practice chosen, and starts the test", async ({
  page,
}) => {
  await page.goto(`/en/reading/${TEST}`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Demo Reading Test 1" }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: new RegExp(en.reading.mode.practice) }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: new RegExp(en.reading.mode.exam) }),
  ).not.toBeChecked();

  await page.getByRole("button", { name: en.reading.start }).click();
  await expect(questionHeading(page, "en", 1)).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Bicycles in the Small City" }),
  ).toBeVisible();
  await expect(
    page.getByText(fill(en.reading.passageOf, { number: 1, total: 3 })),
  ).toBeVisible();
  // The test screen has its own bar instead of the shell header.
  await expect(page.getByRole("img", { name: en.app.name })).toHaveCount(0);
});

test("an unknown test is not found", async ({ page }) => {
  const response = await page.goto("/en/reading/no-such-test");
  expect(response?.status()).toBe(404);
});

test("choosing an answer does not move on, and the answer can be cleared", async ({
  page,
}) => {
  await startPractice(page);
  await choose(page, "FALSE");

  await expect(questionHeading(page, "en", 1)).toBeVisible();
  await expect(
    sheet(page).getByText(en.reading.navigator.answered),
  ).toBeVisible();

  await page.getByRole("button", { name: en.reading.answer.clear }).click();
  await expect(page.getByRole("radio", { name: "FALSE" })).not.toBeChecked();
  await expect(
    sheet(page).getByText(en.reading.navigator.answered),
  ).toHaveCount(0);
});

test("Next and Previous move between questions, focus the new question, and show its passage", async ({
  page,
}) => {
  await startPractice(page);
  await page.getByRole("button", { name: en.reading.question.next }).click();
  await expect(questionHeading(page, "en", 2)).toBeFocused();

  for (let n = 3; n <= 14; n++)
    await page.getByRole("button", { name: en.reading.question.next }).click();
  await expect(questionHeading(page, "en", 14)).toBeVisible();
  await expect(
    page.getByText(fill(en.reading.passageOf, { number: 2, total: 3 })),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "How Rooftop Gardens Change a Building",
    }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: en.reading.question.previous })
    .click();
  await expect(questionHeading(page, "en", 13)).toBeFocused();
  await expect(
    page.getByRole("heading", { level: 1, name: "Bicycles in the Small City" }),
  ).toBeVisible();
});

test("each question starts at its top, even after scrolling the previous one", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await startPractice(page);
  const body = page.locator("#question-body");
  await body.evaluate((e) => e.scrollTo(0, e.scrollHeight));
  expect(await body.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);

  await page.getByRole("button", { name: en.reading.question.next }).click();
  await expect(questionHeading(page, "en", 2)).toBeFocused();
  expect(await body.evaluate((e) => e.scrollTop)).toBe(0);
});

test("the handle button moves the sheet between collapsed and partial, also by keyboard", async ({
  page,
}) => {
  await startPractice(page);
  const hide = page.getByRole("button", { name: en.reading.sheet.hide });
  await expect(hide).toHaveAttribute("aria-expanded", "true");
  await hide.click();

  const show = page.getByRole("button", { name: en.reading.sheet.show });
  await expect(show).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("radio", { name: "TRUE" })).toHaveCount(0);
  await expect(questionHeading(page, "en", 1)).toBeVisible();

  await show.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("radio", { name: "TRUE" })).toBeVisible();
});

test("dragging the handle up snaps the sheet to expanded", async ({ page }) => {
  await startPractice(page);
  const handle = page.getByRole("button", { name: en.reading.sheet.hide });
  const box = await handle.boundingBox();
  if (!box) throw new Error("no handle");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, 60, { steps: 8 });
  await page.mouse.up();

  const viewport = page.viewportSize()!.height;
  await expect
    .poll(async () => (await sheet(page).boundingBox())?.height)
    .toBeGreaterThan(viewport - 60);
});

test("the sheet spans the screen width in every state", async ({ page }) => {
  await startPractice(page);
  const width = page.viewportSize()!.width;
  const expected = Math.min(width, 640);
  expect((await sheet(page).boundingBox())?.width).toBe(expected);
  await page.getByRole("button", { name: en.reading.sheet.hide }).click();
  await expect
    .poll(async () => (await sheet(page).boundingBox())?.width)
    .toBe(expected);
});

test("a reload keeps the question, its answer and the sheet state", async ({
  page,
}) => {
  await startPractice(page);
  await page.getByRole("button", { name: en.reading.question.next }).click();
  await choose(page, "FALSE");
  await page.getByRole("button", { name: en.reading.sheet.hide }).click();

  await page.reload();
  await expect(questionHeading(page, "en", 2)).toBeVisible();
  await page.getByRole("button", { name: en.reading.sheet.show }).click();
  await expect(page.getByRole("radio", { name: "FALSE" })).toBeChecked();
});

test("says so when the device cannot keep answers, and the test still works", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await startPractice(page);
  await expect(page.getByRole("status")).toHaveText(
    en.reading.storage.unavailable,
  );
  await choose(page, "TRUE");
  await expect(page.getByRole("radio", { name: "TRUE" })).toBeChecked();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the sheet changes state without animating", async ({ page }) => {
    await startPractice(page);
    const duration = await sheet(page).evaluate(
      (e) => parseFloat(getComputedStyle(e).transitionDuration) * 1000,
    );
    expect(duration).toBeLessThan(1);
  });
});

for (const locale of routing.locales) {
  const messages = catalogs[locale];

  test.describe(`Reading in /${locale}`, () => {
    test("the start screen and the reading screen have no WCAG 2.2 AA violations", async ({
      page,
    }) => {
      const axe = () =>
        new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
      await page.goto(`/${locale}/reading/${TEST}`);
      await expect(
        page.getByRole("button", { name: messages.reading.start }),
      ).toBeVisible();
      expect((await axe()).violations).toEqual([]);

      await page.getByRole("button", { name: messages.reading.start }).click();
      await expect(questionHeading(page, locale, 1)).toBeVisible();
      expect((await axe()).violations).toEqual([]);
    });

    test("the skip link leads to the question", async ({ page }) => {
      await startPractice(page, locale);
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: messages.reading.skipToQuestion }),
      ).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(questionHeading(page, locale, 1)).toBeFocused();
    });

    for (const width of [320, 360]) {
      test(`fits ${width} px without horizontal scroll or truncation`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 640 });
        await page.goto(`/${locale}/reading/${TEST}`);
        await expect(
          page.getByRole("button", { name: messages.reading.start }),
        ).toBeVisible();
        await noOverflow(page);

        await page
          .getByRole("button", { name: messages.reading.start })
          .click();
        await expect(questionHeading(page, locale, 1)).toBeVisible();
        await noOverflow(page);
      });
    }
  });
}

test.describe("question navigator", () => {
  const navButton = (page: Page, name: string | RegExp) =>
    sheet(page).getByRole("button", { name });

  test("opens in the expanded sheet with all 40 questions, and jumps across passages", async ({
    page,
  }) => {
    await startPractice(page);
    await page.getByRole("button", { name: en.reading.navigator.open }).click();
    await expect(
      page.getByRole("heading", { name: en.reading.navigator.open }),
    ).toBeFocused();
    await expect(
      sheet(page).getByRole("button", { name: /^Question \d+,/ }),
    ).toHaveCount(40);
    const viewport = page.viewportSize()!.height;
    await expect
      .poll(async () => (await sheet(page).boundingBox())?.height)
      .toBeGreaterThan(viewport - 60);

    await navButton(page, "Question 30, no answer").click();
    await expect(questionHeading(page, "en", 30)).toBeFocused();
    await expect(
      page.getByText(fill(en.reading.passageOf, { number: 3, total: 3 })),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Should Homework Be Shorter?",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: en.reading.navigator.open }),
    ).toHaveCount(0);
  });

  test("shows answered, marked and current questions in words", async ({
    page,
  }) => {
    await startPractice(page);
    await choose(page, "TRUE");
    await page.getByRole("button", { name: en.reading.question.next }).click();
    await page.getByRole("button", { name: en.reading.flag.add }).click();
    await expect(
      page.getByRole("button", { name: en.reading.flag.remove }),
    ).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: en.reading.navigator.open }).click();
    await expect(navButton(page, "Question 1, answered")).toBeVisible();
    await expect(
      navButton(page, "Question 2, no answer, marked for review, current"),
    ).toBeVisible();
  });

  test("Back and Escape close it and return focus", async ({ page }) => {
    await startPractice(page);
    const open = page.getByRole("button", { name: en.reading.navigator.open });
    await open.click();
    await page.getByRole("button", { name: en.reading.sheet.back }).click();
    await expect(open).toBeFocused();

    await open.click();
    await page.keyboard.press("Escape");
    await expect(open).toBeFocused();
    await expect(page.getByRole("radio", { name: "TRUE" })).toBeVisible();
  });

  test("works with the keyboard only", async ({ page }) => {
    await startPractice(page);
    await page.getByRole("button", { name: en.reading.navigator.open }).focus();
    await page.keyboard.press("Enter");
    const last = navButton(page, "Question 40, no answer");
    for (
      let i = 0;
      i < 60 && !(await last.evaluate((e) => e === document.activeElement));
      i++
    ) {
      await page.keyboard.press("Tab");
    }
    await expect(last).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(questionHeading(page, "en", 40)).toBeFocused();
  });

  test("fits 320 px with six questions per row", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await startPractice(page);
    await page.getByRole("button", { name: en.reading.navigator.open }).click();
    const tops = await sheet(page)
      .getByRole("button", { name: /^Question ([1-7]),/ })
      .evaluateAll((buttons) =>
        buttons.map((b) => Math.round(b.getBoundingClientRect().top)),
      );
    expect(new Set(tops.slice(0, 6)).size).toBe(1);
    expect(tops[6]).toBeGreaterThan(tops[0]!);
    await noOverflow(page);
  });

  for (const locale of ["en", "ru"] as const) {
    test(`has no WCAG 2.2 AA violations when open in /${locale}`, async ({
      page,
    }) => {
      await startPractice(page, locale);
      await page
        .getByRole("button", { name: catalogs[locale].reading.navigator.open })
        .click();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

/** Opens a question through the navigator. */
async function goToQuestion(page: Page, number: number, locale: Locale = "en") {
  await page
    .getByRole("button", { name: catalogs[locale].reading.navigator.open })
    .click();
  await sheet(page, locale)
    .getByRole("button", {
      name: new RegExp(
        `^${fill(catalogs[locale].reading.navigator.item, { number, states: "" })}`,
      ),
    })
    .click();
}

test.describe("choice questions", () => {
  test("multiple choice takes one lettered option", async ({ page }) => {
    await startPractice(page);
    await goToQuestion(page, 5);
    await page
      .locator("label")
      .filter({ hasText: "Cyclists stop more often than drivers." })
      .click();
    await expect(
      page.getByRole("radio", {
        name: "B Cyclists stop more often than drivers.",
      }),
    ).toBeChecked();
  });

  test("'choose two' takes at most two, and answers both of its numbers", async ({
    page,
  }) => {
    await startPractice(page);
    await goToQuestion(page, 22);
    await expect(
      page.getByRole("heading", { level: 2, name: "Questions 22–23" }),
    ).toBeVisible();
    await page
      .locator("label")
      .filter({ hasText: "Rooms on the top floor stay cooler." })
      .click();
    await page
      .locator("label")
      .filter({ hasText: "Drains are less likely to overflow." })
      .click();
    await expect(
      page.getByText(
        fill(en.reading.answer.chosenCount, { count: 2, total: 2 }),
      ),
    ).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /^B / })).toBeDisabled();

    await page.getByRole("button", { name: en.reading.navigator.open }).click();
    await expect(
      sheet(page).getByRole("button", {
        name: "Question 22, answered, current",
      }),
    ).toBeVisible();
    await expect(
      sheet(page).getByRole("button", { name: "Question 23, answered" }),
    ).toBeVisible();
  });

  test("YES / NO / NOT GIVEN questions answer the writer's views", async ({
    page,
  }) => {
    await startPractice(page);
    await goToQuestion(page, 28);
    await choose(page, "NO");
    await expect(
      page.getByRole("radio", { name: "NO", exact: true }),
    ).toBeChecked();
  });

  for (const number of [5, 22]) {
    test(`question ${number} fits 320 px and has no WCAG 2.2 AA violations`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await startPractice(page, "ru");
      await goToQuestion(page, number, "ru");
      await noOverflow(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("matching questions", () => {
  const answerButton = (page: Page) =>
    sheet(page).locator("#question-body button").first();

  test("an answer button opens the option list, and choosing returns to the question", async ({
    page,
  }) => {
    await startPractice(page);
    await goToQuestion(page, 14);
    await expect(sheet(page).getByText("Paragraph A")).toBeVisible();
    await page.getByRole("button", { name: en.reading.answer.choose }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: "Paragraph A" }),
    ).toBeFocused();
    const viewport = page.viewportSize()!.height;
    await expect
      .poll(async () => (await sheet(page).boundingBox())?.height)
      .toBeGreaterThan(viewport - 60);

    await page
      .getByRole("button", { name: "ii Turning empty roofs into green space" })
      .click();
    await expect(answerButton(page)).toHaveText(
      /ii Turning empty roofs into green space/,
    );
    await expect(answerButton(page)).toBeFocused();

    await page.getByRole("button", { name: en.reading.question.next }).click();
    await page.getByRole("button", { name: en.reading.answer.choose }).click();
    await expect(
      page.getByText(fill(en.reading.answer.chosenFor, { question: 14 })),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(answerButton(page)).toBeFocused();
  });

  test("a word-box summary shows its gaps and fills them", async ({ page }) => {
    await startPractice(page);
    await goToQuestion(page, 38);
    await expect(sheet(page).getByText("(38)")).toBeVisible();
    await page.getByRole("button", { name: en.reading.answer.choose }).click();
    await page.getByRole("button", { name: "A brief" }).click();
    await expect(sheet(page).getByText("(38)").locator("..")).toContainText(
      "brief",
    );
  });

  test("works with the keyboard only", async ({ page }) => {
    await startPractice(page);
    await goToQuestion(page, 19);
    await page.getByRole("button", { name: en.reading.answer.choose }).focus();
    await page.keyboard.press("Enter");
    const d = page.getByRole("button", { name: "D", exact: true });
    for (
      let i = 0;
      i < 10 && !(await d.evaluate((e) => e === document.activeElement));
      i++
    ) {
      await page.keyboard.press("Tab");
    }
    await page.keyboard.press("Enter");
    await expect(answerButton(page)).toHaveText(/^D/);
  });

  test("a long option list fits 320 px and has no WCAG 2.2 AA violations", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await startPractice(page, "ru");
    await goToQuestion(page, 14, "ru");
    await page.getByRole("button", { name: ru.reading.answer.choose }).click();
    await noOverflow(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("typed answers", () => {
  const field = (page: Page, number: number) =>
    page.getByRole("textbox", {
      name: fill(en.reading.answer.label, { number }),
    });

  test("each completion type takes typed words, shows them in the gap, and keeps them", async ({
    page,
  }) => {
    await startPractice(page);
    for (const [number, answer] of [
      [7, "phone"],
      [10, "lanes"],
      [24, "strengthened"],
    ] as const) {
      await goToQuestion(page, number);
      await field(page, number).fill(answer);
      await expect(
        sheet(page).getByText(`(${number})`).locator(".."),
      ).toContainText(answer);
    }
    // A short-answer question has no gap, only its field.
    await goToQuestion(page, 13);
    await field(page, 13).fill("winter weather");
    await page.reload();
    await goToQuestion(page, 13);
    await expect(field(page, 13)).toHaveValue("winter weather");
  });

  test("Enter in a field does not change the question", async ({ page }) => {
    await startPractice(page);
    await goToQuestion(page, 12);
    await field(page, 12).fill("baskets");
    await page.keyboard.press("Enter");
    await expect(questionHeading(page, "en", 12)).toBeVisible();
  });

  test("the sheet stays docked above the on-screen keyboard while typing", async ({
    page,
  }) => {
    // A stand-in for the browser's visual viewport, so the keyboard can be
    // "opened" in a test (Chromium has no on-screen keyboard here).
    await page.addInitScript(() => {
      const viewport = new EventTarget() as EventTarget & {
        height: number;
        offsetTop: number;
      };
      viewport.height = window.innerHeight;
      viewport.offsetTop = 0;
      Object.defineProperty(window, "visualViewport", { value: viewport });
      (
        window as unknown as { openKeyboard: (h: number) => void }
      ).openKeyboard = (h) => {
        viewport.height = window.innerHeight - h;
        viewport.dispatchEvent(new Event("resize"));
      };
    });
    await startPractice(page);
    await goToQuestion(page, 12);
    await field(page, 12).focus();
    await page.evaluate(() =>
      (window as unknown as { openKeyboard: (h: number) => void }).openKeyboard(
        300,
      ),
    );

    const viewport = page.viewportSize()!.height;
    await expect
      .poll(async () => {
        const box = await sheet(page).boundingBox();
        return box && Math.round(box.y + box.height);
      })
      .toBe(viewport - 300);
    // Measured once the sheet has settled (its height animation has ended),
    // which is what the user then sees.
    await sheet(page).evaluate((element) =>
      Promise.all(element.getAnimations().map((a) => a.finished)),
    );
    const fieldBox = await field(page, 12).boundingBox();
    expect(fieldBox!.y + fieldBox!.height).toBeLessThanOrEqual(viewport - 300);
  });

  test("a summary with typed gaps fits 320 px and has no WCAG 2.2 AA violations", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await startPractice(page, "uz");
    await goToQuestion(page, 24, "uz");
    await noOverflow(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("highlighting", () => {
  test.use({ hasTouch: true });

  test("tapping a sentence selects it; Highlight marks it, survives a reload, and can be removed", async ({
    page,
  }) => {
    await startPractice(page);
    await sentence(page, "p1-1-s2").tap();
    await expect(actions(page)).toBeVisible();
    await expect(
      page.getByRole("button", { name: en.reading.mark.highlight }),
    ).toBeFocused();
    // Selection is not shown by color alone.
    expect(
      await sentence(page, "p1-1-s2").evaluate(
        (e) => getComputedStyle(e).textDecorationLine,
      ),
    ).toBe("underline");

    await page.getByRole("button", { name: en.reading.mark.highlight }).tap();
    await expect(actions(page)).toHaveCount(0);
    await expect(sentence(page, "p1-1-s2").locator("mark")).toHaveText(
      /^Workers rode to factories/,
    );
    await expect(sentence(page, "p1-1-s2")).toBeFocused();
    await expect(
      page.getByText(en.reading.mark.highlighted, { exact: true }),
    ).toBeAttached();

    await page.reload();
    await expect(sentence(page, "p1-1-s2").locator("mark")).toBeVisible();
    // Highlights stay when the question changes.
    await page.getByRole("button", { name: en.reading.question.next }).click();
    await expect(sentence(page, "p1-1-s2").locator("mark")).toBeVisible();

    await sentence(page, "p1-1-s2").tap();
    await page
      .getByRole("button", { name: en.reading.mark.removeHighlight })
      .tap();
    await expect(sentence(page, "p1-1-s2").locator("mark")).toHaveCount(0);
  });

  test("tapping another sentence moves the selection; Cancel, the same sentence or scrolling away closes it", async ({
    page,
  }) => {
    await startPractice(page);
    await sentence(page, "p1-1-s1").tap();
    await sentence(page, "p1-1-s2").tap();
    await expect(actions(page)).toHaveCount(1);
    expect(
      await sentence(page, "p1-1-s1").evaluate(
        (e) => getComputedStyle(e).textDecorationLine,
      ),
    ).toBe("none");

    await sentence(page, "p1-1-s2").tap();
    await expect(actions(page)).toHaveCount(0);

    await sentence(page, "p1-1-s2").tap();
    await page.getByRole("button", { name: en.reading.mark.cancel }).tap();
    await expect(actions(page)).toHaveCount(0);
    await expect(page.locator("main mark")).toHaveCount(0);

    await sentence(page, "p1-1-s2").tap();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(actions(page)).toHaveCount(0);
  });

  test("works with the keyboard only, with the passage as one Tab stop", async ({
    page,
  }) => {
    await startPractice(page);
    // Skip link, Exit, then the passage.
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    await expect(sentence(page, "p1-1-s1")).toBeFocused();
    await expect(sentence(page, "p1-1-s1")).toHaveAccessibleDescription(
      en.reading.passage.label,
    );

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");
    await expect(sentence(page, "p1-1-s2")).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: en.reading.mark.highlight }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(sentence(page, "p1-1-s2").locator("mark")).toBeVisible();
    await expect(sentence(page, "p1-1-s2")).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(actions(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(actions(page)).toHaveCount(0);
    await expect(sentence(page, "p1-1-s2")).toBeFocused();
    await expect(sentence(page, "p1-1-s2").locator("mark")).toBeVisible();

    // Tab leaves the passage, and Shift+Tab comes back to the same sentence.
    await page.keyboard.press("Tab");
    await expect(page.locator("main [data-sentence]:focus")).toHaveCount(0);
    await page.keyboard.press("Shift+Tab");
    await expect(sentence(page, "p1-1-s2")).toBeFocused();
  });

  test("a focused sentence is not hidden under the sheet", async ({ page }) => {
    await startPractice(page);
    await sentence(page, "p1-1-s1").focus();
    const sheetTop = (await sheet(page).boundingBox())!.y;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("ArrowDown");
      const box = (await page.locator(":focus").boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(sheetTop);
    }
  });

  test("Exam Mode allows highlighting too", async ({ page }) => {
    await page.goto(`/en/reading/${TEST}`);
    await page
      .locator("label")
      .filter({
        has: page.getByRole("radio", {
          name: new RegExp(en.reading.mode.exam),
        }),
      })
      .click();
    await page.getByRole("button", { name: en.reading.start }).click();
    await sentence(page, "p1-1-s1").tap();
    await page.getByRole("button", { name: en.reading.mark.highlight }).tap();
    await expect(sentence(page, "p1-1-s1").locator("mark")).toBeVisible();
  });

  test("the action bar and highlights fit 320 px and have no WCAG 2.2 AA violations", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await startPractice(page, "uz");
    await sentence(page, "p1-1-s1").tap();
    await page.getByRole("button", { name: uz.reading.mark.highlight }).tap();
    await sentence(page, "p1-1-s1").tap();
    await expect(actions(page, "uz")).toBeVisible();
    await noOverflow(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Pin Evidence", () => {
  test.use({ hasTouch: true });
  const evidence = (page: Page) =>
    sheet(page)
      .getByRole("listitem")
      .filter({ has: page.locator("blockquote") });
  const pinTo = (page: Page, number: number) =>
    page.getByRole("button", { name: fill(en.reading.mark.pin, { number }) });

  test("pins a sentence to the current question, shows it in the sheet and the passage, and keeps it", async ({
    page,
  }) => {
    await startPractice(page);
    await sentence(page, "p1-2-s2").tap();
    await pinTo(page, 1).tap();
    await expect(actions(page)).toHaveCount(0);
    await expect(sentence(page, "p1-2-s2")).toBeFocused();
    await expect(
      page.getByText(fill(en.reading.mark.pinned, { number: 1 }), {
        exact: true,
      }),
    ).toHaveCount(2); // the marker's label and the announcement
    await expect(
      sentence(page, "p1-2-s2").getByText(
        fill(en.reading.mark.pinned, { number: 1 }),
      ),
    ).toBeAttached();

    await expect(
      sheet(page).getByRole("heading", { name: en.reading.evidence.title }),
    ).toBeVisible();
    await expect(evidence(page)).toHaveCount(1);
    await expect(evidence(page)).toContainText(
      fill(en.reading.evidence.paragraph, { letter: 2 }),
    );
    await expect(evidence(page).locator("blockquote")).toHaveText(
      /^A rider unlocks a bicycle/,
    );

    // A second pin is listed in passage order.
    await sentence(page, "p1-1-s1").tap();
    await pinTo(page, 1).tap();
    await expect(evidence(page).locator("blockquote")).toHaveText([
      /^For much of the twentieth century/,
      /^A rider unlocks a bicycle/,
    ]);

    await page.reload();
    await expect(evidence(page)).toHaveCount(2);

    // Another question has its own evidence and markers.
    await page.getByRole("button", { name: en.reading.question.next }).click();
    await expect(questionHeading(page, "en", 2)).toBeFocused();
    await expect(evidence(page)).toHaveCount(0);
    await expect(
      sentence(page, "p1-2-s2").getByText(
        fill(en.reading.mark.pinned, { number: 1 }),
      ),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: en.reading.question.previous })
      .click();
    await expect(evidence(page)).toHaveCount(2);
  });

  test("refuses a fourth pin with a message, and unpins from the action bar", async ({
    page,
  }) => {
    await startPractice(page);
    for (const id of ["p1-1-s1", "p1-1-s2", "p1-1-s3"]) {
      await sentence(page, id).tap();
      await pinTo(page, 1).tap();
    }
    await sentence(page, "p1-2-s1").tap();
    await pinTo(page, 1).tap();
    await expect(actions(page)).toContainText(
      fill(en.reading.evidence.limit, { max: 3 }),
    );
    await expect(evidence(page)).toHaveCount(3);

    await sentence(page, "p1-1-s2").tap();
    await expect(actions(page)).not.toContainText(
      fill(en.reading.evidence.limit, { max: 3 }),
    );
    await page
      .getByRole("button", { name: fill(en.reading.mark.unpin, { number: 1 }) })
      .tap();
    await expect(evidence(page)).toHaveCount(2);
  });

  test("Show in passage moves to the sentence and selects it; Remove from evidence removes it", async ({
    page,
  }) => {
    await startPractice(page);
    await sentence(page, "p1-4-s3").scrollIntoViewIfNeeded();
    await sentence(page, "p1-4-s3").tap();
    await pinTo(page, 1).tap();
    await page.evaluate(() => window.scrollTo(0, 0));

    await sheet(page)
      .getByRole("button", { name: en.reading.evidence.show })
      .click();
    await expect(sentence(page, "p1-4-s3")).toBeInViewport();
    await expect(
      page.getByRole("button", { name: en.reading.mark.highlight }),
    ).toBeFocused();
    await page.keyboard.press("Escape");

    await sheet(page)
      .getByRole("button", { name: en.reading.evidence.remove })
      .click();
    await expect(evidence(page)).toHaveCount(0);
    await expect(questionHeading(page, "en", 1)).toBeFocused();
    await expect(
      sentence(page, "p1-4-s3").getByText(
        fill(en.reading.mark.pinned, { number: 1 }),
      ),
    ).toHaveCount(0);
  });

  test("works with the keyboard only", async ({ page }) => {
    await startPractice(page);
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: en.reading.mark.cancel }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(pinTo(page, 1)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(sentence(page, "p1-1-s2")).toBeFocused();
    await expect(evidence(page)).toHaveCount(1);
  });

  test("a 'choose two' item keeps its pins under its first number", async ({
    page,
  }) => {
    await startPractice(page);
    await goToQuestion(page, 23);
    await sentence(page, "p2-a-s1").tap();
    await expect(pinTo(page, 22)).toBeVisible();
  });

  test("Exam Mode has no Pin Evidence", async ({ page }) => {
    await page.goto(`/en/reading/${TEST}`);
    await page
      .locator("label")
      .filter({
        has: page.getByRole("radio", {
          name: new RegExp(en.reading.mode.exam),
        }),
      })
      .click();
    await page.getByRole("button", { name: en.reading.start }).click();
    await sentence(page, "p1-1-s1").tap();
    await expect(actions(page)).toBeVisible();
    const buttons = actions(page).getByRole("button");
    await expect(buttons).toHaveCount(2);
    await expect(buttons.nth(0)).toHaveAccessibleName(
      en.reading.mark.highlight,
    );
    await expect(buttons.nth(1)).toHaveAccessibleName(en.reading.mark.cancel);
  });

  for (const locale of routing.locales) {
    test(`the action bar keeps its actions to two rows at 320 and 360 px in /${locale}, in every state`, async ({
      page,
    }) => {
      const m = catalogs[locale].reading;
      const pinTo1 = page.getByRole("button", {
        name: fill(m.mark.pin, { number: 1 }),
      });
      const rows = () =>
        actions(page, locale)
          .getByRole("button")
          .evaluateAll(
            (buttons) =>
              new Set(
                buttons.map((b) => Math.round(b.getBoundingClientRect().top)),
              ).size,
          );
      const atBothWidths = async () => {
        for (const width of [320, 360]) {
          await page.setViewportSize({ width, height: 640 });
          expect(await rows()).toBeLessThanOrEqual(2);
          await noOverflow(page);
        }
        await page.setViewportSize({ width: 320, height: 640 });
      };

      await page.setViewportSize({ width: 320, height: 640 });
      await startPractice(page, locale);
      await sentence(page, "p1-1-s1").tap();
      await atBothWidths(); // Highlight, Cancel, Pin

      await page.getByRole("button", { name: m.mark.highlight }).tap();
      await sentence(page, "p1-1-s1").tap();
      await pinTo1.tap();
      await sentence(page, "p1-1-s1").tap();
      await expect(
        page.getByRole("button", { name: m.mark.removeHighlight }),
      ).toBeVisible();
      await atBothWidths(); // Remove highlight, Cancel, Unpin
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);

      await page.getByRole("button", { name: m.mark.cancel }).tap();
      for (const id of ["p1-1-s2", "p1-1-s3"]) {
        await sentence(page, id).tap();
        await pinTo1.tap();
      }
      await sentence(page, "p1-2-s1").tap();
      await pinTo1.tap();
      await expect(actions(page, locale)).toContainText(
        fill(m.evidence.limit, { max: 3 }),
      );
      await atBothWidths(); // the refused pin's message above the actions
    });
  }

  test("the evidence and the action bar fit 320 px and have no WCAG 2.2 AA violations", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await startPractice(page, "ru");
    for (const id of ["p1-1-s1", "p1-1-s2", "p1-1-s3", "p1-2-s1"]) {
      await sentence(page, id).tap();
      await page
        .getByRole("button", { name: fill(ru.reading.mark.pin, { number: 1 }) })
        .tap();
    }
    await expect(actions(page, "ru")).toContainText(
      fill(ru.reading.evidence.limit, { max: 3 }),
    );
    await noOverflow(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Practice and Exam Modes", () => {
  // The clock is fixed and moved by the test; the app's timers keep running.
  const T0 = Date.UTC(2026, 9, 11, 9, 0);
  const MINUTE = 60_000;
  const translate = (locale: Locale) =>
    createTranslator({ locale, messages: catalogs[locale] });
  const timer = (page: Page) => page.getByRole("timer");
  const exit = (page: Page, locale: Locale = "en") =>
    page.getByRole("link", { name: catalogs[locale].reading.exit });
  const exitDialog = (page: Page, locale: Locale = "en") =>
    page.getByRole("dialog", {
      name: catalogs[locale].reading.exitExam.title,
    });
  const finishButton = (page: Page, locale: Locale = "en") =>
    sheet(page, locale).getByRole("button", {
      name: catalogs[locale].reading.finish.button,
    });
  const finishedHeading = (page: Page) =>
    page.getByRole("heading", { level: 1 });

  async function startExam(page: Page, locale: Locale = "en") {
    await page.goto(`/${locale}/reading/${TEST}?mode=exam`);
    await page
      .getByRole("button", { name: catalogs[locale].reading.start })
      .click();
    await expect(questionHeading(page, locale, 1)).toBeVisible();
  }

  test("a link can preselect Exam; the test starts only with Start", async ({
    page,
  }) => {
    await page.goto(`/en/reading/${TEST}?mode=exam`);
    await expect(
      page.getByRole("radio", { name: new RegExp(en.reading.mode.exam) }),
    ).toBeChecked();
    await expect(timer(page)).toHaveCount(0);
    await page.getByRole("button", { name: en.reading.start }).click();
    await expect(timer(page)).toBeVisible();
  });

  test("Practice has no timer, and Exit goes straight home", async ({
    page,
  }) => {
    await startPractice(page);
    await expect(timer(page)).toHaveCount(0);
    await exit(page).click();
    await expect(page).not.toHaveURL(/\/reading\//);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Exam counts down from 60:00 and keeps running across a reload and while the user is away", async ({
    page,
  }) => {
    await page.clock.setFixedTime(T0);
    await startExam(page);
    await expect(timer(page)).toHaveText("60:00");
    await expect(timer(page)).toHaveAccessibleName(
      fill(en.reading.timer.label, { time: "60:00" }),
    );

    await page.clock.setFixedTime(T0 + MINUTE + 1000);
    await expect(timer(page)).toHaveText("58:59");
    await page.reload();
    await expect(timer(page)).toHaveText("58:59");

    await exit(page).click();
    await expect(exitDialog(page)).toContainText(en.reading.exitExam.body);
    await exitDialog(page)
      .getByRole("link", { name: en.reading.exitExam.leave })
      .click();
    await expect(page).not.toHaveURL(/\/reading\//);
    await page.clock.setFixedTime(T0 + 11 * MINUTE);
    await page.goto(`/en/reading/${TEST}`);
    await expect(timer(page)).toHaveText("49:00");
  });

  test("Exit in Exam Mode asks first; Stay and Escape keep the user in the test", async ({
    page,
  }) => {
    await startExam(page);
    await exit(page).click();
    await expect(
      exitDialog(page).getByRole("button", { name: en.reading.exitExam.stay }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(exitDialog(page)).toBeHidden();
    await expect(exit(page)).toBeFocused();

    await exit(page).click();
    await exitDialog(page)
      .getByRole("button", { name: en.reading.exitExam.stay })
      .click();
    await expect(exitDialog(page)).toBeHidden();
    await expect(exit(page)).toBeFocused();
    await expect(questionHeading(page, "en", 1)).toBeVisible();
  });

  test("warns at 10 and 5 minutes left, shows the time bolder from 5 minutes, and finishes the test at 0:00", async ({
    page,
  }) => {
    const t = translate("en");
    await page.clock.setFixedTime(T0);
    await startExam(page);
    await choose(page, "TRUE");
    await expect(timer(page)).toHaveCSS("font-weight", "700");

    await page.clock.setFixedTime(T0 + 50 * MINUTE);
    await expect(timer(page)).toHaveText("10:00");
    await expect(
      page.getByText(t("reading.timer.warning", { minutes: 10 })),
    ).toBeAttached();
    await page.clock.setFixedTime(T0 + 55 * MINUTE);
    await expect(timer(page)).toHaveText("05:00");
    await expect(
      page.getByText(t("reading.timer.warning", { minutes: 5 })),
    ).toBeAttached();
    await expect(timer(page)).toHaveCSS("font-weight", "800");

    await page.clock.setFixedTime(T0 + 60 * MINUTE);
    await expect(finishedHeading(page)).toContainText(
      en.reading.finished.timeUp,
    );
    await expect(finishedHeading(page)).toContainText(
      en.reading.finished.title,
    );
    await expect(finishedHeading(page)).toBeFocused();
    await expect(
      page.getByText(
        fill(en.reading.finished.answered, { answered: 1, total: 40 }),
      ),
    ).toBeVisible();
    await expect(page.getByText(en.reading.finished.notChecked)).toBeVisible();
    await expect(timer(page)).toHaveCount(0);

    // Opening the test again shows the finished page.
    await page.reload();
    await expect(finishedHeading(page)).toContainText(
      en.reading.finished.timeUp,
    );
  });

  test("an Exam whose time ran out while the user was away opens finished", async ({
    page,
  }) => {
    await page.clock.setFixedTime(T0);
    await startExam(page);
    await exit(page).click();
    await exitDialog(page)
      .getByRole("link", { name: en.reading.exitExam.leave })
      .click();
    await expect(page).not.toHaveURL(/\/reading\//);

    await page.clock.setFixedTime(T0 + 75 * MINUTE);
    await page.goto(`/en/reading/${TEST}`);
    await expect(finishedHeading(page)).toContainText(
      en.reading.finished.timeUp,
    );
    await expect(
      page.getByText(
        fill(en.reading.finished.answered, { answered: 0, total: 40 }),
      ),
    ).toBeVisible();
  });

  test("Finish test on question 40 asks first, shows the finished page, and Start again begins a new session", async ({
    page,
  }) => {
    const t = translate("en");
    await startPractice(page);
    await choose(page, "TRUE");
    await goToQuestion(page, 40);
    await expect(
      sheet(page).getByRole("button", { name: en.reading.question.next }),
    ).toHaveCount(0);

    await finishButton(page).click();
    await expect(
      sheet(page).getByRole("heading", { name: en.reading.finish.title }),
    ).toBeFocused();
    await expect(sheet(page)).toContainText(
      t("reading.finish.unanswered", { count: 39 }),
    );
    await sheet(page)
      .getByRole("button", { name: en.reading.finish.cancel })
      .click();
    await expect(finishButton(page)).toBeFocused();

    await finishButton(page).click();
    await sheet(page)
      .getByRole("button", { name: en.reading.finish.confirm, exact: true })
      .click();
    await expect(finishedHeading(page)).toHaveText(en.reading.finished.title);
    await expect(finishedHeading(page)).toBeFocused();
    await expect(
      page.getByText(
        fill(en.reading.finished.answered, { answered: 1, total: 40 }),
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: en.common.goHome }),
    ).toBeVisible();
    await page.reload();
    await expect(finishedHeading(page)).toHaveText(en.reading.finished.title);

    await page.getByRole("button", { name: en.reading.finished.again }).click();
    await expect(
      page.getByRole("radio", { name: new RegExp(en.reading.mode.practice) }),
    ).toBeChecked();
    await page.getByRole("button", { name: en.reading.start }).click();
    await expect(questionHeading(page, "en", 1)).toBeVisible();
    await expect(page.getByRole("radio", { name: "TRUE" })).not.toBeChecked();
  });

  test("Finish test also ends the navigator; Keep working and Escape return to All questions", async ({
    page,
  }) => {
    const t = translate("en");
    const allQuestions = page.getByRole("button", {
      name: en.reading.navigator.open,
    });
    await startPractice(page);
    await allQuestions.click();
    await finishButton(page).click();
    await expect(sheet(page)).toContainText(
      t("reading.finish.unanswered", { count: 40 }),
    );
    await page.keyboard.press("Escape");
    await expect(allQuestions).toBeFocused();

    await allQuestions.click();
    await finishButton(page).click();
    await sheet(page)
      .getByRole("button", { name: en.reading.finish.cancel })
      .click();
    await expect(allQuestions).toBeFocused();
  });

  test("Practice warns when a typed answer has more words than the instruction allows", async ({
    page,
  }) => {
    const warning = translate("en")("reading.wordLimit", { max: 2 });
    const field = page.getByRole("textbox", {
      name: fill(en.reading.answer.label, { number: 10 }),
    });
    await startPractice(page);
    await goToQuestion(page, 10);
    await field.fill("narrow lanes");
    await expect(sheet(page).getByText(warning)).toHaveCount(0);
    await field.fill("the narrow lanes");
    await expect(sheet(page).getByText(warning)).toBeVisible();
    await expect(field).toHaveAccessibleDescription(warning);
  });

  test("Exam Mode gives no word-limit warning", async ({ page }) => {
    await startExam(page);
    await goToQuestion(page, 10);
    await page
      .getByRole("textbox", {
        name: fill(en.reading.answer.label, { number: 10 }),
      })
      .fill("the narrow lanes");
    await expect(
      sheet(page).getByText(translate("en")("reading.wordLimit", { max: 2 })),
    ).toHaveCount(0);
  });

  for (const locale of ["ru", "uz"] as const) {
    test(`the timer, the exit dialog, the finish confirmation and the finished page fit 320 px in /${locale} without WCAG 2.2 AA violations`, async ({
      page,
    }) => {
      const axe = async () =>
        expect(
          (
            await new AxeBuilder({ page })
              .withTags([
                "wcag2a",
                "wcag2aa",
                "wcag21a",
                "wcag21aa",
                "wcag22aa",
              ])
              .analyze()
          ).violations,
        ).toEqual([]);
      await page.setViewportSize({ width: 320, height: 640 });
      await page.clock.setFixedTime(T0);
      await startExam(page, locale);
      await expect(timer(page)).toHaveText("60:00");
      await noOverflow(page);

      await exit(page, locale).click();
      await expect(exitDialog(page, locale)).toBeVisible();
      await noOverflow(page);
      await axe();
      await page.keyboard.press("Escape");

      await goToQuestion(page, 40, locale);
      await finishButton(page, locale).click();
      await expect(
        sheet(page, locale).getByRole("heading", {
          name: catalogs[locale].reading.finish.title,
        }),
      ).toBeFocused();
      await noOverflow(page);
      await axe();

      await sheet(page, locale)
        .getByRole("button", {
          name: catalogs[locale].reading.finish.confirm,
          exact: true,
        })
        .click();
      await expect(finishedHeading(page)).toHaveText(
        catalogs[locale].reading.finished.title,
      );
      await noOverflow(page);
      await axe();
    });
  }
});
