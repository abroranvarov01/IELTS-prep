import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";
import createNextIntlPlugin from "next-intl/plugin";

// The request config lives with the other i18n setup in shared (ADR-0010).
const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

const nextConfig: NextConfig = {
  // CLAUDE.md is the single agent guide; stop `next dev` writing AGENTS.md.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["72.62.134.148", "100.110.13.34", "185.139.138.138"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withSerwist(withNextIntl(nextConfig));
