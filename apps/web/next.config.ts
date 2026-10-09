import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // CLAUDE.md is the single agent guide; stop `next dev` writing AGENTS.md.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
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
