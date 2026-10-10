import {
  Body,
  Controller,
  Get,
  INestApplication,
  Post,
  Query,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import request from "supertest";
import { App } from "supertest/types.js";
import { AppModule } from "./../src/app.module.js";

// Test-only endpoints: AppModule has no endpoint that takes input yet.
class AnswerDto {
  @IsString()
  @MinLength(1)
  value!: string;
}

class AnswerSheetDto {
  @IsInt()
  @Min(1)
  @Max(40)
  questionCount!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}

class PageQueryDto {
  @Type(() => Number)
  @IsInt()
  limit!: number;
}

@Controller("test")
class TestController {
  @Post("answer-sheets")
  submit(@Body() sheet: AnswerSheetDto) {
    return { isDto: sheet instanceof AnswerSheetDto, sheet };
  }

  @Get("items")
  list(@Query() query: PageQueryDto) {
    return { limit: query.limit, type: typeof query.limit };
  }

  @Get("failure")
  fail(): never {
    throw new Error("connect to db with password hunter2");
  }
}

const validSheet = {
  questionCount: 2,
  answers: [{ value: "B" }, { value: "C" }],
};

describe("Input validation and error format (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestController],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const post = (body: unknown) =>
    request(app.getHttpServer())
      .post("/test/answer-sheets")
      .send(body as object);

  it("passes a valid payload to the handler as a DTO instance", async () => {
    const response = await post(validSheet).expect(201);

    expect(response.body).toEqual({ isDto: true, sheet: validSheet });
  });

  it("rejects an unknown property instead of dropping it", async () => {
    const response = await post({ ...validSheet, isAdmin: true }).expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "validation_failed",
      message: "Request validation failed",
      errors: [{ field: "isAdmin", constraints: ["whitelistValidation"] }],
    });
  });

  it("rejects a wrong type without echoing the value", async () => {
    const response = await post({
      ...validSheet,
      questionCount: "secret-17",
    }).expect(400);

    expect(response.body.errors).toEqual([
      { field: "questionCount", constraints: ["max", "min", "isInt"] },
    ]);
    expect(JSON.stringify(response.body)).not.toContain("secret-17");
  });

  it("names the path of an invalid nested value", async () => {
    const response = await post({
      ...validSheet,
      answers: [{ value: "B" }, { value: "" }],
    }).expect(400);

    expect(response.body.errors).toEqual([
      { field: "answers.1.value", constraints: ["minLength"] },
    ]);
  });

  it("converts query values only where a DTO declares it", async () => {
    const valid = await request(app.getHttpServer())
      .get("/test/items?limit=5")
      .expect(200);
    expect(valid.body).toEqual({ limit: 5, type: "number" });

    const invalid = await request(app.getHttpServer())
      .get("/test/items?limit=many")
      .expect(400);
    expect(invalid.body.errors).toEqual([
      { field: "limit", constraints: ["isInt"] },
    ]);
  });

  it("answers malformed JSON with 400 bad_request without quoting it", async () => {
    const response = await request(app.getHttpServer())
      .post("/test/answer-sheets")
      .set("Content-Type", "application/json")
      .send('{"questionCount": secret-17')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "bad_request",
      message: "Bad Request",
    });
  });

  it("answers an oversized body with 413 payload_too_large", async () => {
    const response = await post({
      ...validSheet,
      padding: "x".repeat(200_000),
    }).expect(413);

    expect(response.body).toEqual({
      statusCode: 413,
      code: "payload_too_large",
      message: "Payload Too Large",
    });
  });

  it("answers an unknown route with 404 not_found without echoing the path", async () => {
    const response = await request(app.getHttpServer())
      .get("/does-not-exist")
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      code: "not_found",
      message: "Not Found",
    });
  });

  it("hides the details of an unexpected error", async () => {
    const response = await request(app.getHttpServer())
      .get("/test/failure")
      .expect(500);

    expect(response.body).toEqual({
      statusCode: 500,
      code: "internal_error",
      message: "Internal server error",
    });
  });
});
