import { Module } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { DatabaseModule } from "./database/database.module.js";
import { ApiExceptionFilter } from "./errors/api-exception.filter.js";
import { createValidationPipe } from "./errors/request-validation.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  // Registered here rather than in main.ts so that tests built from AppModule
  // validate and format errors exactly like the running app (ADR-0002).
  providers: [
    { provide: APP_PIPE, useFactory: createValidationPipe },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
