import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/** One request property that failed validation (ADR-0002 §4). */
export class FieldError {
  @ApiProperty({
    description: "Property path",
    example: "answers.0.value",
  })
  field!: string;

  @ApiProperty({
    description: "Names of the failed class-validator constraints",
    type: [String],
    example: ["isInt", "min"],
  })
  constraints!: string[];
}

/**
 * The body of every error response (ADR-0002 §4). The web app translates
 * `code` and `constraints` into uz/ru/en; `message` is for developers and logs.
 */
export class ApiErrorResponse {
  @ApiProperty({ description: "The HTTP status", example: 400 })
  statusCode!: number;

  @ApiProperty({
    description:
      "Stable identifier that clients translate: validation_failed, internal_error (every 500), or the snake-cased HTTP status name (not_found, bad_request, service_unavailable, …)",
    example: "validation_failed",
  })
  code!: string;

  @ApiProperty({
    description: "English text for developers; never shown to users",
    example: "Request validation failed",
  })
  message!: string;

  @ApiPropertyOptional({
    description: "Present only when code is validation_failed",
    type: [FieldError],
  })
  errors?: FieldError[];
}
