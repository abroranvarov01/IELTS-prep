import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types.js";
import { AppModule } from "./../src/app.module.js";
import { createOpenApiDocument, setUpApiDocs } from "./../src/openapi.js";

async function startApp(
  env: NodeJS.ProcessEnv,
): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleFixture.createNestApplication<INestApplication<App>>({
    logger: false,
  });
  setUpApiDocs(app, env);
  await app.init();
  return app;
}

describe("OpenAPI document (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await startApp({});
  });

  afterAll(async () => {
    await app.close();
  });

  it("describes the health operations with their response classes", () => {
    const { paths } = createOpenApiDocument(app);
    const respondsWith = (responses: Record<string, string>) => ({
      get: {
        responses: Object.fromEntries(
          Object.entries(responses).map(([status, schema]) => [
            status,
            {
              content: {
                "application/json": {
                  schema: { $ref: `#/components/schemas/${schema}` },
                },
              },
            },
          ]),
        ),
      },
    });

    expect(paths["/health"]).toMatchObject(
      respondsWith({ "200": "HealthResponse" }),
    );
    expect(paths["/health/ready"]).toMatchObject(
      respondsWith({ "200": "HealthResponse", "503": "ApiErrorResponse" }),
    );
  });

  it("documents the API error format", () => {
    const schemas = createOpenApiDocument(app).components?.schemas ?? {};

    expect(schemas.ApiErrorResponse).toMatchObject({
      required: ["statusCode", "code", "message"],
      properties: {
        statusCode: { type: "number" },
        code: { type: "string" },
        message: { type: "string" },
        errors: {
          type: "array",
          items: { $ref: "#/components/schemas/FieldError" },
        },
      },
    });
    expect(schemas.FieldError).toMatchObject({
      required: ["field", "constraints"],
      properties: {
        field: { type: "string" },
        constraints: { type: "array", items: { type: "string" } },
      },
    });
  });

  it("serves the document and Swagger UI outside production", async () => {
    const json = await request(app.getHttpServer())
      .get("/docs-json")
      .expect(200);
    expect(Object.keys(json.body.paths)).toEqual(
      expect.arrayContaining(["/health", "/health/ready"]),
    );

    await request(app.getHttpServer())
      .get("/docs")
      .expect(200)
      .expect("Content-Type", /html/);
  });
});

describe("API docs in production (e2e)", () => {
  it("are not served", async () => {
    const app = await startApp({ NODE_ENV: "production" });

    for (const path of ["/docs", "/docs-json"]) {
      const response = await request(app.getHttpServer()).get(path).expect(404);
      expect(response.body.code).toBe("not_found");
    }
    await app.close();
  });
});
