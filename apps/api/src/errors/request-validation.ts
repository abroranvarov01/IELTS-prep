import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import { FieldError } from "./api-error-response.js";

/** Thrown by the global ValidationPipe; carries the failed fields, never their values. */
export class RequestValidationException extends BadRequestException {
  constructor(readonly fieldErrors: FieldError[]) {
    super("Request validation failed");
  }
}

/** Flattens class-validator's error tree into one entry per failed property path. */
function toFieldErrors(
  errors: ValidationError[],
  parentPath = "",
): FieldError[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const own: FieldError[] = error.constraints
      ? [{ field, constraints: Object.keys(error.constraints) }]
      : [];
    return [...own, ...toFieldErrors(error.children ?? [], field)];
  });
}

/** The one global ValidationPipe, with the options of ADR-0002 §3. */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    exceptionFactory: (errors) =>
      new RequestValidationException(toFieldErrors(errors)),
  });
}
