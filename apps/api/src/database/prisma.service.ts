import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { readDatabaseUrl } from "./database-url.js";

// Prisma 7 uses pg's default connection timeout, 0 (wait forever); 5 s was
// Prisma 6's default (Prisma PostgreSQL docs).
const CONNECTION_TIMEOUT_MS = 5_000;

/**
 * The application's only Prisma client. It connects lazily on the first
 * query, so the API starts while the database is unreachable.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: readDatabaseUrl(process.env),
        connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
      }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
