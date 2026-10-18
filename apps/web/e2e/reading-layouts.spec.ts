import { expect, type Page, test } from "@playwright/test";
import { catalogs, fill, noOverflow } from "./reading";

// Reading on the shared layouts (M8-17 to M8-19), with Demo Reading Test 2:
// a diagram, a flow chart and a table, answered, checked and reviewed.

const en = catalogs.en;
const desktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

async function goTo(page: Page, number: number, passage: number) {
  if (desktop(page)) {
    // The passage on screen shows its numbers; another passage has a button.
    const other = page.getByRole("button", {
      name: new RegExp(`^Passage ${passage}: `),
    });
    if (await other.first().isVisible()) await other.first().click();
  } else
    await page.getByRole("button", { name: en.reading.navigator.open }).click();
  await page
    .getByRole("button", { name: new RegExp(`^Question ${number},`) })
    .first()
    .click();
}

test("a diagram, a flow chart and a table are answered, checked and reviewed", async ({
  page,
}) => {
  await page.goto("/en/reading/demo-academic-2");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: en.reading.start }).click();

  await expect(
    page
      .getByRole("img", { name: "Diagram of a solar water heater on a roof" })
      .first(),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Answer 1", exact: true })
    .fill("glass");

  await goTo(page, 7, 1);
  await expect(
    page.getByText("How water moves without a pump").first(),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Answer 7", exact: true })
    .fill("lighter");

  await goTo(page, 18, 2);
  if (desktop(page)) await expect(page.getByRole("table")).toBeVisible();
  else {
    await expect(
      page.locator("li", { hasText: "Early libraries" }),
    ).toBeVisible();
    await noOverflow(page);
  }
  await page
    .getByRole("textbox", { name: "Answer 18", exact: true })
    .fill("taxes");

  if (desktop(page))
    await page.getByRole("button", { name: en.reading.finish.button }).click();
  else {
    await page.getByRole("button", { name: en.reading.navigator.open }).click();
    await page.getByRole("button", { name: en.reading.finish.button }).click();
  }
  await page
    .getByRole("button", { name: en.reading.finish.confirm, exact: true })
    .click();
  await expect(
    page
      .getByText(fill(en.reading.results.score, { score: 3, total: 40 }))
      .first(),
  ).toBeVisible({ timeout: 15_000 });
});
