import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types.js";
import { AppModule } from "./../src/app.module.js";

describe("GET /health (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("returns ok", () => {
    return request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect({ status: "ok" });
  });

  afterEach(async () => {
    await app.close();
  });
});

describe("GET /health/ready (e2e)", () => {
  async function startApp(): Promise<INestApplication<App>> {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleFixture.createNestApplication<INestApplication<App>>({
      logger: false,
    });
    await app.init();
    return app;
  }

  it("returns ok when the database answers", async () => {
    const app = await startApp();

    await request(app.getHttpServer())
      .get("/health/ready")
      .expect(200)
      .expect({ status: "ok" });
    await app.close();
  });

  it("returns 503 in the API error format when the database is unreachable", async () => {
    const databaseUrl = process.env.DATABASE_URL;
    // Port 9 (discard) has no PostgreSQL listening on any normal machine.
    process.env.DATABASE_URL =
      "postgresql://ielts_prep:not-a-secret@127.0.0.1:9/ielts_prep";
    let app: INestApplication<App>;
    try {
      app = await startApp();
    } finally {
      process.env.DATABASE_URL = databaseUrl;
    }

    const response = await request(app.getHttpServer())
      .get("/health/ready")
      .expect(503);
    await app.close();

    expect(response.body).toEqual({
      statusCode: 503,
      code: "service_unavailable",
      message: "Service Unavailable",
    });
  });
});
