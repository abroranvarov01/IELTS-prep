import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import { saveGoal } from "./goal";
import { catalogs, fill, noOverflow } from "./reading";

// The level check's Listening section (M9-12; USER_FLOWS.md, The level check
// with two sections): the intro's two rows, the play-once player with Pause
// and an exact resume, the pause counted, the result with its
// qualifications, both sections side by side, and Home afterwards.

const FORM = "level-check-listening-a";
const READING_FORM = "level-check-reading-a";
const en = catalogs.en;
const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

/** The key's answers: all 14 correct. */
const KEY: Record<string, string> = {
  "1": "day",
  "2": "cafeteria",
  "3": "basement",
  "4": "apartment",
  "5": "B",
  "6": "C",
  "7": "A",
  "8": "month",
  "9": "51 percent",
  "10": "399",
  "11": "BASIC",
  "12": "Ukraine",
  "13": "B",
  "14": "A",
};

/** A Listening section in progress on the device, with `correct` right answers and these counts. */
async function seedListening(
  page: Page,
  correct: number,
  check = { pauses: 0, interruptions: 0 },
) {
  await page.goto("/en");
  const answers = Object.fromEntries(
    Object.entries(KEY).filter(([n]) => Number(n) <= correct),
  );
  await page.evaluate(([key, json]) => localStorage.setItem(key, json), [
    `listening:${FORM}`,
    JSON.stringify({
      schema: 1,
      session: {
        sessionId: "s-00000000-0000-4000-8000-00000000a11c",
        testId: FORM,
        testVersion: 1,
        mode: "practice",
        status: "inProgress",
        startedAt: Date.now() - 600_000,
        currentQuestion: 14,
        answers,
        flagged: [],
        view: { part: 2, scroll: {} },
        practice: { positions: {}, speed: 1 },
        check,
      },
    }),
  ] as const);
}

async function finishListening(page: Page) {
  await page.goto("/en/level-check/listening?resume=1");
  await page
    .getByRole("button", { name: en.levelCheck.finish.button, exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: en.reading.finish.confirm, exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/level-check\/result\?attempt=/);
}

for (const locale of routing.locales) {
  const m = catalogs[locale];
  test(`the intro offers both sections and the Listening section is the check's player in /${locale}`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/level-check`);
    for (const text of [
      m.levelCheck.sections.reading,
      m.levelCheck.sections.listening,
      m.levelCheck.listening.playsOnce,
      m.levelCheck.listening.temporaryAudio,
    ])
      await expect(page.getByText(text)).toBeVisible();
    await noOverflow(page);
    expect((await axe(page)).violations).toEqual([]);

    await page
      .getByRole("button", { name: m.levelCheck.startSection.listening })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/level-check/listening\\?start=\\d+$`),
    );
    await expect(
      page.getByText(
        fill(m.levelCheck.listening.recordingOf, { number: 1, total: 2 }),
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: m.levelCheck.listening.play }),
    ).toBeVisible();
    // No seeking, speed or "Mark for review" in the check.
    await expect(page.getByRole("slider")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: m.reading.flag.add }),
    ).toHaveCount(0);
    await noOverflow(page);
    expect((await axe(page)).violations).toEqual([]);
  });
}

test("a pause is counted and the recording continues from exactly where it stopped", async ({
  page,
}) => {
  await page.goto("/en/level-check");
  await page
    .getByRole("button", { name: en.levelCheck.startSection.listening })
    .click();
  await page
    .getByRole("button", { name: en.levelCheck.listening.play })
    .click();
  const pause = page.getByRole("button", { name: en.listening.player.pause });
  await expect(pause).toBeVisible();
  await expect
    .poll(() =>
      page.locator("audio").evaluate((a: HTMLAudioElement) => a.currentTime),
    )
    .toBeGreaterThan(1);
  await pause.click();
  const stored = () =>
    page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "{}").session,
      `listening:${FORM}`,
    );
  await expect.poll(async () => (await stored()).check.pauses).toBe(1);
  // The position is kept when playback stops.
  await expect
    .poll(async () => (await stored()).practice.positions.p1)
    .toBeGreaterThan(1000);
  const saved: number = (await stored()).practice.positions.p1;

  await page.goto("/en/level-check/listening?resume=2");
  await expect(
    page.getByRole("button", { name: en.levelCheck.listening.continue }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("audio")
        .evaluate((a: HTMLAudioElement) => Math.round(a.currentTime * 1000)),
    )
    .toBe(saved);
  expect((await stored()).check).toEqual({ pauses: 1, interruptions: 0 });
});

test("the Listening result is qualified and labelled rough; with Reading too, both stand side by side on separate scales", async ({
  page,
  context,
  baseURL,
}) => {
  await saveGoal(context, baseURL);
  await seedListening(page, 12, { pauses: 2, interruptions: 1 });
  await finishListening(page);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: en.levelCheck.result.titleListening,
    }),
  ).toBeFocused();
  await expect(page.getByText(en.levelCheck.levels[3])).toBeVisible();
  await expect(
    page.getByText(fill(en.reading.results.score, { score: 12, total: 14 })),
  ).toBeVisible();
  for (const text of [
    "Completed with pauses.",
    en.levelCheck.result.playbackInterrupted,
    en.levelCheck.listening.temporaryAudio,
    en.levelCheck.result.listeningRough,
  ])
    await expect(page.getByText(text, { exact: false })).toBeVisible();
  await expect(
    page.getByRole("link", { name: en.levelCheck.result.practiseListening }),
  ).toHaveAttribute("href", "/en/practice#practice-listening");
  await expect(
    page.getByRole("link", { name: en.levelCheck.result.otherSection.reading }),
  ).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);

  // The attempt went to the level check's database, with its counts.
  const attempts = await page.evaluate(
    () =>
      new Promise<Record<string, unknown>[]>((resolve) => {
        const open = indexedDB.open("ielts-prep-level-check");
        open.onsuccess = () => {
          const req = open.result
            .transaction("attempts")
            .objectStore("attempts")
            .getAll();
          req.onsuccess = () =>
            resolve(req.result as Record<string, unknown>[]);
        };
      }),
  );
  expect(attempts).toEqual([
    expect.objectContaining({
      skill: "listening",
      formId: FORM,
      pauses: 2,
      interruptions: 1,
    }),
  ]);

  // The review of the section: out of 14, at the first not correct (13).
  await page
    .getByRole("link", { name: en.levelCheck.result.seeAnswersListening })
    .click();
  await expect(page.locator("#question-heading:visible")).toContainText(
    fill(en.reading.question.of, { number: 13, total: 14 }),
  );

  // Home leads to Listening practice.
  await page.goto("/en");
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: en.levelCheck.result.practiseListening,
    }),
  ).toBeVisible();

  // A finished Reading section too: both side by side, never compared.
  await page.evaluate(([key, json]) => localStorage.setItem(key, json), [
    `reading:${READING_FORM}`,
    JSON.stringify({
      schema: 1,
      session: {
        sessionId: "s-00000000-0000-4000-8000-00000000beef",
        testId: READING_FORM,
        testVersion: 1,
        mode: "practice",
        status: "inProgress",
        startedAt: Date.now() - 600_000,
        currentQuestion: 14,
        answers: { "1": "TRUE", "2": "NOT GIVEN", "3": "TRUE", "4": "FALSE" },
        flagged: [],
        highlights: [],
        pins: {},
        view: { sheet: "partial", passage: 2, scroll: {} },
      },
    }),
  ] as const);
  // The Reading section's sheet, below the desktop breakpoint (as
  // level-check.spec.ts does).
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/en/level-check/reading");
  await page.getByRole("button", { name: en.reading.navigator.open }).click();
  await page
    .getByRole("button", { name: en.levelCheck.finish.button, exact: true })
    .click();
  await page
    .getByRole("button", { name: en.reading.finish.confirm, exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: en.levelCheck.result.titleBoth,
    }),
  ).toBeFocused();
  await expect(
    page.getByRole("heading", { level: 2, name: en.practice.skill.reading }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: en.practice.skill.listening }),
  ).toBeVisible();
  await expect(
    page.getByText(en.levelCheck.result.notComparable),
  ).toBeVisible();
  await noOverflow(page);
  expect((await axe(page)).violations).toEqual([]);

  await page.goto("/en");
  await expect(
    page.getByRole("link", { name: en.home.nextAction.openPractice }),
  ).toHaveAttribute("href", "/en/practice");
});
