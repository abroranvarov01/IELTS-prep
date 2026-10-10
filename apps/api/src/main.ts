import { NestFactory } from "@nestjs/core";
import { existsSync } from "node:fs";
import { AppModule } from "./app.module.js";
import { setUpApiDocs } from "./openapi.js";

// Default port when PORT is not set; see .env.example.
const DEFAULT_PORT = 3001;

// Local development reads apps/api/.env. CI and deployments set the variables
// directly, and exported values win over the file.
if (existsSync(".env")) process.loadEnvFile(".env");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Runs onModuleDestroy on SIGTERM, so database connections close cleanly.
  app.enableShutdownHooks();
  setUpApiDocs(app, process.env);
  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
await bootstrap();
