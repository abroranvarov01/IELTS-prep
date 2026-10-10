import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { STATUS_CODES } from "node:http";
import { ApiErrorResponse } from "./api-error-response.js";
import { RequestValidationException } from "./request-validation.js";

/** Every error leaves the API in the ADR-0002 §4 format. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const body = toApiErrorResponse(exception);

    if (body.code === "internal_error") {
      // Method and path only: query strings and bodies may hold personal data.
      const request = context.getRequest<unknown>();
      const route = `${httpAdapter.getRequestMethod(request)} ${httpAdapter.getRequestUrl(request).split("?")[0]}`;
      this.logger.error(
        `${route} failed`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }
    httpAdapter.reply(context.getResponse(), body, body.statusCode);
  }
}

export function toApiErrorResponse(exception: unknown): ApiErrorResponse {
  if (exception instanceof RequestValidationException) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      code: "validation_failed",
      message: exception.message,
      errors: exception.fieldErrors,
    };
  }
  const statusCode =
    exception instanceof HttpException
      ? exception.getStatus()
      : isClientHttpError(exception)
        ? exception.statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR;
  if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) return internalError();
  // The standard status text, never the exception's message: framework errors
  // quote client input (NestJS wraps malformed JSON as a BadRequestException
  // with the parser's message, and its 404 message contains the path).
  return {
    statusCode,
    code: codeFor(statusCode),
    message: STATUS_CODES[statusCode] ?? "Request failed",
  };
}

function internalError(): ApiErrorResponse {
  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    code: "internal_error",
    message: "Internal server error",
  };
}

function codeFor(statusCode: number): string {
  const name = (HttpStatus as Record<number, string | undefined>)[statusCode];
  return name ? name.toLowerCase() : `http_${statusCode}`;
}

/**
 * Errors from Express middleware that NestJS does not wrap, e.g. a body that is
 * too large: the "http-errors" signature, limited to 4xx.
 */
function isClientHttpError(
  exception: unknown,
): exception is Error & { statusCode: number } {
  if (!(exception instanceof Error)) return false;
  const { statusCode, expose } = exception as {
    statusCode?: unknown;
    expose?: unknown;
  };
  return (
    typeof expose === "boolean" &&
    typeof statusCode === "number" &&
    statusCode >= 400 &&
    statusCode < 500
  );
}
