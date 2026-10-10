import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Resolves the "@/*" alias from tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    // e2e/ holds Playwright specs.
    include: ["src/**/*.test.{ts,tsx}"],
    // next-intl imports "next/navigation", which Node cannot resolve from its
    // ESM build; inlining lets Vite resolve it (next-intl testing guide).
    server: { deps: { inline: ["next-intl"] } },
  },
});
