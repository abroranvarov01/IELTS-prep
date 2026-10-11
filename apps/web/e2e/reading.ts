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

// Helpers for the M5 specs (results, review, tabs), in English, on the
// phone layout with the question sheet.

export const sheet = (page: Page) =>
  page.getByRole("region", { name: catalogs.en.reading.sheet.label });

export const questionHeading = (page: Page, number: number) =>
  sheet(page).getByRole("heading", {
    name: fill(catalogs.en.reading.question.of, { number, total: 40 }),
  });

export async function openTest(page: Page) {
  await page.goto(`/en/reading/${TEST}`);
}

/** Starts a new session of the demo test in the given mode. */
export async function startTest(
  page: Page,
  mode: "practice" | "exam" = "practice",
) {
  await page.goto(`/en/reading/${TEST}${mode === "exam" ? "?mode=exam" : ""}`);
  await page.getByRole("button", { name: catalogs.en.reading.start }).click();
  await expect(questionHeading(page, 1)).toBeVisible();
}

/** Opens the finish confirmation from the navigator; returns its "Finish" button. */
export async function askToFinish(page: Page) {
  await page
    .getByRole("button", { name: catalogs.en.reading.navigator.open })
    .click();
  await sheet(page)
    .getByRole("button", { name: catalogs.en.reading.finish.button })
    .click();
  return sheet(page).getByRole("button", {
    name: catalogs.en.reading.finish.confirm,
    exact: true,
  });
}

/** The records of one store of the attempt history (ADR-0009 §2), as stored. */
export function storedRecords(
  page: Page,
  store: "attempts" | "results" | "firstTry",
) {
  return page.evaluate(
    (name) =>
      new Promise<Record<string, unknown>[]>((resolve, reject) => {
        const open = indexedDB.open("ielts-prep-reading");
        open.onsuccess = () => {
          const request = open.result
            .transaction(name, "readonly")
            .objectStore(name)
            .getAll();
          request.onsuccess = () => {
            open.result.close();
            resolve(request.result as Record<string, unknown>[]);
          };
          request.onerror = () => reject(request.error);
        };
        open.onerror = () => reject(open.error);
      }),
    store,
  );
}
