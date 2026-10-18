import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import { catalogs, fill, noOverflow } from "./reading";

// The temporary Listening test end to end (M8-20), in every interface
// language: a learner finds it, practises with the real audio, answers in
// each part, and finishes; the Exam's clock reaches its check time.

const TEST = "temporary-voa-1";
const desktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

for (const locale of routing.locales) {
  const m = catalogs[locale];
  test(`a Practice journey from the Hub to the finished page in /${locale}`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/practice`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page
      .getByRole("link", { name: /Temporary Listening Practice 1/ })
      .click();
    await page.getByRole("button", { name: m.reading.start }).click();

    const play = page.getByRole("button", { name: m.listening.player.play });
    await play.click();
    await expect(
      page.getByRole("button", { name: m.listening.player.pause }),
    ).toBeVisible();
    await page.getByRole("button", { name: m.listening.player.pause }).click();

    await page
      .getByRole("textbox", {
        name: fill(m.reading.answer.label, { number: 1 }),
        exact: true,
      })
      .fill("bus");
    // Part 4, by the navigator of this layout.
    if (desktop(page))
      await page
        .getByRole("button", {
          name: fill(m.listening.navigator.partProgress, {
            number: 4,
            answered: 0,
            total: 10,
          }),
        })
        .click();
    else {
      await page
        .getByRole("button", { name: m.reading.navigator.open })
        .first()
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button")
        .filter({ hasText: /^31$/ })
        .click();
    }
    await expect(
      page.getByText(fill(m.listening.partOf, { number: 4, total: 4 })),
    ).toBeVisible();
    await page
      .getByRole("textbox", {
        name: fill(m.reading.answer.label, { number: 36 }),
        exact: true,
      })
      .fill("his childhood dog");
    expect((await axe(page)).violations).toEqual([]);

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
    await expect(
      page.getByRole("heading", { name: m.listening.finished.title }),
    ).toBeVisible();
    await expect(
      page.getByText(
        fill(m.listening.finished.answered, { answered: 2, total: 40 }),
      ),
    ).toBeVisible();
    await noOverflow(page);
    expect((await axe(page)).violations).toEqual([]);

    // The Hub knows it is finished.
    await page.goto(`/${locale}/practice`);
    await expect(
      page.getByRole("link", { name: /Temporary Listening Practice 1/ }),
    ).toContainText(m.practice.state.finishedNoScore);
  });
}

test("at 200% zoom the Listening screen fits without sideways scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 400 });
  await page.goto(`/en/listening/${TEST}`);
  await page.evaluate(() => {
    localStorage.clear();
    document.documentElement.style.fontSize = "200%";
  });
  await page.reload();
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await page.getByRole("button", { name: catalogs.en.reading.start }).click();
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await expect(
    page.getByRole("region", { name: catalogs.en.listening.player.label }),
  ).toBeVisible();
  await noOverflow(page);
});

test("with reduced motion nothing on the Listening screen animates", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/en/listening/${TEST}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: catalogs.en.reading.start }).click();
  await page
    .getByRole("button", { name: catalogs.en.listening.player.play })
    .click();
  // Reduced motion leaves transitions of 0.01 ms (globals.css); none longer.
  const longer = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((a) => Number(a.effect?.getTiming().duration ?? 0) > 1).length,
  );
  expect(longer).toBe(0);
});

test("an Exam reaches its 2 minutes to check when the recording is over, and then finishes by itself", async ({
  page,
}) => {
  await page.goto(`/en/listening/${TEST}?mode=exam`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: catalogs.en.reading.start }).click();
  await page
    .getByRole("button", { name: catalogs.en.listening.prepare.start })
    .click({ timeout: 60_000 });
  await expect(
    page.getByText(fill(catalogs.en.listening.exam.playing, { number: 1 })),
  ).toBeVisible();
  // Move the stored start back by the whole recording (27 min 13 s) and 30 s, and reload:
  // the clock is derived from it, so the check time is reached at once.
  await page.evaluate((id) => {
    const key = `listening:${id}`;
    const stored = JSON.parse(localStorage.getItem(key)!);
    stored.session.exam.recordingStartedAt -= 1_663_286; // the recording plus 30 s
    stored.session.exam.lastActiveAt = Date.now();
    localStorage.setItem(key, JSON.stringify(stored));
  }, TEST);
  await page.reload();
  await page
    .getByRole("button", { name: catalogs.en.listening.resume.continue })
    .click({ timeout: 60_000 })
    .catch(() => undefined);
  await expect(page.getByRole("timer")).toContainText("Time to check");
  await page.evaluate((id) => {
    const key = `listening:${id}`;
    const stored = JSON.parse(localStorage.getItem(key)!);
    stored.session.exam.recordingStartedAt -= 200_000;
    localStorage.setItem(key, JSON.stringify(stored));
  }, TEST);
  await page.reload();
  await expect(page.getByText(catalogs.en.reading.finished.timeUp)).toBeVisible(
    { timeout: 15_000 },
  );
});
