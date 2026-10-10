/** One request property that failed validation (ADR-0002 §4). */
export class FieldError {
  /** Property path, e.g. "targetBand" or "answers.0.value". */
  field!: string;
  /** Names of the failed class-validator constraints, e.g. ["isInt", "min"]. */
  constraints!: string[];
}

/**
 * The body of every error response (ADR-0002 §4). The web app translates
 * `code` and `constraints` into uz/ru/en; `message` is for developers and logs.
 *
 * Codes: `validation_failed`, `internal_error` (every 500), and the
 * snake-cased HTTP status name for any other status (`not_found`,
 * `bad_request`, `service_unavailable`, …).
 */
export class ApiErrorResponse {
  statusCode!: number;
  code!: string;
  message!: string;
  /** Present only when `code` is `validation_failed`. */
  errors?: FieldError[];
}
