import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  use: { baseURL },
  projects: [
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 360, height: 800 } },
      // The desktop Reading layout exists only in a wide window.
      testIgnore: "reading-desktop.spec.ts",
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  // Tests run against the production build, never a dev server.
  webServer: {
    command: `pnpm build && pnpm start --port ${port}`,
    url: `${baseURL}/uz`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
