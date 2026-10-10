import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/i18n/routing";

type Locale = (typeof routing.locales)[number];

const catalogs = { uz, ru, en };

async function expectNotFoundPage(page: Page, path: string, locale: Locale) {
  const response = await page.goto(path);
  expect(response?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);

  const messages = catalogs[locale];
  await expect(
    page.getByRole("heading", { level: 1, name: messages.notFound.title }),
  ).toBeVisible();
  await expect(page.getByText(messages.notFound.body)).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: messages.common.goHome }),
  ).toHaveAttribute("href", `/${locale}`);
  await expect(page.getByText("This page could not be found")).toHaveCount(0);
}

// A browser language that matches no locale, so redirects fall back to uz.
test.use({ locale: "de-DE" });

for (const locale of routing.locales) {
  test(`an unknown path in /${locale} shows the ${locale} not-found page with status 404`, async ({
    page,
  }) => {
    await expectNotFoundPage(page, `/${locale}/does-not-exist`, locale);
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test(`the /${locale} not-found page has no WCAG 2.2 AA violations`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/does-not-exist`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("a path with a file extension under a locale uses that locale", async ({
  page,
}) => {
  await expectNotFoundPage(page, "/ru/old-page.html", "ru");
});

for (const path of ["/old-page.html", "/api/does-not-exist"]) {
  test(`${path}, outside locale routing, shows the uz not-found page with status 404`, async ({
    page,
  }) => {
    await expectNotFoundPage(page, path, "uz");
    expect(new URL(page.url()).pathname).toBe(path);
  });
}

test("an unknown path without a locale redirects to the detected locale and shows its not-found page", async ({
  page,
}) => {
  await expectNotFoundPage(page, "/does-not-exist", "uz");
  expect(new URL(page.url()).pathname).toBe("/uz/does-not-exist");
});
