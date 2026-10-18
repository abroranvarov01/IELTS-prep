import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { routing } from "../src/shared/i18n/routing";
import { catalogs, fill, noOverflow } from "./reading";

// The Listening screen (LISTENING_EXPERIENCE.md; USER_FLOWS.md, Listening
// flows (M8)) with the temporary test and its real audio.

const TEST = "temporary-voa-1";
const en = catalogs.en;
const L = en.listening;

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

async function open(page: Page, query = "") {
  await page.goto(`/en/listening/${TEST}${query}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

const desktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

/** The navigator: the bar's part button and cell on desktop, the "All questions" dialog on phones. */
async function goToQuestion(page: Page, number: number) {
  if (desktop(page)) {
    const part = Math.ceil(number / 10);
    await page
      .getByRole("button", { name: new RegExp(`^Part ${part}: `) })
      .click();
  } else
    await page
      .getByRole("button", { name: en.reading.navigator.open })
      .first()
      .click();
  await page
    .getByRole("button", { name: new RegExp(`^Question ${number},`) })
    .click();
}

async function openFinish(page: Page) {
  if (desktop(page))
    await page
      .getByRole("navigation")
      .getByRole("button", { name: en.reading.finish.button })
      .click();
  else {
    await page
      .getByRole("button", { name: en.reading.navigator.open })
      .first()
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: en.reading.finish.button })
      .click();
  }
}

async function startPractice(page: Page) {
  await open(page);
  await page.getByRole("button", { name: en.reading.start }).click();
  await expect(
    page.getByRole("region", { name: L.player.label }),
  ).toBeVisible();
}

test.describe("Listening in Practice", () => {
  test("labels the temporary test and credits its source", async ({ page }) => {
    await open(page);
    await expect(page.getByText(L.temporary.label)).toBeVisible();
    await expect(page.getByText(/VOA Learning English/)).toBeVisible();
  });

  test("plays and pauses the part's recording", async ({ page }) => {
    await startPractice(page);
    const play = page.getByRole("button", { name: L.player.play });
    await expect(play).toBeEnabled();
    await play.click();
    await expect(
      page.getByRole("button", { name: L.player.pause }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.locator("audio").evaluate((a: HTMLAudioElement) => a.currentTime),
      )
      .toBeGreaterThan(0.2);
    await page.getByRole("button", { name: L.player.pause }).click();
    await expect(play).toBeVisible();
  });

  test("keeps answers, the part and the audio position across a reload", async ({
    page,
  }) => {
    await startPractice(page);
    await page
      .getByRole("textbox", {
        name: fill(en.reading.answer.label, { number: 1 }),
        exact: true,
      })
      .fill("bus");
    // Play, move to 0:20, pause: the position is kept on pause.
    await page.getByRole("button", { name: L.player.play }).click();
    await page.getByRole("slider", { name: L.player.position }).fill("20000");
    await page.getByRole("button", { name: L.player.pause }).click();
    await page.reload();
    await expect(
      page.getByRole("textbox", {
        name: fill(en.reading.answer.label, { number: 1 }),
        exact: true,
      }),
    ).toHaveValue("bus");
    await expect
      .poll(() =>
        page
          .locator("audio")
          .evaluate((a: HTMLAudioElement) => Math.round(a.currentTime)),
      )
      .toBe(17);
  });

  test("moves between parts with the navigator and finishes", async ({
    page,
  }) => {
    await startPractice(page);
    await goToQuestion(page, 21);
    await expect(
      page.getByText(fill(L.partOf, { number: 3, total: 4 })),
    ).toBeVisible();
    await page
      .getByRole("radio", { name: /^A, keeps the bees calm/ })
      .first()
      .check({ force: true });
    await openFinish(page);
    await page
      .getByRole("button", { name: en.reading.finish.confirm, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: L.finished.title }),
    ).toBeVisible();
    await expect(
      page.getByText(fill(L.finished.answered, { answered: 1, total: 40 })),
    ).toBeVisible();
    await expect(page.getByText(L.finished.notChecked)).toBeVisible();
  });
});

test.describe("Listening in Exam", () => {
  test("downloads the whole recording first, on a slow connection too, then plays once without controls", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "network throttling uses the Chrome DevTools Protocol",
    );
    await open(page, "?mode=exam");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.enable");
    // About 4 Mbit/s: slow enough to see the progress.
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 500_000,
      uploadThroughput: 100_000,
    });
    await page.getByRole("button", { name: en.reading.start }).click();
    await expect(
      page.getByRole("heading", { name: L.prepare.title }),
    ).toBeVisible();
    await expect(page.getByText(/ of 9\.\d MB$/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: L.prepare.start }),
    ).toBeVisible({ timeout: 60_000 });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    });
    await page.getByRole("button", { name: L.prepare.start }).click();
    await expect(
      page.getByText(fill(L.exam.playing, { number: 1 })),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: L.player.pause }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("slider", { name: L.player.position }),
    ).toHaveCount(0);
    await expect
      .poll(() =>
        page.locator("audio").evaluate((a: HTMLAudioElement) => a.currentTime),
      )
      .toBeGreaterThan(0.2);
  });

  test("asks before leaving and continues where the recording is after a reload", async ({
    page,
  }) => {
    await open(page, "?mode=exam");
    await page.getByRole("button", { name: en.reading.start }).click();
    await page
      .getByRole("button", { name: L.prepare.start })
      .click({ timeout: 60_000 });
    await expect(
      page.getByText(fill(L.exam.playing, { number: 1 })),
    ).toBeVisible();
    await page.getByRole("link", { name: en.reading.exit }).click();
    await expect(page.getByText(L.exitExam.body)).toBeVisible();
    await page.getByRole("button", { name: en.reading.exitExam.stay }).click();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: L.resume.title }),
    ).toBeVisible({ timeout: 60_000 });
    await page.getByRole("button", { name: L.resume.continue }).click();
    await expect(
      page.getByText(fill(L.exam.playing, { number: 1 })),
    ).toBeVisible();
  });
});

for (const locale of routing.locales) {
  test(`the Listening screens have no WCAG 2.2 AA violations and fit 320 px in /${locale}`, async ({
    page,
  }) => {
    const m = catalogs[locale];
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(`/${locale}/listening/${TEST}`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(
      page.getByRole("button", { name: m.reading.start }),
    ).toBeVisible();
    expect((await axe(page)).violations).toEqual([]);
    await noOverflow(page);
    await page.getByRole("button", { name: m.reading.start }).click();
    await expect(
      page.getByRole("region", { name: m.listening.player.label }),
    ).toBeVisible();
    expect((await axe(page)).violations).toEqual([]);
    await noOverflow(page);
  });
}

test("the Practice Hub lists the Listening test with its state", async ({
  page,
}) => {
  await page.goto("/en/practice");
  const row = page.getByRole("link", {
    name: /Temporary Listening Practice 1/,
  });
  await expect(row).toBeVisible();
  await expect(row).toContainText(en.practice.state.notStarted);
  await expect(row).toContainText(L.temporary.label);
  await row.click();
  await expect(page).toHaveURL(/\/en\/listening\/temporary-voa-1$/);
});

test("on desktop, the navigator bar shows the part's numbers and moves to another part", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "the bar is the desktop layout",
  );
  await startPractice(page);
  const bar = page.getByRole("navigation", { name: en.reading.navigator.open });
  await expect(
    bar.getByRole("button", { name: /^Question 10,/ }),
  ).toBeVisible();
  await expect(
    bar.getByRole("button", { name: en.reading.navigator.open }),
  ).toHaveCount(0);
  await bar
    .getByRole("button", {
      name: fill(L.navigator.partProgress, {
        number: 4,
        answered: 0,
        total: 10,
      }),
    })
    .click();
  await expect(
    page.getByText(fill(L.partOf, { number: 4, total: 4 })),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Plan of a home used as a memory palace" }),
  ).toBeVisible();
});

test("answers each kind of question and the navigator counts them", async ({
  page,
}) => {
  await startPractice(page);
  await goToQuestion(page, 11);
  await page
    .getByRole("textbox", { name: "Answer 11", exact: true })
    .fill("members");
  await page
    .getByRole("textbox", { name: "Answer 15", exact: true })
    .fill("classrooms");
  for (const name of [/^A How easy it is to get to/, /^B Whether it is safe/])
    await page
      .locator("label")
      .filter({ has: page.getByRole("checkbox", { name }) })
      .click();
  await expect(
    page.getByText(fill(en.reading.answer.chosenCount, { count: 2, total: 2 })),
  ).toBeVisible();
  await page
    .locator("label")
    .filter({
      has: page.getByRole("radio", { name: /^A They often have enough space/ }),
    })
    .click();
  if (desktop(page))
    await expect(
      page.getByRole("button", { name: /^Question 19, answered/ }),
    ).toBeVisible();
  else {
    await page
      .getByRole("button", { name: en.reading.navigator.open })
      .first()
      .click();
    for (const n of [11, 15, 18, 19, 20])
      await expect(
        page.getByRole("button", {
          name: new RegExp(`^Question ${n}, answered`),
        }),
      ).toBeVisible();
  }
});

test("the table is a table on wide screens and row blocks on phones", async ({
  page,
}) => {
  await startPractice(page);
  await goToQuestion(page, 15);
  const table = page.getByRole("table");
  if (desktop(page)) {
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "How to find members" }),
    ).toBeVisible();
  } else {
    await expect(table).toBeHidden();
    await expect(
      page.getByRole("listitem").filter({ hasText: "Someone at work" }),
    ).toBeVisible();
    await noOverflow(page);
  }
});
