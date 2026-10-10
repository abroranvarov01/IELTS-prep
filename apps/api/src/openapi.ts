import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { readFileSync } from "node:fs";

// apps/api/package.json: one level above src/ (tests) and dist/ (built app).
const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

/** The OpenAPI document, generated from the controllers and their classes (ADR-0002 §5). */
export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle("IELTS Prep API")
    .setVersion(version)
    .build();
  return SwaggerModule.createDocument(app, config);
}

/**
 * Serves Swagger UI at /docs and the document at /docs-json, only outside
 * production (ADR-0002 §5). Call before the app is initialized.
 */
export function setUpApiDocs(
  app: INestApplication,
  env: NodeJS.ProcessEnv,
): void {
  if (env.NODE_ENV === "production") return;
  SwaggerModule.setup("docs", app, () => createOpenApiDocument(app));
}
