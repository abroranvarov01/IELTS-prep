import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Local development reads apps/api/.env. CI and deployments set the variables
// directly, and exported values win over the file.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Read without env() so that prisma generate works without a database URL.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
