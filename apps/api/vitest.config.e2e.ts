import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// The e2e tests start the whole app, which needs DATABASE_URL. Locally it comes
// from apps/api/.env; exported values win over the file.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    include: ["**/*.e2e-spec.ts"],
  },
});
