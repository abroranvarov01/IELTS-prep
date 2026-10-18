import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import uz from "../messages/uz.json";
import { routing } from "../src/shared/i18n/routing";
import { saveGoal } from "./goal";

// The product navigation (USER_FLOWS.md, Navigation and Practice Hub (M6)):
// a bar at the bottom on phones, links in the header from the tablet
// breakpoint (600 px), on shell pages only.

const catalogs = { uz, ru, en };

test.beforeEach(async ({ context, baseURL }) => {
  await saveGoal(context, baseURL);
});

const navigation = (page: Page, locale: keyof typeof catalogs = "en") =>
  page.getByRole("navigation", { name: catalogs[locale].nav.label });

test("on phones the navigation is a bar at the bottom, Home marked as the current page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/en");
  const nav = navigation(page);
  await expect(nav).toHaveCount(1);
  const box = await nav.boundingBox();
  expect(box && box.y + box.height).toBeCloseTo(800, 0);
  await expect(nav.getByRole("link", { name: en.nav.home })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const practice = nav.getByRole("link", { name: en.nav.practice });
  await expect(practice).not.toHaveAttribute("aria-current");
  await expect(practice).toHaveAttribute("href", "/en/practice");
  // Nothing in main hides behind the bar.
  const goal = page.getByRole("link", { name: en.home.goal.change });
  const goalBox = await goal.boundingBox();
  expect(goalBox && box && goalBox.y + goalBox.height <= box.y).toBe(true);
});

for (const width of [600, 1280])
  test(`from the tablet breakpoint the navigation is in the header (${width} px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/en");
    const nav = navigation(page);
    await expect(nav).toHaveCount(1);
    await expect(
      page.getByRole("banner").getByRole("navigation"),
    ).toBeVisible();
    await expect(nav.getByRole("link", { name: en.nav.home })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

test("onboarding and the Reading test screen have no product navigation; not-found has it", async ({
  page,
}) => {
  await page.goto("/en/start/exam");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);

  await page.goto("/en/reading/demo-academic-1");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(navigation(page)).toHaveCount(0);

  await page.goto("/en/no-such-page");
  await expect(navigation(page)).toHaveCount(1);
  await expect(
    navigation(page).getByRole("link", { name: en.nav.home }),
  ).not.toHaveAttribute("aria-current");
});

test("the keyboard reaches the navigation after the skip link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en");
  await page.keyboard.press("Tab"); // the skip link
  await page.keyboard.press("Tab"); // the logo
  await page.keyboard.press("Tab");
  await expect(
    navigation(page).getByRole("link", { name: en.nav.home }),
  ).toBeFocused();
});

for (const locale of routing.locales)
  for (const width of [320, 600])
    test(`fits ${width} px in /${locale} and has no WCAG 2.2 AA violations`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/${locale}`);
      await expect(navigation(page, locale)).toBeVisible();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
      const clipped = await navigation(page, locale)
        .getByRole("link")
        .evaluateAll(
          (links) =>
            links.filter((l) => l.scrollWidth > l.clientWidth + 1).length,
        );
      expect(clipped).toBe(0);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
