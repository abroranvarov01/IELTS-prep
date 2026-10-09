import { expect, test } from "@playwright/test";

test("the web app manifest is linked, valid, and its icons load", async ({
  page,
  request,
}) => {
  await page.goto("/uz");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBe("/manifest.webmanifest");

  const response = await request.get(href!);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({
    start_url: "/",
    display: "standalone",
  });
  expect(manifest.name).toBeTruthy();

  const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
  expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect(
    manifest.icons.some(
      (icon: { purpose?: string }) => icon.purpose === "maskable",
    ),
  ).toBe(true);

  for (const icon of manifest.icons as { src: string }[]) {
    const iconResponse = await request.get(icon.src);
    expect(iconResponse.ok(), icon.src).toBe(true);
    expect(iconResponse.headers()["content-type"]).toBe("image/png");
  }
});

test("the service worker registers for the whole site", async ({ page }) => {
  await page.goto("/uz");
  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    return { scope: ready.scope, script: ready.active?.scriptURL };
  });
  expect(registration.script).toMatch(/\/serwist\/sw\.js$/);
  expect(new URL(registration.scope).pathname).toBe("/");
});
