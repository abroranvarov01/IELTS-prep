import { expect, type Page } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/i18n/routing";

// Helpers shared by the Reading specs (the phone and tablet layout, and the
// desktop layout).

export type Locale = (typeof routing.locales)[number];
export const catalogs = { uz, ru, en };
export const TEST = "demo-academic-1";

export function fill(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template,
  );
}

/** Taps an option row, as a user does (the native input inside is visually hidden). */
export async function choose(page: Page, name: string) {
  await page
    .locator("label")
    .filter({ has: page.getByRole("radio", { name, exact: true }) })
    .click();
}

export const sentence = (page: Page, id: string) =>
  page.locator(`main [data-sentence="${id}"]`);
export const actions = (page: Page, locale: Locale = "en") =>
  page.getByRole("group", { name: catalogs[locale].reading.mark.actions });

export async function noOverflow(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
  const clipped = await page
    .locator("h1, h2, p, label, a, button")
    .evaluateAll((elements) =>
      elements
        // Visually hidden elements (the skip link) are 1 px wide by design.
        .filter((e) => e.clientWidth > 1 && e.scrollWidth > e.clientWidth + 1)
        .map((e) => e.textContent),
    );
  expect(clipped).toEqual([]);
}
