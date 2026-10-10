import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/i18n/routing";
import { saveGoal } from "./goal";

type Locale = (typeof routing.locales)[number];

const catalogs = { uz, ru, en };

function switcherButton(page: Page, locale: Locale) {
  const { label, code, languages } = catalogs[locale].languageSwitcher;
  const name = label
    .replace("{code}", code)
    .replace("{language}", languages[locale]);
  // A native <summary>. Chromium exposes it as a disclosure control, which
  // Playwright's role queries do not cover, so it is found by its name.
  return page.getByRole("banner").getByLabel(name, { exact: true });
}

function languageLink(page: Page, from: Locale, to: Locale) {
  return page
    .getByRole("list", { name: catalogs[from].languageSwitcher.listLabel })
    .getByRole("link", { name: catalogs[from].languageSwitcher.languages[to] });
}

// These tests visit home as a returning user (home sends a new one to onboarding).
test.beforeEach(async ({ context, baseURL }) => {
  await saveGoal(context, baseURL);
});

/**
 * Escape, tapping outside, and choosing the current language need JavaScript.
 * The list itself works without it, so tests of those behaviors first wait
 * until hydration has finished and the main thread is idle.
 */
async function untilInteractive(page: Page) {
  await page.evaluate(
    () => new Promise((resolve) => requestIdleCallback(resolve)),
  );
}

// A browser language that matches none of the targets, so a redirect from /
// can only come from the saved choice.
test.use({ locale: "de-DE" });

for (const target of ["ru", "en"] as const) {
  test(`switching from /uz to /${target} changes the address and the page language, and / remembers it`, async ({
    page,
  }) => {
    await page.goto("/uz");
    await switcherButton(page, "uz").click();
    await languageLink(page, "uz", target).click();

    await expect(page).toHaveURL(`/${target}`);
    await expect(page.locator("html")).toHaveAttribute("lang", target);
    await expect(switcherButton(page, target)).toBeVisible();

    await page.goto("/");
    await expect(page).toHaveURL(`/${target}`);
  });
}

test("the list names every language in its own language and marks the current one", async ({
  page,
}) => {
  await page.goto("/ru");
  await switcherButton(page, "ru").click();
  for (const locale of routing.locales) {
    const link = languageLink(page, "ru", locale);
    await expect(link).toHaveAttribute("lang", locale);
    await expect(link).toHaveAttribute("href", `/${locale}`);
  }
  await expect(languageLink(page, "ru", "ru")).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect(languageLink(page, "ru", "uz")).not.toHaveAttribute(
    "aria-current",
  );
});

test("choosing the current language closes the list and stays on the page", async ({
  page,
}) => {
  await page.goto("/uz");
  await untilInteractive(page);
  await switcherButton(page, "uz").click();
  await languageLink(page, "uz", "uz").click();

  await expect(languageLink(page, "uz", "en")).toBeHidden();
  await expect(page).toHaveURL("/uz");
});

test("works with the keyboard only", async ({ page }) => {
  await page.goto("/uz");
  await untilInteractive(page);
  const button = switcherButton(page, "uz");
  // Skip link, logo, switcher.
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  await expect(button).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(languageLink(page, "uz", "en")).toBeVisible();
  // Escape from inside the list closes it and returns focus to the button.
  await page.keyboard.press("Tab");
  await expect(languageLink(page, "uz", "uz")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(languageLink(page, "uz", "en")).toBeHidden();
  await expect(button).toBeFocused();

  await page.keyboard.press("Enter");
  // uz, ru, en: the third link is English.
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  await expect(languageLink(page, "uz", "en")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/en");
});

test("Escape closes a list that was opened before the page finished loading", async ({
  page,
}) => {
  // Hold the JavaScript back, so the native disclosure opens before React
  // hydrates and React never sees that toggle (the cause of the old flake).
  let releaseScripts = () => {};
  const scriptsHeld = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/_next/static/chunks/**", async (route) => {
    await scriptsHeld;
    await route.continue();
  });
  await page.goto("/uz", { waitUntil: "commit" });
  const button = switcherButton(page, "uz");
  await expect(button).toBeVisible();
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(languageLink(page, "uz", "en")).toBeVisible();

  releaseScripts();
  // Once the page is interactive, Escape from inside the list closes it.
  await expect(async () => {
    await languageLink(page, "uz", "uz").focus();
    await page.keyboard.press("Escape");
    await expect(languageLink(page, "uz", "en")).toBeHidden({ timeout: 500 });
  }).toPass({ timeout: 20_000 });
  await expect(button).toBeFocused();
});

test("tapping outside closes the list", async ({ page }) => {
  await page.goto("/uz");
  await untilInteractive(page);
  await switcherButton(page, "uz").click();
  await expect(languageLink(page, "uz", "en")).toBeVisible();

  await page.getByRole("main").click();
  await expect(languageLink(page, "uz", "en")).toBeHidden();
});

test("the open list fits 320 px without horizontal scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/uz");
  await switcherButton(page, "uz").click();
  await expect(languageLink(page, "uz", "en")).toBeVisible();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

for (const locale of routing.locales) {
  test(`/${locale} with the list open has no WCAG 2.2 AA violations`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);
    await switcherButton(page, locale).click();
    await expect(languageLink(page, locale, "en")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
