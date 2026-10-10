import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { toApiErrorResponse } from "./api-exception.filter.js";
import { RequestValidationException } from "./request-validation.js";

/** Shaped like the errors Express body parsers throw (the "http-errors" library). */
function bodyParserError(statusCode: number, message: string): Error {
  return Object.assign(new Error(message), {
    statusCode,
    status: statusCode,
    expose: statusCode < 500,
  });
}

describe("toApiErrorResponse", () => {
  it("reports validation failures with their fields and constraint names", () => {
    const fieldErrors = [
      { field: "answers.0.value", constraints: ["isString"] },
    ];

    expect(
      toApiErrorResponse(new RequestValidationException(fieldErrors)),
    ).toEqual({
      statusCode: 400,
      code: "validation_failed",
      message: "Request validation failed",
      errors: fieldErrors,
    });
  });

  it.each([
    [
      new NotFoundException("Cannot GET /users/42"),
      404,
      "not_found",
      "Not Found",
    ],
    [
      new BadRequestException(`Unexpected token in "{secret"`),
      400,
      "bad_request",
      "Bad Request",
    ],
    [
      new ServiceUnavailableException("Database unreachable"),
      503,
      "service_unavailable",
      "Service Unavailable",
    ],
  ])(
    "names other HTTP errors after their status, without the exception's message",
    (exception, statusCode, code, message) => {
      expect(toApiErrorResponse(exception)).toEqual({
        statusCode,
        code,
        message,
      });
    },
  );

  it.each([
    ["an unexpected error", new Error("connect to db with password hunter2")],
    ["an explicit 500", new InternalServerErrorException("password hunter2")],
    ["a thrown non-error value", "password hunter2"],
  ])("turns %s into a generic internal_error", (_, exception) => {
    expect(toApiErrorResponse(exception)).toEqual({
      statusCode: 500,
      code: "internal_error",
      message: "Internal server error",
    });
  });

  it.each([
    [400, "bad_request", "Bad Request"],
    [413, "payload_too_large", "Payload Too Large"],
  ])(
    "keeps the %i status of a body-parser error without its message",
    (statusCode, code, message) => {
      const exception = bodyParserError(
        statusCode,
        `Unexpected token in "{secret"`,
      );

      expect(toApiErrorResponse(exception)).toEqual({
        statusCode,
        code,
        message,
      });
    },
  );
});
