import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiProperty,
  ApiServiceUnavailableResponse,
} from "@nestjs/swagger";
import { PrismaService } from "./database/prisma.service.js";
import { ApiErrorResponse } from "./errors/api-error-response.js";

class HealthResponse {
  @ApiProperty({ enum: ["ok"] })
  status!: "ok";
}

@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Liveness: the process answers. Never touches the database. */
  @Get()
  @ApiOkResponse({ type: HealthResponse })
  check(): HealthResponse {
    return { status: "ok" };
  }

  /** Readiness: the database answers a trivial query. */
  @Get("ready")
  @ApiOkResponse({ type: HealthResponse })
  @ApiServiceUnavailableResponse({ type: ApiErrorResponse })
  async ready(): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      // Name and code only (e.g. ECONNREFUSED, P2010): driver messages can
      // contain parts of the connection string, such as the user name.
      const { name, code } = error as { name?: unknown; code?: unknown };
      this.logger.warn(
        `Database unreachable: ${String(name)} (${String(code)})`,
      );
      throw new ServiceUnavailableException();
    }
    return { status: "ok" };
  }
}
